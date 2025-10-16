'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createAuthorizationAction } from '@/app/autorizar/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Label } from '../ui/label';

// Schema for input validation with all fields required and no age limit
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

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName?: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined, // Will be coerced to a number, so undefined is fine to show placeholder
      serie: '',
      turno: '',
      escola: initialSchoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  const onSubmit = async (data: AuthorizationFormValues) => {
    setIsLoading(true);
    setServerError(null);

    const result = await createAuthorizationAction(data);

    if (result.success) {
      toast({
        title: 'Autorização Enviada com Sucesso!',
        description: 'Obrigado por preencher o formulário.',
        className: 'bg-accent text-accent-foreground',
      });
      form.reset();
    } else {
      // Handle server-side validation errors
      if (result.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          form.setError(field as keyof AuthorizationFormValues, {
            type: 'server',
            message: (messages as string[]).join(', '),
          });
        }
      }
      setServerError(result.error || 'Ocorreu um erro no servidor.');
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {serverError && !form.formState.isDirty && (
          <Alert variant="destructive">
            <AlertTitle>Erro no Servidor</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        
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
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="idade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 8" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} />
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
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="space-y-2">
            <h3 className="text-lg font-medium border-t pt-4">Dados do Responsável</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormLabel>Telefone (com DDD)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="(99) 99999-9999" {...field} />
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
                <Label htmlFor="consent" className="cursor-pointer">
                  Eu, responsável pelo aluno, autorizo a participação na atividade e o contato da escola.
                </Label>
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
  );
}
