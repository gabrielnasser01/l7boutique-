'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '@/lib/types';

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('l7_admin');
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        localStorage.removeItem('l7_admin');
      }
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.rpc('verify_admin_login', {
        p_username: username.trim(),
        p_password: password,
      });

      if (error || !data) return false;

      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (!parsed || !parsed.id) return false;

      const user: AdminUser = {
        id: parsed.id,
        username: parsed.username,
        name: parsed.name,
        email: parsed.email,
      };
      setAdmin(user);
      localStorage.setItem('l7_admin', JSON.stringify(user));
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    setAdmin(null);
    localStorage.removeItem('l7_admin');
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
