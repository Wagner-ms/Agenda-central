import { authorizations } from '@/lib/data';
import { AgendaView } from '@/components/dashboard/agenda-view';

export default function AgendaPage() {
  const scheduledAuthorizations = authorizations.filter(a =>
    a.status === 'agendado' || a.status === 'compareceu' || a.status === 'nao_compareceu' || a.status === 'remarcado'
  );

  return (
    <div className="space-y-4">
       <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Agenda Compartilhada</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os agendamentos.</p>
      </div>
      <AgendaView events={scheduledAuthorizations} />
    </div>
  );
}
