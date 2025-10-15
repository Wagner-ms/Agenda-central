
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  nomeAluno: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  idade: z.coerce.number().min(1, { message: 'A idade deve ser um número positivo.' }),
  serie: z.string().min(1, { message: 'A série é obrigatória.' }),
  turno: z.string().min(1, { message: 'O turno é obrigatório.' }),
  escola: z.string().min(1, { message: 'O nome da escola é obrigatório.' }),
  nomeResponsavel: z.string().min(2, { message: 'O nome do responsável é obrigatório.' }),
  telefone: z.string().min(10, { message: 'O telefone deve ter pelo menos 10 dígitos.' }),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com os termos.',
  }),
});

export function AuthorizationForm({ schoolName }: { schoolName: string }) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        nomeAluno: '',
        idade: undefined, // Start as undefined, zod will coerce
        serie: '',
        turno: '',
        escola: schoolName || '',
        nomeResponsavel: '',
        telefone: '',
        consent: false,
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
        });
        return;
    }
    
    const authorizationsCol = collection(firestore, 'authorizations');
    addDocumentNonBlocking(authorizationsCol, {
        ...values,
        status: 'pendente',
        dataCadastro: serverTimestamp(),
        criadoPor: 'sistema',
        atualizadoEm: serverTimestamp(),
    });

    toast({
      title: 'Autorização Enviada!',
      description: 'Obrigado por preencher o formulário.',
      className: 'bg-accent text-accent-foreground',
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Input type="number" placeholder="00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="serie"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Série</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: 3º Ano B" {...field} />
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
        </div>
        <FormField
          control={form.control}
          name="escola"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escola</FormLabel>
              <FormControl>
                <Input {...field} disabled />
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
                <Input placeholder="Nome completo do pai ou mãe" {...field} />
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
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(00) 90000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Confirmação de Consentimento
                </FormLabel>
                <FormDescription>
                  Eu autorizo a participação do aluno na atividade e confirmo que os dados fornecidos são verdadeiros.
                </FormDescription>
                 <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Autorização'}
        </Button>
      </form>
    </Form>
  );
}
