'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Percent, Target, XCircle, Clock, PhoneOff } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Query } from 'firebase/firestore';
import type { Authorization, Status } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

type ReportFilter = {
  type: 'school' | 'agent' | 'coordinator';
  value: string;
};

interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    description?: string;
    color?: string;
}

function StatsCard({ title, value, icon: Icon, description, color = 'text-primary' }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-5 w-5 text-muted-foreground", color)} />
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", color)}>{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
}


function ReportDashboard({ filter }: { filter: ReportFilter }) {
    const firestore = useFirestore();

    const authorizationsQuery = useMemoFirebase(() => {
        if (!firestore || !filter.value) return null;

        let q: Query = collection(firestore, 'authorizations');
        
        let field: string;
        switch(filter.type) {
            case 'school':
                field = 'escola';
                break;
            case 'agent':
                field = 'atendenteId';
                break;
            case 'coordinator':
                field = 'coordenadoraId';
                break;
            default:
                return null;
        }
        
        q = query(q, where(field, '==', filter.value));
        
        // We are interested in all statuses to calculate the full funnel
        q = query(q, where('status', 'in', ['agendado', 'compareceu', 'nao_compareceu', 'remarcado', 'nao_interessado', 'tel_incorreto']));

        return q;
    }, [firestore, filter]);

    const { data: authorizations, isLoading } = useCollection(authorizationsQuery);

    if (isLoading) {
        return (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[126px]" />
                <Skeleton className="h-[126px]" />
                <Skeleton className="h-[126px]" />
                <Skeleton className="h-[126px]" />
            </div>
        );
    }

    if (!authorizations) {
        return (
            <div className="flex items-center justify-center h-full rounded-lg border border-dashed p-8 bg-card">
                <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum dado encontrado</h3>
                    <p className="text-muted-foreground">Não há registros para o filtro selecionado.</p>
                </div>
            </div>
        );
    }
    
    const total = authorizations.length;
    const attended = authorizations.filter(a => a.status === 'compareceu').length;
    const noShow = authorizations.filter(a => a.status === 'nao_compareceu').length;
    const notInterested = authorizations.filter(a => a.status === 'nao_interessado').length;
    const wrongNumber = authorizations.filter(a => a.status === 'tel_incorreto').length;
    const stillScheduled = authorizations.filter(a => a.status === 'agendado').length;
    
    const totalScheduledAndAttended = attended + noShow + stillScheduled;
    const attendanceRate = totalScheduledAndAttended > 0 ? (attended / (attended + noShow)) * 100 : 0;
    const noShowRate = totalScheduledAndAttended > 0 ? (noShow / (attended + noShow)) * 100 : 0;


    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <StatsCard
                title="Total de Leads Agendados"
                value={totalScheduledAndAttended.toString()}
                description={`${total} leads na base filtrada`}
                icon={Target}
            />
            <StatsCard
                title="Taxa de Comparecimento"
                value={`${attendanceRate.toFixed(1)}%`}
                description={`${attended} compareceram`}
                icon={Percent}
                color="text-green-500"
            />
            <StatsCard
                title="Taxa de Não Comparecimento"
                value={`${noShowRate.toFixed(1)}%`}
                description={`${noShow} não compareceram`}
                icon={Percent}
                color="text-red-500"
            />
             <StatsCard
                title="Ainda Agendados"
                value={stillScheduled.toString()}
                description="Aguardando data da visita"
                icon={Clock}
                color="text-blue-500"
            />
            <StatsCard
                title="Não Interessados"
                value={notInterested.toString()}
                description="Leads que recusaram o contato"
                icon={XCircle}
                color="text-gray-500"
            />
            <StatsCard
                title="Telefone Incorreto"
                value={wrongNumber.toString()}
                description="Leads com número inválido"
                icon={PhoneOff}
                color="text-yellow-600"
            />
        </div>
    )
}

const coordinators = [
    { id: 'coord_portao', name: 'Coordenador Portão' },
];

export function ReportGenerator() {
  const [reportType, setReportType] = useState<'school' | 'agent' | 'coordinator'>('school');
  const [filterValue, setFilterValue] = useState('');
  const [submittedFilter, setSubmittedFilter] = useState<ReportFilter | null>(null);
  const [isPending, setIsPending] = useState(false);

  const firestore = useFirestore();

    const allAuthorizationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'authorizations');
    }, [firestore]);

    const { data: allAuthorizations, isLoading: isLoadingSchools } = useCollection(allAuthorizationsQuery);

    const schoolOptions = useMemo(() => {
        if (!allAuthorizations) return [];
        const schoolNames = allAuthorizations.map(auth => auth.escola).filter(Boolean);
        return [...new Set(schoolNames)];
    }, [allAuthorizations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterValue) return;

    setIsPending(true);
    setSubmittedFilter({ type: reportType, value: filterValue });
    // This is a bit of a trick to show the loading state, as useCollection is very fast
    setTimeout(() => setIsPending(false), 500); 
  };
  
  const handleReportTypeChange = (value: 'school' | 'agent' | 'coordinator') => {
    setReportType(value);
    setFilterValue(''); // Reset filter value when type changes
    setSubmittedFilter(null);
  }

  const handleFilterValueChange = (value: string) => {
    setFilterValue(value);
    setSubmittedFilter(null);
  }

  const renderFilterInput = () => {
    switch (reportType) {
        case 'school':
            return (
                 <Select onValueChange={handleFilterValueChange} value={filterValue} disabled={isPending || isLoadingSchools}>
                    <SelectTrigger id="filterValue">
                        <SelectValue placeholder={isLoadingSchools ? "Carregando escolas..." : "Selecione uma escola"} />
                    </SelectTrigger>
                    <SelectContent>
                        {schoolOptions.map(school => (
                            <SelectItem key={school} value={school}>{school}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case 'coordinator':
             return (
                 <Select onValueChange={handleFilterValueChange} value={filterValue} disabled={isPending}>
                    <SelectTrigger id="filterValue">
                        <SelectValue placeholder={"Selecione um coordenador"} />
                    </SelectTrigger>
                    <SelectContent>
                        {coordinators.map(coord => (
                            <SelectItem key={coord.id} value={coord.id}>{coord.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case 'agent':
             return (
                <Input
                    id="filterValue"
                    value={filterValue}
                    onChange={(e) => handleFilterValueChange(e.target.value)}
                    placeholder={'Ex: tele_01'}
                    disabled={isPending}
                />
            );
        default:
            return null;
    }
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
            <CardTitle>Configurar Relatório</CardTitle>
            <CardDescription>Escolha os parâmetros para gerar o relatório de métricas.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="reportType">Tipo de Relatório</Label>
                        <Select onValueChange={handleReportTypeChange} defaultValue={reportType} disabled={isPending}>
                            <SelectTrigger id="reportType">
                            <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="school">Por Escola</SelectItem>
                            <SelectItem value="coordinator">Por Coordenador</SelectItem>
                            <SelectItem value="agent">Por Atendente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="filterValue">
                            {reportType === 'school' ? 'Nome da Escola' : reportType === 'coordinator' ? 'Coordenador' : 'ID do Atendente'}
                        </Label>
                        {renderFilterInput()}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending || !filterValue} className="w-full md:w-auto">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        Gerar Relatório
                    </Button>
                </CardFooter>
            </form>
        </Card>

        <div>
            {isPending && (
                <div className="flex items-center justify-center h-full rounded-lg border border-dashed p-8 bg-card">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Gerando relatório, por favor aguarde...</p>
                    </div>
                </div>
            )}

            {!isPending && submittedFilter && (
                <ReportDashboard filter={submittedFilter} />
            )}

            {!isPending && !submittedFilter && (
                <div className="flex items-center justify-center h-full rounded-lg border border-dashed p-8 bg-card">
                    <div className="text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Suas métricas aparecerão aqui</h3>
                        <p className="text-muted-foreground">Preencha o formulário e clique em "Gerar Relatório".</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
