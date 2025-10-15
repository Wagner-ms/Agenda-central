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
import { Loader2 } from 'lucide-react';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  nomeAluno: z.string().min(3, 'O nome do aluno deve ter pelo menos 3 caracteres.'),
  idade: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.coerce.number({ invalid_type_error: 'Idade inválida' }).positive('Idade inválida').optional()
  ),
  serie: z.string().optional(),
  turno: z.string({ required_error: 'Por favor, selecione um turno.' }),
  escola: z.string().min(1, 'O nome da escola é obrigatório.'),
  nomeResponsavel: z.string().min(3, 'O nome do responsável deve ter pelo menos 3 caracteres.'),
  telefone: z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos.'),
  consent: z.boolean().refine(value => value === true, 'Você deve concordar com os termos.'),
});

export function AuthorizationForm({ schoolName }: { schoolName: string }) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeAluno: '',
      idade: '',
      serie: '',
      turno: '',
      escola: schoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Erro de Conexão',
            description: 'Não foi possível conectar ao banco de dados. Tente novamente mais tarde.',
        });
        return;
    }

    try {
        const authorizationsCol = collection(firestore, 'authorizations');
        await addDocumentNonBlocking(authorizationsCol, {
            ...values,
            idade: values.idade || null,
            serie: values.serie || null,
            status: 'pendente',
            criadoPor: 'sistema',
            dataCadastro: serverTimestamp(),
            atualizadoEm: serverTimestamp(),
        });

        toast({
            title: 'Autorização Enviada!',
            description: 'Obrigado por preencher o formulário. Seus dados foram enviados com sucesso.',
            className: 'bg-accent text-accent-foreground',
        });
        form.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Enviar',
            description: 'Houve um problema ao salvar seus dados. Por favor, tente novamente.',
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <FormField
              control={form.control}
              name="nomeAluno"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Nome Completo do Aluno</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
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
                    <Input type="number" placeholder="Ex: 8" {...field} />
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
                  <FormLabel>Série / Ano</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 3º Ano" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
            control={form.control}
            name="turno"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Turno</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno em que o aluno estuda" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Integral">Integral</SelectItem>
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
                <Input placeholder="Ex: Maria da Silva" {...field} />
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
                <Input type="tel" placeholder="(XX) 9XXXX-XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Termo de Consentimento
                </FormLabel>
                <FormDescription>
                  Autorizo a participação do meu filho(a) na atividade e o contato da equipe para agendamento.
                </FormDescription>
                 <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar Autorização'}
        </Button>
      </form>
    </Form>
  );
}
