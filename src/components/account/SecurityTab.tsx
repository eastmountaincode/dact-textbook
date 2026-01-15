'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { DevBorderColor } from '@/providers/DevModeProvider';

interface SecurityTabProps {
  updatePassword: ReturnType<typeof useAuth>['updatePassword'];
  deleteAccount: ReturnType<typeof useAuth>['deleteAccount'];
  devBorder: (color: DevBorderColor) => string;
}

export function SecurityTab({ updatePassword, deleteAccount, devBorder }: SecurityTabProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Delete account state
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    setDeleteError(null);

    const { error } = await deleteAccount();

    if (error) {
      setDeleteError(error.message);
      setIsDeleting(false);
    } else {
      router.push('/');
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--foreground)',
  };

  return (
    <>
    <div
      ref={formRef}
      className={`rounded-xl p-8 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', scrollMarginTop: '5rem' }}
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
              color: message.type === 'success' ? 'var(--callout-note-border)' : '#dc2626',
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
          className="px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 cursor-pointer hover:opacity-90"
          style={{ backgroundColor: 'var(--berkeley-blue)' }}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>

    {/* Delete Account Section - Collapsible */}
    <div
      className={`rounded-xl mt-6 ${devBorder('purple')}`}
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <button
        onClick={() => {
          setShowDeleteSection(!showDeleteSection);
          if (!showDeleteSection) {
            setDeleteConfirmText('');
            setDeleteError(null);
          }
        }}
        className="w-full p-6 flex items-center justify-between cursor-pointer text-left"
      >
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Delete Account
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-text)' }}>
            Permanently delete your account and all associated data
          </p>
        </div>
        <svg
          className={`w-5 h-5 flex-shrink-0 ${showDeleteSection ? 'rotate-180' : ''}`}
          style={{ color: 'var(--muted-text)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDeleteSection && (
        <div className="px-6 pb-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-sm mt-4 mb-4" style={{ color: 'var(--muted-text)' }}>
            This action cannot be undone. All your data, including reading progress and account information, will be permanently removed.
          </p>

          {deleteError && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--callout-warning-bg)',
                color: 'var(--foreground)',
                border: '1px solid var(--callout-warning-border)',
              }}
            >
              {deleteError}
            </div>
          )}

          <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>
            Type <strong>DELETE</strong> to confirm
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none mb-4 max-w-xs"
            style={inputStyle}
          />

          <div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              className="px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: '#dc2626' }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
