'use client';

import Link from 'next/link';

interface AccountMenuProps {
  displayName: string;
  userEmail: string;
  onLogout: () => void;
  onClose: () => void;
}

export default function AccountMenu({ displayName, userEmail, onLogout, onClose }: AccountMenuProps) {
  return (
    <div
      className="absolute right-0 top-11 rounded-lg shadow-xl p-4 w-56 z-50"
      style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
    >
      <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <p className="text-base" style={{ color: 'var(--foreground)' }}>
          {displayName}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-text)' }}>
          {userEmail}
        </p>
      </div>
      <Link
        href="/account"
        onClick={onClose}
        className="block w-full text-left px-2 py-1 rounded text-base hover:bg-[var(--sidebar-hover)] cursor-pointer"
        style={{ color: 'var(--foreground)' }}
      >
        Account
      </Link>
      <button
        onClick={onLogout}
        className="w-full text-left px-2 py-1 rounded text-base hover:bg-[var(--sidebar-hover)] cursor-pointer"
        style={{ color: 'var(--foreground)' }}
      >
        Log Out
      </button>
    </div>
  );
}
