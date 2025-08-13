
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TowercoHeader from './header';
import type { User } from '@/types';

export default function TowercoLayout({
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
        // Towerco/MNO roles are 'T' and 'O'
        if (user.role === 'SA' || user.role === 'SG') {
          // If user has an Agency role, redirect them from the towerco portal
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
      <TowercoHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
