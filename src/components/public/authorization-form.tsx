'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  nomeAluno: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  idade: z.coerce.number().min(1, { message: "A idade é obrigatória." }),
  serie: z.string().min(1, { message: "A série é obrigatória." }),
  turno: z.string().min(1, { message: "O turno é obrigatório." }),
  escola: z.string(),
  nomeResponsavel: z.string().min(2, { message: "O nome do responsável é obrigatório." }),
  telefone: z.string().min(10, { message: "O telefone deve ter pelo menos 10 dígitos." }),
  consent: z.boolean().refine(val => val === true, { message: "Você deve consentir para continuar." }),
});

type AuthorizationFormValues = z.infer<typeof formSchema>;

export function AuthorizationForm({ schoolName }: { schoolName: string }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined,
      serie: '',
      turno: '',
      escola: schoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  async function onSubmit(values: AuthorizationFormValues) {
    if (!firestore) {
        toast({
            title: "Erro de Conexão",
            description: "Não foi possível conectar ao banco de dados. Tente novamente mais tarde.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);

    try {
        const authorizationsCol = collection(firestore, 'authorizations');
        
        const newAuthorization = {
            ...values,
            status: 'pendente',
            dataCadastro: serverTimestamp(),
            criadoPor: 'sistema',
            atualizadoEm: serverTimestamp(),
        };

        addDocumentNonBlocking(authorizationsCol, newAuthorization);

        toast({
            title: 'Autorização Enviada!',
            description: 'Obrigado! Seus dados foram enviados com sucesso.',
            className: 'bg-accent text-accent-foreground',
        });
        form.reset();
    } catch (error) {
        console.error("Erro ao salvar autorização: ", error);
        toast({
            title: "Erro ao Enviar",
            description: "Ocorreu um problema ao enviar seus dados. Por favor, tente novamente.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
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
                    <Input type="number" placeholder="0" {...field} />
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
                    <Input placeholder="Ex: 3º Ano" {...field} />
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
                  <FormControl>
                    <Input placeholder="Manhã ou Tarde" {...field} />
                  </FormControl>
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
                <Input {...field} readOnly className="bg-muted" />
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
                <Input placeholder="Nome de quem autoriza" {...field} />
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
              <FormLabel>Telefone de Contato</FormLabel>
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
                  Termo de Consentimento
                </FormLabel>
                <FormDescription>
                  Autorizo a participação do aluno na atividade e o contato da equipe para agendamento.
                </FormDescription>
                 <FormMessage className="pt-2" />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Autorização"}
        </Button>
      </form>
    </Form>
  );
}
