'use client';

import type { Authorization, Status } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, RefreshCw, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const themedStatusConfig: { [key in Status]?: { colorClass: string, icon: React.ElementType, label: string } } = {
    agendado: { colorClass: 'text-primary', icon: Clock, label: 'Agendado' },
    compareceu: { colorClass: 'text-[hsl(var(--accent))]', icon: CheckCircle, label: 'Compareceu' },
    nao_compareceu: { colorClass: 'text-destructive', icon: XCircle, label: 'Não Compareceu' },
    remarcado: { colorClass: 'text-[hsl(var(--chart-4))]', icon: RefreshCw, label: 'Remarcado' },
    pendente: { colorClass: 'text-muted-foreground', icon: Clock, label: 'Pendente' },
    liberado: { colorClass: 'text-muted-foreground', icon: Clock, label: 'Liberado' },
};

function EventCard({ event }: { event: Authorization }) {
    const { toast } = useToast();
    const config = themedStatusConfig[event.status];

    const handleStatusChange = (newStatus: Status) => {
        // In a real app, this would be a server action
        toast({
            title: "Status Atualizado",
            description: `${event.nomeAluno} agora está como "${themedStatusConfig[newStatus]?.label}".`,
            className: "bg-accent text-accent-foreground"
        });
    };

    return (
        <Card className="mb-2 text-xs shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm leading-none truncate">{event.nomeAluno}</CardTitle>
                    <p className="text-muted-foreground">{event.horaAgendamento}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {Object.keys(themedStatusConfig).filter(s => ['agendado', 'compareceu', 'nao_compareceu', 'remarcado'].includes(s)).map(statusKey => (
                            <DropdownMenuItem key={statusKey} onClick={() => handleStatusChange(statusKey as Status)}>
                                {themedStatusConfig[statusKey as Status]?.icon && <themedStatusConfig[statusKey as Status]!.icon className={cn("mr-2 h-4 w-4", themedStatusConfig[statusKey as Status]?.colorClass)}/>}
                                <span>{themedStatusConfig[statusKey as Status]?.label}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-2 pt-0 text-muted-foreground">
                <p className="truncate">{event.escola}</p>
            </CardContent>
             <CardFooter className="p-2 pt-0">
                {config && (
                    <div className={cn("flex items-center text-xs gap-1.5 font-medium", config.colorClass)}>
                        <config.icon className="h-3 w-3" />
                        <span>{config.label}</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

export function AgendaView({ events }: { events: Authorization[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStartsOn: 0 | 1 = 1; // Monday
  const start = startOfWeek(currentDate, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const today = () => setCurrentDate(new Date());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevWeek} aria-label="Semana anterior"><ArrowLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={nextWeek} aria-label="Próxima semana"><ArrowRight className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={today}>Hoje</Button>
            <h2 className="text-lg font-semibold font-headline capitalize">
                {format(start, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
        </div>
      </CardHeader>
      <div className="grid grid-cols-7 border-t">
        {weekDays.map((day) => (
            <div key={day.toString()} className="border-b border-r p-2 first:border-l">
              <div className="text-center mb-2">
                  <p className={cn("text-xs text-muted-foreground uppercase", isSameDay(day, new Date()) && "text-primary")}>
                    {format(day, 'eee', { locale: ptBR })}
                  </p>
                  <p className={cn("text-2xl font-bold", isSameDay(day, new Date()) && "text-primary")}>
                    {format(day, 'd')}
                  </p>
              </div>
              <div className="min-h-[200px] space-y-2">
                {events.filter(
                    (e) => e.dataAgendamento && isSameDay(new Date(e.dataAgendamento), day)
                ).sort((a, b) => (a.horaAgendamento || '').localeCompare(b.horaAgendamento || ''))
                .map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            </div>
        ))}
      </div>
    </Card>
  );
}
