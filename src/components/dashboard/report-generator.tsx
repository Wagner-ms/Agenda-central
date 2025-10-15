'use client';

import { useState } from 'react';
import { useFlow } from 'genkit/react';
import { generateAttendanceReport } from '@/ai/flows/generate-attendance-report';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ReportGenerator() {
  const [reportType, setReportType] = useState<'school' | 'agent'>('school');
  const [filterValue, setFilterValue] = useState('');
  const [run, { data, error, loading }] = useFlow(generateAttendanceReport);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterValue) return;

    const input = {
      reportType,
      schoolName: reportType === 'school' ? filterValue : undefined,
      agentId: reportType === 'agent' ? filterValue : undefined,
    };
    run(input);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
            <CardHeader>
            <CardTitle>Configurar Relatório</CardTitle>
            <CardDescription>Escolha os parâmetros para gerar o relatório.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reportType">Tipo de Relatório</Label>
                        <Select onValueChange={(value: 'school' | 'agent') => setReportType(value)} defaultValue={reportType}>
                            <SelectTrigger id="reportType">
                            <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="school">Por Escola</SelectItem>
                            <SelectItem value="agent">Por Atendente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="filterValue">
                            {reportType === 'school' ? 'Nome da Escola' : 'ID do Atendente'}
                        </Label>
                        <Input
                            id="filterValue"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder={reportType === 'school' ? 'Ex: Escola Primária Sol Nascente' : 'Ex: tele_01'}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading || !filterValue} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        Gerar Relatório
                    </Button>
                </CardFooter>
            </form>
        </Card>

        <div className="md:col-span-2">
            {loading && (
                <div className="flex items-center justify-center h-full rounded-lg border border-dashed p-8 bg-card">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Gerando relatório, por favor aguarde...</p>
                    </div>
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                <AlertTitle>Erro ao Gerar Relatório</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            )}
            {data && (
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Relatório Gerado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 font-sans text-sm">{data.report}</pre>
                    </CardContent>
                </Card>
            )}
            {!loading && !data && !error && (
                <div className="flex items-center justify-center h-full rounded-lg border border-dashed p-8 bg-card">
                    <div className="text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Seu relatório aparecerá aqui</h3>
                        <p className="text-muted-foreground">Preencha o formulário e clique em "Gerar Relatório".</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
