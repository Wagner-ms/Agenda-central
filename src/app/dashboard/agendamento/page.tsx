import { authorizations } from '@/lib/data';
import { SchedulingTable } from '@/components/dashboard/scheduling-table';

export default function SchedulingPage() {
  const releasedAuthorizations = authorizations.filter(a => a.status === 'liberado');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Leads para Agendamento</h1>
        <p className="text-muted-foreground">Entre em contato com os responsáveis e agende uma visita.</p>
      </div>
      <SchedulingTable data={releasedAuthorizations} />
    </div>
  );
}
