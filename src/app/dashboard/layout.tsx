'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [isUserLoading, user, router]);


  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Skeleton className="h-8 w-full" />
        </header>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Skeleton className="h-[80vh] w-full" />
          </main>
        </div>
      </div>
    );
  }

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
