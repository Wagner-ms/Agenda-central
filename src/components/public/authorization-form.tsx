'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, 'O nome do aluno é obrigatório.'),
  idade: z.coerce.number().min(5, 'A idade deve ser no mínimo 5.').max(100, 'A idade deve ser no máximo 100.'),
  serie: z.string().min(1, 'A série é obrigatória.'),
  turno: z.enum(['Manhã', 'Tarde', 'Noite'], { required_error: 'O turno é obrigatório.' }),
  escola: z.string().min(3, 'O nome da escola é obrigatório.'),
  nomeResponsavel: z.string().min(3, 'O nome do responsável é obrigatório.'),
  telefone: z.string().min(10, 'O telefone é obrigatório (com DDD).'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com os termos para continuar.',
  }),
});

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined,
      serie: '',
      turno: undefined,
      escola: initialSchoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  const onSubmit = async (data: AuthorizationFormValues) => {
    setIsLoading(true);

    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao banco de dados. Tente novamente.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const authorizationsCollection = collection(firestore, 'authorizations');
      await addDocumentNonBlocking(authorizationsCollection, {
        ...data,
        status: 'pendente',
        dataCadastro: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        criadoPor: 'sistema',
      });
      
      toast({
        title: 'Autorização enviada!',
        description: 'Seus dados foram enviados com sucesso e aguardam liberação.',
        className: 'bg-accent text-accent-foreground',
      });
      form.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Algo deu errado.",
            description: "Não foi possível salvar os dados. Por favor, tente novamente.",
        });
    } finally {
        setIsLoading(false);
    }

  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nomeAluno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo do Aluno</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João da Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="idade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 15" {...field} />
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
                    <FormLabel>Série/Ano</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 9º Ano" {...field} />
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
                <FormLabel>Escola em que estuda</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da escola" {...field} />
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

        <div className="border-t pt-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="nomeResponsavel"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Responsável</FormLabel>
                        <FormControl>
                        <Input placeholder="Nome do pai, mãe ou responsável" {...field} />
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
                        <FormLabel>Telefone do Responsável (com DDD)</FormLabel>
                        <FormControl>
                        <Input placeholder="Ex: (41) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>

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
                <FormMessage className="pb-2"/>
                <p className="text-sm text-muted-foreground">
                  Autorizo o contato da equipe da Universidade Positivo para agendamento de uma visita e apresentação das oportunidades educacionais.
                </p>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Autorização'
          )}
        </Button>
      </form>
    </Form>
  );
}
