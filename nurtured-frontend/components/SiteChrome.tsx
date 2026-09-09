'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';

/**
 * Wraps all routes with the public site chrome (header, footer, breadcrumbs,
 * cookie banner). For /admin/* routes the public chrome is hidden entirely —
 * the admin area provides its own nav and layout.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      {!isAdmin && <Breadcrumbs />}
      {isAdmin ? (
        children
      ) : (
        <main id="main-content" className="flex-1">
          {children}
        </main>
      )}
      {!isAdmin && <Footer />}
      {!isAdmin && <CookieConsent />}
    </>
  );
}