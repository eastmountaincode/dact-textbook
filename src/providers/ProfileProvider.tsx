'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  country?: string;
  education_level?: string;
  field_of_study?: string;
  institution_type?: string;
  statistics_use?: string;
  referral_source?: string;
  last_logged_in?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  userRole: string | null;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const currentUserIdRef = useRef<string | null>(null);
  const supabase = createClient();

  const isAdmin = userRole === 'admin';

  // Fetch user profile from user_profiles table
  const fetchProfile = async (clerkUserId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', clerkUserId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data as UserProfile | null;
  };

  // Fetch user role from user_roles table
  const fetchUserRole = async (clerkUserId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', clerkUserId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error.message);
      return null;
    }
    return data?.role ?? null;
  };

  // Update last_logged_in timestamp in user_profiles
  const trackLogin = async (clerkUserId: string) => {
    // Check if we've already tracked this session's login
    const sessionKey = `login_tracked_${clerkUserId}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ last_logged_in: new Date().toISOString() })
      .eq('id', clerkUserId);

    if (error) {
      console.error('Error tracking login:', error.message);
    } else {
      // Mark this session's login as tracked
      sessionStorage.setItem(sessionKey, 'true');
    }
  };

  // Ensure user_roles entry exists (for users who signed up before this was added)
  const ensureUserRole = async (clerkUserId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', clerkUserId)
      .maybeSingle();

    if (!data) {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: clerkUserId, role: 'student' });

      if (error) {
        console.error('Error creating user role:', error.message);
      }
    }
  };

  // Create or update profile when user signs up/in via Clerk
  const ensureProfile = async (clerkUser: NonNullable<typeof user>) => {
    const clerkUserId = clerkUser.id;

    // Check if profile exists
    let profileData = await fetchProfile(clerkUserId);

    if (!profileData) {
      // Create new profile from Clerk user data
      const newProfile = {
        id: clerkUserId,
        first_name: clerkUser.firstName || undefined,
        last_name: clerkUser.lastName || undefined,
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(newProfile, { onConflict: 'id' });

      if (error) {
        console.error('Error creating profile:', error.message);
      } else {
        profileData = await fetchProfile(clerkUserId);
      }
    }

    return profileData;
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!isClerkLoaded) return;

      if (user) {
        // Only fetch if different user or first load
        if (currentUserIdRef.current !== user.id) {
          currentUserIdRef.current = user.id;
          setIsLoading(true);

          try {
            const profileData = await ensureProfile(user);
            setProfile(profileData);

            // Ensure user_roles entry exists
            await ensureUserRole(user.id);
            const role = await fetchUserRole(user.id);
            setUserRole(role);

            // Track login (uses sessionStorage to avoid duplicates)
            await trackLogin(user.id);
          } catch (err) {
            console.error('Error loading profile:', err);
          } finally {
            setIsLoading(false);
          }
        }
      } else {
        // User signed out
        currentUserIdRef.current = null;
        setProfile(null);
        setUserRole(null);
        setIsLoading(false);
      }
    };

    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isClerkLoaded]);

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', user.id);

    if (error) {
      return { error: error as unknown as Error };
    }

    // Refresh the profile data
    const updatedProfile = await fetchProfile(user.id);
    setProfile(updatedProfile);

    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading: !isClerkLoaded || isLoading,
        isAdmin,
        userRole,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
