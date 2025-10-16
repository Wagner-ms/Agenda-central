
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createAuthorizationAction } from '@/app/autorizar/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';

const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, "O nome do aluno é obrigatório."),
  idade: z.coerce.number({ invalid_type_error: "A idade é obrigatória." }).positive("A idade deve ser um número positivo."),
  serie: z.string().min(1, "A série é obrigatória."),
  turno: z.string().min(1, "O turno é obrigatório."),
  escola: z.string().min(3, "O nome da escola é obrigatório."),
  nomeResponsavel: z.string().min(3, "O nome do responsável é obrigatório."),
  telefone: z.string().min(10, "O telefone é obrigatório."),
  consent: z.literal<boolean>(true, {
    errorMap: () => ({ message: "Você deve marcar o campo de consentimento." }),
  }),
});

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      escola: initialSchoolName || '',
      nomeAluno: '',
      idade: undefined,
      serie: '',
      turno: '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  async function onSubmit(data: AuthorizationFormValues) {
    setIsLoading(true);
    try {
      const result = await createAuthorizationAction(data);
      if (result.success) {
        setIsSuccess(true);
      } else {
        toast({
          variant: "destructive",
          title: "Erro no Envio",
          description: result.error || "Houve um problema ao processar seu formulário.",
        });
        if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
                form.setError(field as keyof AuthorizationFormValues, {
                    type: 'server',
                    message: (messages as string[]).join(', ')
                });
            });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro Inesperado",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <PartyPopper className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Formulário Enviado!</h2>
                <p className="text-muted-foreground">
                    Sua autorização foi enviada com sucesso. Em breve, nossa equipe entrará em contato.
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
                    <Input placeholder="Nome completo do aluno" {...field} disabled={isLoading} />
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
                    <Input type="number" placeholder="Idade do aluno" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} disabled={isLoading} />
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
                    <Input placeholder="Ex: 9º Ano" {...field} disabled={isLoading} />
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
                    <Input placeholder="Manhã ou Tarde" {...field} disabled={isLoading} />
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
                <Input placeholder="Nome da escola" {...field} disabled={isLoading || !!initialSchoolName} />
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
                    <Input placeholder="Nome completo do responsável" {...field} disabled={isLoading} />
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
                    <Input type="tel" placeholder="(99) 99999-9999" {...field} disabled={isLoading} />
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
               <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                    />
                </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Termo de Consentimento
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Autorizo a participação do meu filho(a) na atividade e o contato da equipe.
                </p>
                 <FormMessage className="pt-2" />
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
