'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useDevMode, DevBorderColor } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';
import { ProfileTab, SecurityTab } from '@/components/account';
import { UserAnalyticsView } from '@/components/analytics/UserAnalyticsView';
import { UserDemographics } from '@/components/analytics/UserDemographics';
import { TextbookAnalytics } from '@/components/analytics/TextbookAnalytics';

type TabType = 'profile' | 'security' | 'analytics' | 'admin-users' | 'admin-analytics';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { user, profile, isLoading, isAdmin, updateProfile, updatePassword, deleteAccount } = useAuth();
  const { devBorder } = useDevMode();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <TextbookLayout>
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <p style={{ color: 'var(--muted-text)' }}>Loading...</p>
        </div>
      </TextbookLayout>
    );
  }

  if (!user) {
    return null;
  }

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
      <div className={`min-h-[calc(100vh-3.5rem)] pt-12 pb-12 px-8 ${devBorder('blue')}`}>
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
              className="w-full px-4 py-3 rounded-lg text-sm font-medium outline-none cursor-pointer"
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
                  className={`pb-3 text-sm font-medium cursor-pointer ${
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
                      className={`pb-3 text-sm font-medium cursor-pointer ${
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
              email={user.email}
              updateProfile={updateProfile}
              devBorder={devBorder}
            />
          )}
          {activeTab === 'security' && (
            <SecurityTab
              updatePassword={updatePassword}
              deleteAccount={deleteAccount}
              devBorder={devBorder}
            />
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
