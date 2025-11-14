'use client';
import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import type { Authorization, Status } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Phone, MoreHorizontal, AlertCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';

const scheduleSchema = z.object({
  dataAgendamento: z.date({
    required_error: 'A data do agendamento é obrigatória.',
  }),
  horaAgendamento: z.string().min(1, { message: 'A hora do agendamento é obrigatória.' }),
  observacoes: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

function ActionsMenu({ authorization }: { authorization: Authorization }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleStatusUpdate = (status: Status, successMessage: string) => {
    if (!firestore || !user) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao banco de dados ou usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }
    const docRef = doc(firestore, 'authorizations', authorization.id);
    updateDocumentNonBlocking(docRef, {
      status: status,
      atendenteId: user.uid,
      atualizadoEm: serverTimestamp(),
    });

    toast({
      title: 'Status Atualizado!',
      description: `${authorization.nomeAluno}: ${successMessage}`,
      className: 'bg-accent text-accent-foreground',
    });
  }

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      horaAgendamento: '',
      observacoes: '',
    },
  });

  function onScheduleSubmit(values: ScheduleFormValues) {
    if (!firestore || !user) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao banco de dados ou usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }

    const docRef = doc(firestore, 'authorizations', authorization.id);
    updateDocumentNonBlocking(docRef, {
      status: 'agendado',
      dataAgendamento: values.dataAgendamento,
      horaAgendamento: values.horaAgendamento,
      observacoes: values.observacoes,
      atendenteId: user.uid,
      atualizadoEm: serverTimestamp(),
    });

    toast({
      title: 'Agendamento realizado!',
      description: `Visita de ${authorization.nomeAluno} agendada com sucesso.`,
      className: 'bg-accent text-accent-foreground',
    });
    setIsDialogOpen(false);
    form.reset();
  }

  return (
     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
           <DialogTrigger asChild>
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Agendar
              </DropdownMenuItem>
            </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusUpdate('tel_incorreto', 'marcado como telefone incorreto.')}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Telefone Incorreto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('nao_interessado', 'marcado como não interessado.')}>
            <XCircle className="mr-2 h-4 w-4" />
            Não Interessado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar visita para {authorization.nomeAluno}</DialogTitle>
          <DialogDescription>
            Responsável: {authorization.nomeResponsavel} - {authorization.telefone}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onScheduleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="dataAgendamento"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal col-span-3',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="col-span-4 pl-[25%]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="horaAgendamento"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Hora</FormLabel>
                  <FormControl>
                    <Input {...field} type="time" className="col-span-3" />
                  </FormControl>
                  <FormMessage className="col-span-4 pl-[25%]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="col-span-3"
                      placeholder="Ex: Confirmou presença, virá com a mãe..."
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Salvar agendamento</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export function SchedulingTable({ data }: { data: Authorization[] }) {
  const formatDateFromTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
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
                <TableHead className="hidden sm:table-cell">Liberado Em</TableHead>
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
                    <TableCell className="hidden sm:table-cell">
                      {formatDateFromTimestamp(auth.dataLiberacao)}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="border-primary/50 text-primary">{auth.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <ActionsMenu authorization={auth} />
                    </TableCell>
                </TableRow>
                )) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
