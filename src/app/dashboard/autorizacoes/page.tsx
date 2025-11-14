'use client';

import { AuthorizationsTable } from '@/components/dashboard/authorizations-table';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { Authorization } from '@/lib/types';

export default function AuthorizationsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [distributedAuthorizations, setDistributedAuthorizations] = useState<Authorization[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authorizationsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
        collection(firestore, 'authorizations'), 
        where('status', '==', 'distribuido'),
        where('coordenadoraId', '==', user.uid)
    );
  }, [firestore, user?.uid]);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!authorizationsQuery) {
        setIsLoading(false);
        return;
    }

    const unsubscribe = onSnapshot(authorizationsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Authorization));
        setDistributedAuthorizations(data);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching distributed authorizations:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [authorizationsQuery, isUserLoading]);


  if (isLoading || isUserLoading) {
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
        <h1 className="text-2xl font-bold tracking-tight font-headline">Leads para Liberação</h1>
        <p className="text-muted-foreground">Revise os cadastros recebidos e libere para a equipe de telemarketing.</p>
      </div>
      <AuthorizationsTable data={distributedAuthorizations || []} />
    </div>
  );
}
