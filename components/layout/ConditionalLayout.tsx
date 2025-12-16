'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import ConditionalFooter from '@/components/layout/ConditionalFooter';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header and footer for dashboard routes
  const isDashboardRoute = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/admin/dashboard') || 
                          pathname?.startsWith('/hr/dashboard');

  return (
    <div className="min-h-screen bg-white">
      {!isDashboardRoute && <Header />}
      {children}
      {!isDashboardRoute && <ConditionalFooter />}
    </div>
  );
}

