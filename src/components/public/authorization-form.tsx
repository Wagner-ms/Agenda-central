'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const formSchema = z.object({
  nomeAluno: z.string().min(3, 'O nome do aluno é obrigatório.'),
  idade: z.coerce.number().min(5, 'A idade é obrigatória.'),
  serie: z.string().min(1, 'A série é obrigatória.'),
  turno: z.string().min(1, 'O turno é obrigatório.'),
  escola: z.string().min(3, 'O nome da escola é obrigatório.'),
  nomeResponsavel: z.string().min(3, 'O nome do responsável é obrigatório.'),
  telefone: z.string().min(10, 'O telefone é obrigatório.'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com os termos.',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const firestore = useFirestore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined, // Will be coerced to number
      serie: '',
      turno: '',
      escola: initialSchoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  async function onSubmit(data: FormData) {
    if (!firestore) {
        toast({
            title: 'Erro de Conexão',
            description: 'Não foi possível enviar os dados. Tente novamente mais tarde.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);
    try {
        await addDoc(collection(firestore, 'authorizations'), {
            ...data,
            status: 'pendente',
            dataCadastro: serverTimestamp(),
            atualizadoEm: serverTimestamp(),
            criadoPor: 'sistema'
        });
        setIsSuccess(true);
    } catch (error) {
        console.error('Error saving authorization:', error);
        toast({
            title: 'Erro ao Enviar',
            description: 'Não foi possível salvar a autorização. Por favor, tente novamente.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleCloseSuccessDialog = () => {
    setIsSuccess(false);
    form.reset();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nomeAluno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Aluno</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do aluno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="idade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Idade do aluno" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Série</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 8º Ano" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="turno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="escola"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Escola</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da escola" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nomeResponsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone do Responsável</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(00) 90000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-primary/5">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Termo de Consentimento</FormLabel>
                  <FormDescription className="text-xs">
                    Autorizo a participação do aluno(a) na atividade proposta e concordo que os dados fornecidos sejam utilizados para fins de agendamento e comunicação sobre oportunidades educacionais.
                  </FormDescription>
                   <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar Autorização'}
          </Button>
        </form>
      </Form>
      
      <AlertDialog open={isSuccess} onOpenChange={setIsSuccess}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Autorização Enviada com Sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
                Obrigado! Seus dados foram enviados e em breve nossa equipe entrará em contato para agendar uma visita.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseSuccessDialog}>Fechar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
