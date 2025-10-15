'use client';

import { useCollection } from '@/firebase';
import { AuthorizationsTable } from '@/components/dashboard/authorizations-table';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthorizationsPage() {
  const firestore = useFirestore();

  const authorizationsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'authorizations'), where('status', '==', 'pendente'));
  }, [firestore]);

  const { data: pendingAuthorizations, isLoading } = useCollection(authorizationsQuery);

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
        <h1 className="text-2xl font-bold tracking-tight font-headline">Autorizações Pendentes</h1>
        <p className="text-muted-foreground">Revise e libere novos cadastros para a equipe de telemarketing.</p>
      </div>
      <AuthorizationsTable data={pendingAuthorizations || []} />
    </div>
  );
}
