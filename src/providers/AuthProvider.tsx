'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  country?: string;
  education_level?: string;
  field_of_study?: string;
  institution_type?: string;
  referral_source?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  setNewPassword: (password: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const supabase = createClient();

  const isAdmin = userRole === 'admin';

  // Fetch user profile from user_profiles table
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message, error.code, error.details);
      return null;
    }
    return data as UserProfile | null;
  };

  // Fetch user role from user_roles table
  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error.message);
      return null;
    }
    return data?.role ?? null;
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
      }

      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // On sign in, sync profile data from user metadata (for new users after email confirmation)
          if (event === 'SIGNED_IN') {
            await syncProfileFromMetadata(session.user);
          }
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
        } else {
          setProfile(null);
          setUserRole(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    // Store profile data in user metadata - it will be synced to profile on first login
    // This works even with email confirmation enabled
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileData, // Store in user_metadata
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) return { error };

    return { error: null };
  };

  // Sync user metadata to profile (called on first login after email confirmation)
  const syncProfileFromMetadata = async (user: User) => {
    const metadata = user.user_metadata;
    if (!metadata || Object.keys(metadata).length === 0) return;

    // Check if profile exists and has data
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, status')
      .eq('id', user.id)
      .maybeSingle();

    // If profile already has data, don't overwrite
    if (existingProfile?.status) return;

    // Sync metadata to profile using upsert (creates row if it doesn't exist)
    const profileData = {
      id: user.id,
      first_name: metadata.first_name,
      last_name: metadata.last_name,
      status: metadata.status,
      country: metadata.country,
      education_level: metadata.education_level,
      field_of_study: metadata.field_of_study,
      institution_type: metadata.institution_type,
      referral_source: metadata.referral_source,
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (error) {
      console.error('Error syncing profile from metadata:', error.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

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

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) return { error: new Error('Not authenticated') };

    // First verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return { error: new Error('Current password is incorrect') };
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    return { error };
  };

  const setNewPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const deleteAccount = async () => {
    if (!user) return { error: new Error('Not authenticated') };

    // Delete user profile first (cascade should handle this, but being explicit)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      return { error: profileError as unknown as Error };
    }

    // Call the delete account edge function or RPC
    // Note: Supabase doesn't allow users to delete themselves directly
    // This requires a server-side function. For now, we'll sign out and
    // the admin can handle the actual deletion, OR use an edge function.
    const { error } = await supabase.rpc('delete_user_account');

    if (error) {
      return { error: error as unknown as Error };
    }

    // Sign out after deletion
    await signOut();

    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAdmin,
        userRole,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePassword,
        resetPassword,
        setNewPassword,
        deleteAccount,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
