'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { SchedulingTable } from '@/components/dashboard/scheduling-table';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function SchedulingPage() {
  const firestore = useFirestore();

  const releasedAuthorizationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'authorizations'), where('status', '==', 'liberado'));
  }, [firestore]);

  const { data: releasedAuthorizations, isLoading } = useCollection(releasedAuthorizationsQuery);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </div>
        <div className="border rounded-lg p-4">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Leads para Agendamento</h1>
        <p className="text-muted-foreground">Entre em contato com os responsáveis e agende uma visita.</p>
      </div>
      <SchedulingTable data={releasedAuthorizations || []} />
    </div>
  );
}
