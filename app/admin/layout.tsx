'use client';

import { ReactNode } from 'react';
import { AdminAuthProvider } from '@/contexts/admin-auth-context';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
