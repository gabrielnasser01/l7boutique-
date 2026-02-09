'use client';

import { CartProvider } from '@/contexts/cart-context';
import { UserAuthProvider } from '@/contexts/user-auth-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/layout/cart-drawer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <UserAuthProvider>
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </UserAuthProvider>
    </ErrorBoundary>
  );
}
