'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { AgendaView } from '@/components/dashboard/agenda-view';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgendaPage() {
  const firestore = useFirestore();

  const scheduledAuthorizationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'authorizations'),
      where('status', 'in', ['agendado', 'compareceu', 'nao_compareceu', 'remarcado'])
    );
  }, [firestore]);

  const { data: scheduledAuthorizations, isLoading } = useCollection(scheduledAuthorizationsQuery);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Agenda Compartilhada</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os agendamentos.</p>
      </div>
       {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <div className="grid grid-cols-7 border-t">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="border-r p-2">
                <div className="text-center mb-2">
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <Skeleton className="h-8 w-8 mx-auto mt-1 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <AgendaView events={scheduledAuthorizations || []} />
      )}
    </div>
  );
}
