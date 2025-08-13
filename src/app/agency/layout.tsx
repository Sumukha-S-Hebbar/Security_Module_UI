
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AgencyHeader from './header';
import type { User } from '@/types';

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user: User = JSON.parse(userData);
        // Agency roles are 'SA' (Security Agency) and 'SG' (Security Guard)
        if (user.role === 'T' || user.role === 'O') {
          // If user has a Towerco/MNO role, redirect them from agency portal
          router.replace('/');
        }
      } else {
        // If no user data, they shouldn't be here
        router.replace('/');
      }
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <AgencyHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
