'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useDevMode, DevBorderColor } from '@/providers/DevModeProvider';
import TextbookLayout from '@/components/TextbookLayout';

const STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Professional' },
  { value: 'educator', label: 'Educator' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'other', label: 'Other' },
];

const EDUCATION_OPTIONS = [
  { value: '', label: 'Select level' },
  { value: 'high_school', label: 'High School' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'phd', label: 'PhD' },
  { value: 'professional', label: 'Professional' },
];

const FIELD_OPTIONS = [
  { value: '', label: 'Select field' },
  { value: 'economics', label: 'Economics' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'business', label: 'Business' },
  { value: 'social_sciences', label: 'Social Sciences' },
  { value: 'natural_sciences', label: 'Natural Sciences' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'other', label: 'Other' },
];

const INSTITUTION_OPTIONS = [
  { value: '', label: 'Select type' },
  { value: 'university', label: 'University' },
  { value: 'community_college', label: 'Community College' },
  { value: 'company', label: 'Company' },
  { value: 'government', label: 'Government' },
  { value: 'self_study', label: 'Self-study' },
  { value: 'other', label: 'Other' },
];

const COUNTRY_OPTIONS = [
  { value: '', label: 'Select country' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'OTHER', label: 'Other' },
];

type TabType = 'profile' | 'security' | 'analytics' | 'delete' | 'admin-users' | 'admin-analytics' | 'admin-content';

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
    { id: 'delete', label: 'Delete Account' },
  ];

  const adminTabs: { id: TabType; label: string }[] = [
    { id: 'admin-users', label: 'User Analytics' },
    { id: 'admin-analytics', label: 'Textbook Analytics' },
    { id: 'admin-content', label: 'Content Management' },
  ];

  return (
    <TextbookLayout>
      <div className={`min-h-[calc(100vh-3.5rem)] pt-12 pb-12 px-4 ${devBorder('blue')}`}>
        <div className={`w-full max-w-4xl mx-auto ${devBorder('green')}`}>
          {/* Title */}
          <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            Account
          </h1>

          {/* User Tabs */}
          <div className="flex gap-6 border-b mb-6" style={{ borderColor: 'var(--card-border)' }}>
            {userTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
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
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="mt-8 mb-4">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Admin
                </h2>
              </div>
              <div className="flex gap-6 border-b mb-6" style={{ borderColor: 'var(--card-border)' }}>
                {adminTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
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
              </div>
            </>
          )}

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
              devBorder={devBorder}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab devBorder={devBorder} />
          )}
          {activeTab === 'delete' && (
            <DeleteTab
              deleteAccount={deleteAccount}
              devBorder={devBorder}
            />
          )}
          {activeTab === 'admin-users' && (
            <AdminUsersTab devBorder={devBorder} />
          )}
          {activeTab === 'admin-analytics' && (
            <AdminAnalyticsTab devBorder={devBorder} />
          )}
          {activeTab === 'admin-content' && (
            <AdminContentTab devBorder={devBorder} />
          )}
        </div>
      </div>
    </TextbookLayout>
  );
}

// Profile Tab Component
function ProfileTab({
  profile,
  email,
  updateProfile,
  devBorder,
}: {
  profile: ReturnType<typeof useAuth>['profile'];
  email: string | undefined;
  updateProfile: ReturnType<typeof useAuth>['updateProfile'];
  devBorder: (color: DevBorderColor) => string;
}) {
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    status: profile?.status || '',
    country: profile?.country || '',
    educationLevel: profile?.education_level || '',
    fieldOfStudy: profile?.field_of_study || '',
    institutionType: profile?.institution_type || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        status: profile.status || '',
        country: profile.country || '',
        educationLevel: profile.education_level || '',
        fieldOfStudy: profile.field_of_study || '',
        institutionType: profile.institution_type || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await updateProfile({
      first_name: formData.firstName || undefined,
      last_name: formData.lastName || undefined,
      status: formData.status || undefined,
      country: formData.country || undefined,
      education_level: formData.educationLevel || undefined,
      field_of_study: formData.fieldOfStudy || undefined,
      institution_type: formData.institutionType || undefined,
    });

    setIsLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--foreground)',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1rem',
    paddingRight: '2.5rem',
  };

  return (
    <div
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <form onSubmit={handleSubmit}>
        {message && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: message.type === 'success' ? 'var(--callout-note-bg)' : 'var(--callout-warning-bg)',
              color: message.type === 'success' ? '#16a34a' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? 'var(--callout-note-border)' : 'var(--callout-warning-border)'}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Email (read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Email
          </label>
          <input
            type="email"
            value={email || ''}
            disabled
            className="w-full px-4 py-3 rounded-lg text-sm outline-none opacity-60 cursor-not-allowed"
            style={inputStyle}
          />
        </div>

        {/* Name row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Status and Country row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Education and Field row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="educationLevel" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Education Level
            </label>
            <select
              id="educationLevel"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {EDUCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fieldOfStudy" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Field of Study/Work
            </label>
            <select
              id="fieldOfStudy"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {FIELD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Institution Type */}
        <div className="mb-6">
          <label htmlFor="institutionType" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Institution Type
          </label>
          <select
            id="institutionType"
            name="institutionType"
            value={formData.institutionType}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer md:w-1/2"
            style={selectStyle}
          >
            {INSTITUTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: 'var(--berkeley-blue)' }}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

// Security Tab Component
function SecurityTab({
  updatePassword,
  devBorder,
}: {
  updatePassword: ReturnType<typeof useAuth>['updatePassword'];
  devBorder: (color: DevBorderColor) => string;
}) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(formData.currentPassword, formData.newPassword);

    setIsLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--foreground)',
  };

  return (
    <div
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        Change Password
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-text)' }}>
        Update your password
      </p>

      <form onSubmit={handleSubmit} className="max-w-md">
        {message && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: message.type === 'success' ? 'var(--callout-note-bg)' : 'var(--callout-warning-bg)',
              color: message.type === 'success' ? '#16a34a' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? 'var(--callout-note-border)' : 'var(--callout-warning-border)'}`,
            }}
          >
            {message.text}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="currentPassword" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            placeholder="Min 8 characters"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: 'var(--berkeley-blue)' }}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// Delete Tab Component
function DeleteTab({
  deleteAccount,
  devBorder,
}: {
  deleteAccount: ReturnType<typeof useAuth>['deleteAccount'];
  devBorder: (color: DevBorderColor) => string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;

    setIsLoading(true);
    setError(null);

    const { error } = await deleteAccount();

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <div
        className={`rounded-xl p-8 ${devBorder('purple')}`}
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--callout-warning-border)' }}
      >
        <h2 className="text-lg font-semibold mb-1" style={{ color: '#dc2626' }}>
          Delete Account
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-text)' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 rounded-lg font-medium text-white transition-opacity cursor-pointer"
          style={{ backgroundColor: '#dc2626' }}
        >
          Delete My Account
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-full max-w-md rounded-xl p-6 shadow-xl"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#dc2626' }}>
              Delete Account
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-text)' }}>
              This will permanently delete your account, progress, and all associated data. This action cannot be undone.
            </p>

            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--callout-warning-bg)',
                  color: '#dc2626',
                  border: '1px solid var(--callout-warning-border)',
                }}
              >
                {error}
              </div>
            )}

            <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>
              Type <strong>DELETE</strong> to confirm
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4"
              style={{
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText('');
                  setError(null);
                }}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-opacity cursor-pointer"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--foreground)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isLoading}
                className="flex-1 px-4 py-3 rounded-lg font-medium text-white transition-opacity disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: '#dc2626' }}
              >
                {isLoading ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Analytics Tab Component (Placeholder)
function AnalyticsTab({
  devBorder,
}: {
  devBorder: (color: DevBorderColor) => string;
}) {
  return (
    <div
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        Your Activity
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-text)' }}>
        Track your reading progress and engagement
      </p>

      {/* Placeholder content */}
      <div className="space-y-6">
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Reading Time</h3>
            <span className="text-2xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>--</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Total time spent reading
          </p>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Chapters Visited</h3>
            <span className="text-2xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>--</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Unique chapters you&apos;ve read
          </p>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Last Active</h3>
            <span className="text-2xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>--</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Your most recent session
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-center" style={{ color: 'var(--muted-text)' }}>
        Analytics will be available once you start reading.
      </p>
    </div>
  );
}

// Admin Users Tab Component (Placeholder)
function AdminUsersTab({
  devBorder,
}: {
  devBorder: (color: DevBorderColor) => string;
}) {
  return (
    <div
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        User Analytics
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-text)' }}>
        View and analyze user data across the platform
      </p>

      {/* Placeholder content */}
      <div className="space-y-6">
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Total Users</h3>
            <span className="text-2xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>--</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Registered accounts
          </p>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Users by Status</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Student, Professional, Educator breakdown will appear here
          </p>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Users by Country</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Geographic distribution will appear here
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-center" style={{ color: 'var(--muted-text)' }}>
        User analytics coming soon.
      </p>
    </div>
  );
}

// Admin Analytics Tab Component (Placeholder)
function AdminAnalyticsTab({
  devBorder,
}: {
  devBorder: (color: DevBorderColor) => string;
}) {
  return (
    <div
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        Textbook Analytics
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-text)' }}>
        View reading patterns and engagement across chapters
      </p>

      {/* Placeholder content */}
      <div className="space-y-6">
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Total Reading Time</h3>
            <span className="text-2xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>--</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Aggregate time across all users
          </p>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Most Popular Chapters</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Chapter popularity rankings will appear here
          </p>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Reading Time by Chapter</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Time distribution across chapters will appear here
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-center" style={{ color: 'var(--muted-text)' }}>
        Textbook analytics coming soon.
      </p>
    </div>
  );
}

// Admin Content Tab Component (Placeholder)
function AdminContentTab({
  devBorder,
}: {
  devBorder: (color: DevBorderColor) => string;
}) {
  return (
    <div
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        Content Management
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-text)' }}>
        Manage chapters and textbook content
      </p>

      {/* Placeholder content */}
      <div className="space-y-6">
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Chapters</h3>
            <span className="text-2xl font-semibold" style={{ color: 'var(--berkeley-blue)' }}>--</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Total published chapters
          </p>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
        >
          <h3 className="font-medium mb-4" style={{ color: 'var(--foreground)' }}>Chapter List</h3>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Chapter management interface will appear here
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-center" style={{ color: 'var(--muted-text)' }}>
        Content management coming soon.
      </p>
    </div>
  );
}
