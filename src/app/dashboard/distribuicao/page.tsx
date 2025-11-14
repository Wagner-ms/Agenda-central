'use client';

import { useCollection } from '@/firebase';
import { DistributionTable } from '@/components/dashboard/distribution-table';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { Authorization } from '@/lib/types';

export default function DistributionPage() {
  const firestore = useFirestore();
  const [pendingAuthorizations, setPendingAuthorizations] = useState<Authorization[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This query fetches all leads that are new and waiting for distribution
  const authorizationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'authorizations'), where('status', '==', 'pendente'));
  }, [firestore]);

  useEffect(() => {
    if (!authorizationsQuery) {
        setIsLoading(false);
        return;
    }

    const unsubscribe = onSnapshot(authorizationsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Authorization));
        setPendingAuthorizations(data);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching pending authorizations for distribution:", error);
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
        <h1 className="text-2xl font-bold tracking-tight font-headline">Distribuição de Leads</h1>
        <p className="text-muted-foreground">Selecione os cadastros e atribua a uma coordenadora.</p>
      </div>
      <DistributionTable data={pendingAuthorizations || []} />
    </div>
  );
}
