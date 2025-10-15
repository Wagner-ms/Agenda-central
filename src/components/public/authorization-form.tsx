'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, { message: 'O nome do aluno deve ter pelo menos 3 caracteres.' }),
  idade: z.coerce.number().min(1, { message: 'A idade é obrigatória.' }),
  serie: z.string().min(1, { message: 'A série é obrigatória.' }),
  turno: z.string().min(1, { message: 'O turno é obrigatório.' }),
  escola: z.string().min(3, { message: 'O nome da escola é obrigatório.' }),
  nomeResponsavel: z.string().min(3, { message: 'O nome do responsável deve ter pelo menos 3 caracteres.' }),
  telefone: z.string().min(10, { message: 'O telefone deve ter pelo menos 10 dígitos.' }),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com os termos para continuar.',
  }),
});

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;

interface AuthorizationFormProps {
  initialSchoolName: string;
}

export default function AuthorizationForm({ initialSchoolName }: AuthorizationFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined,
      serie: '',
      turno: '',
      escola: initialSchoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  async function onSubmit(data: AuthorizationFormValues) {
    if (!firestore) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao banco de dados. Tente novamente mais tarde.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const authorizationsCollection = collection(firestore, 'authorizations');
      await addDocumentNonBlocking(authorizationsCollection, {
        ...data,
        status: 'pendente',
        dataCadastro: serverTimestamp(),
        criadoPor: 'sistema',
        atualizadoEm: serverTimestamp(),
      });

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        title: 'Erro ao Enviar',
        description: 'Não foi possível salvar a autorização. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitSuccess) {
    return (
      <Alert variant="default" className="border-accent bg-accent/10">
        <AlertTitle className="text-accent-foreground">Sucesso!</AlertTitle>
        <AlertDescription className="text-accent-foreground">
          Sua autorização foi enviada com sucesso. Obrigado!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Dados do Aluno</h3>
             <FormField
                control={form.control}
                name="nomeAluno"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome Completo do Aluno</FormLabel>
                    <FormControl>
                        <Input placeholder="Nome do Aluno" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                    control={form.control}
                    name="idade"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Idade</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Idade" {...field} />
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
                            <Input placeholder="Manhã/Tarde" {...field} />
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
                    <Input placeholder="Nome da Escola" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Dados do Responsável</h3>
            <FormField
                control={form.control}
                name="nomeResponsavel"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome Completo do Responsável</FormLabel>
                    <FormControl>
                        <Input placeholder="Nome do Responsável" {...field} />
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
                    <FormLabel>Telefone para Contato</FormLabel>
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Autorização e Consentimento
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Autorizo meu filho(a) a participar da atividade e concordo com o contato da equipe.
                </p>
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
