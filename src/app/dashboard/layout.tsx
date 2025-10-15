import type { ReactNode } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <DashboardSidebar />
      <div className="flex flex-col sm:pl-14">
        <DashboardHeader />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
