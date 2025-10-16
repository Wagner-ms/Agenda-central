'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { createAuthorizationAction } from '@/app/autorizar/actions';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

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

type AuthorizationFormData = z.infer<typeof authorizationSchema>;

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AuthorizationFormData>({
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

  async function onSubmit(data: AuthorizationFormData) {
    setIsSubmitting(true);
    setServerError(null);

    const result = await createAuthorizationAction(data);

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Autorização Enviada com Sucesso!',
        description: 'Obrigado por preencher o formulário. Entraremos em contato em breve.',
        className: 'bg-accent text-accent-foreground',
      });
      form.reset();
    } else {
      setServerError(result.error || 'Ocorreu um erro desconhecido.');
      if (result.errors) {
        // You can use form.setError here if you want to display field-specific errors
        console.error("Validation Errors:", result.errors);
      }
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
                  <Input type="number" placeholder="Ex: 8" {...field} value={field.value ?? ''} />
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
                <FormLabel>Telefone</FormLabel>
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
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Termos de Consentimento
                </FormLabel>
                <FormDescription>
                  Autorizo a participação do meu filho(a) e o contato da escola para fins de agendamento.
                </FormDescription>
                 <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        {serverError && (
          <Alert variant="destructive">
            <AlertTitle>Falha no Envio</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full text-lg" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          {isSubmitting ? 'Enviando...' : 'Enviar Autorização'}
        </Button>
      </form>
    </Form>
  );
}
