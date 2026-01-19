'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, UserProfile } from '@clerk/nextjs';
import { useProfile } from '@/providers/ProfileProvider';
import { useDevMode, DevBorderColor } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';
import { ProfileTab } from '@/components/account';
import { UserAnalyticsView } from '@/components/analytics/UserAnalyticsView';
import { UserDemographics } from '@/components/analytics/UserDemographics';
import { TextbookAnalytics } from '@/components/analytics/TextbookAnalytics';

type TabType = 'profile' | 'security' | 'analytics' | 'admin-users' | 'admin-analytics';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { profile, isLoading: isProfileLoading, isAdmin, updateProfile } = useProfile();
  const { devBorder } = useDevMode();
  const router = useRouter();

  const isLoading = !isUserLoaded || isProfileLoading;

  // Redirect if not authenticated
  useEffect(() => {
    if (isUserLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isUserLoaded, isSignedIn, router]);

  if (isLoading) {
    return (
      <TextbookLayout>
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <p style={{ color: 'var(--muted-text)' }}>Loading...</p>
        </div>
      </TextbookLayout>
    );
  }

  if (!isSignedIn || !user) {
    return null;
  }

  const userEmail = user.emailAddresses?.[0]?.emailAddress || '';

  const userTabs: { id: TabType; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'analytics', label: 'Your Activity' },
  ];

  const adminTabs: { id: TabType; label: string }[] = [
    { id: 'admin-users', label: 'User Demographics' },
    { id: 'admin-analytics', label: 'Textbook Analytics' },
  ];

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] py-8 px-8 ${devBorder('blue')}`}>
        <div className={`w-full max-w-4xl mx-auto ${devBorder('green')}`}>
          {/* Title */}
          <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            Account
          </h1>

          {/* Mobile: Dropdown select */}
          <div className="md:hidden mb-6">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="w-full px-4 py-3 rounded-lg text-base font-medium outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1rem',
                paddingRight: '2.5rem',
              }}
            >
              {userTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
              {isAdmin && adminTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>

          {/* Desktop: Tab bar */}
          <div className="hidden md:block mb-6">
            <div className="flex items-center gap-6 border-b" style={{ borderColor: 'var(--card-border)' }}>
              {userTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-base font-medium cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-b-2'
                      : ''
                  }`}
                  style={{
                    color: activeTab === tab.id ? 'var(--berkeley-blue)' : 'var(--muted-text)',
                    borderColor: activeTab === tab.id ? 'var(--berkeley-blue)' : 'transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}

              {isAdmin && (
                <>
                  <div className="h-6 w-px" style={{ backgroundColor: 'var(--card-border)' }} />
                  {adminTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-base font-medium cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-b-2'
                          : ''
                      }`}
                      style={{
                        color: activeTab === tab.id ? 'var(--berkeley-blue)' : 'var(--muted-text)',
                        borderColor: activeTab === tab.id ? 'var(--berkeley-blue)' : 'transparent',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              email={userEmail}
              updateProfile={updateProfile}
              devBorder={devBorder}
            />
          )}
          {activeTab === 'security' && (
            <SecurityTab devBorder={devBorder} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab devBorder={devBorder} />
          )}
          {activeTab === 'admin-users' && (
            <AdminUsersTab devBorder={devBorder} />
          )}
          {activeTab === 'admin-analytics' && (
            <AdminAnalyticsTab devBorder={devBorder} />
          )}

        </div>
      </div>
    </TextbookLayout>
  );
}

// Security Tab - embeds Clerk's UserProfile for password/email management
function SecurityTab({
  devBorder,
}: {
  devBorder: (color: DevBorderColor) => string;
}) {
  return (
    <div className={devBorder('purple')}>
      <UserProfile
        appearance={{
          elements: {
            rootBox: { width: '100%' },
            card: {
              boxShadow: 'none',
              width: '100%',
            },
            navbar: { display: 'none' },
            navbarMobileMenuButton: { display: 'none' },
            headerTitle: { display: 'none' },
            headerSubtitle: { display: 'none' },
          },
        }}
      />
    </div>
  );
}

// Analytics Tab Component - simple wrapper
function AnalyticsTab({
  devBorder,
}: {
  devBorder: (color: DevBorderColor) => string;
}) {
  return <UserAnalyticsView devBorder={devBorder} />;
}

// Admin Users Tab Component - simple wrapper
function AdminUsersTab({
  devBorder,
}: {
  devBorder: (color: DevBorderColor) => string;
}) {
  return <UserDemographics devBorder={devBorder} />;
}

// Admin Textbook Analytics Tab Component - simple wrapper
function AdminAnalyticsTab({
  devBorder,
}: {
  devBorder: (color: DevBorderColor) => string;
}) {
  return <TextbookAnalytics devBorder={devBorder} />;
}
