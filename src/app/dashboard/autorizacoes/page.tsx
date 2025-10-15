import { authorizations } from '@/lib/data';
import { AuthorizationsTable } from '@/components/dashboard/authorizations-table';

export default function AuthorizationsPage() {
  // In a real app, you'd fetch this data from Firestore
  const pendingAuthorizations = authorizations.filter(a => a.status === 'pendente');
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Autorizações Pendentes</h1>
        <p className="text-muted-foreground">Revise e libere novos cadastros para a equipe de telemarketing.</p>
      </div>
      <AuthorizationsTable data={pendingAuthorizations} />
    </div>
  );
}
