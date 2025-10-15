import { ReportGenerator } from '@/components/dashboard/report-generator';

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Gerador de Relatórios</h1>
        <p className="text-muted-foreground">Use IA para gerar relatórios de comparecimento detalhados.</p>
      </div>
      <ReportGenerator />
    </div>
  );
}
