'use client';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Authorization } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

function ScheduleDialog({ authorization }: { authorization: Authorization }) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date>();
  const { toast } = useToast();

  const handleSchedule = () => {
    // In a real app, this would be a server action to update Firestore
    if (!date) {
        toast({
            title: 'Erro',
            description: 'Por favor, selecione uma data para o agendamento.',
            variant: 'destructive',
        });
        return;
    }
    toast({
      title: 'Agendamento realizado!',
      description: `Visita de ${authorization.nomeAluno} agendada com sucesso.`,
      className: 'bg-accent text-accent-foreground',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Phone className="mr-2 h-4 w-4" /> Agendar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar visita para {authorization.nomeAluno}</DialogTitle>
          <DialogDescription>
            Responsável: {authorization.nomeResponsavel} - {authorization.telefone}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal col-span-3",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">Hora</Label>
            <Input id="time" type="time" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">Observações</Label>
            <Textarea id="notes" className="col-span-3" placeholder="Ex: Confirmou presença, virá com a mãe..." />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSchedule}>Salvar agendamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SchedulingTable({ data }: { data: Authorization[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Liberados</CardTitle>
        <CardDescription>{data.length} leads prontos para agendamento.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead className="hidden md:table-cell">Escola</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length > 0 ? data.map((auth) => (
                <TableRow key={auth.id}>
                    <TableCell className="font-medium">{auth.nomeAluno}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{auth.escola}</TableCell>
                    <TableCell>{auth.nomeResponsavel}</TableCell>
                    <TableCell className="hidden sm:table-cell">{auth.telefone}</TableCell>
                    <TableCell><Badge variant="outline" className="border-primary/50 text-primary">{auth.status}</Badge></TableCell>
                    <TableCell className="text-right">
                    <ScheduleDialog authorization={auth} />
                    </TableCell>
                </TableRow>
                )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum lead liberado no momento.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
