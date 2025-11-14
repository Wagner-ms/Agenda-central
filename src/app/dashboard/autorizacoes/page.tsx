'use client';

import { AuthorizationsTable } from '@/components/dashboard/authorizations-table';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { Authorization } from '@/lib/types';

export default function AuthorizationsPage() {
  const firestore = useFirestore();
  // State name is now more generic as it handles distributed authorizations
  const [distributedAuthorizations, setDistributedAuthorizations] = useState<Authorization[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This query now fetches leads distributed to the coordinator.
  // In a real app, 'coord_portao' would be dynamically determined based on the logged-in user.
  const authorizationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'authorizations'), 
        where('status', '==', 'distribuido'),
        where('coordenadoraId', '==', 'coord_portao') // Filters for this specific coordinator
    );
  }, [firestore]);

  useEffect(() => {
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
  }, [authorizationsQuery]);


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
        <h1 className="text-2xl font-bold tracking-tight font-headline">Leads para Liberação</h1>
        <p className="text-muted-foreground">Revise os cadastros recebidos e libere para a equipe de telemarketing.</p>
      </div>
      <AuthorizationsTable data={distributedAuthorizations || []} />
    </div>
  );
}
