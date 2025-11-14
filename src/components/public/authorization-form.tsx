'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, { message: 'O nome do aluno é obrigatório.' }),
  idade: z.coerce
    .number({ invalid_type_error: 'Idade inválida.' })
    .min(1, { message: 'A idade é obrigatória.' }),
  serie: z.string().min(1, { message: 'A série é obrigatória.' }),
  turno: z.string().min(1, { message: 'O turno é obrigatório.' }),
  escola: z.string().min(1, { message: 'O nome da escola é obrigatório.' }),
  nomeResponsavel: z
    .string()
    .min(3, { message: 'O nome do responsável é obrigatório.' }),
  telefone: z
    .string()
    .min(10, { message: 'O telefone é obrigatório.' }),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Você precisa autorizar para continuar.',
  }),
});

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const firestore = useFirestore();
  const auth = useAuth();


  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined, // Start as undefined to let placeholder show
      serie: '',
      turno: '',
      escola: initialSchoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  async function onSubmit(data: AuthorizationFormValues) {
    setIsLoading(true);
    if (!firestore || !auth) {
        toast({
            title: 'Erro de Conexão',
            description: 'Não foi possível conectar ao sistema. Tente novamente mais tarde.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    try {
        // Step 1: Sign in anonymously
        await signInAnonymously(auth);

        // Step 2: Add the document to Firestore
        await addDoc(collection(firestore, 'authorizations'), {
            ...data,
            status: 'pendente',
            dataCadastro: serverTimestamp(),
            criadoPor: 'sistema',
            atualizadoEm: serverTimestamp(),
        });

        setIsSuccess(true);
        toast({
            title: 'Autorização Enviada com Sucesso!',
            description: 'Obrigado por preencher o formulário.',
            className: 'bg-accent text-accent-foreground',
        });
        form.reset();
    } catch (error: any) {
        console.error('Error submitting authorization: ', error);
        toast({
            title: 'Erro ao Enviar',
            description: `Ocorreu um erro: ${error.message}. Por favor, tente novamente.`,
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <h3 className="text-2xl font-bold text-green-700">Formulário Enviado!</h3>
        <p className="mt-2 text-muted-foreground">
          Sua autorização foi registrada com sucesso. Agradecemos sua colaboração!
        </p>
      </div>
    );
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
                    <Input type="number" placeholder="Idade do aluno" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
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
                    <Input placeholder="Ex: 9º Ano, 3º Ano B" {...field} />
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
                      <SelectItem value="manha">Manhã</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                      <SelectItem value="integral">Integral</SelectItem>
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
                    <Input placeholder="Nome da escola" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="nomeResponsavel"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nome do Responsável</FormLabel>
                <FormControl>
                    <Input placeholder="Nome completo do pai, mãe ou responsável" {...field} />
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Termo de Autorização
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Eu, responsável legal, autorizo a participação do aluno(a) na atividade proposta, bem como o uso de sua imagem para fins de divulgação do projeto, sem ônus.
                </p>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar Autorização'}
        </Button>
      </form>
    </Form>
  );
}

    