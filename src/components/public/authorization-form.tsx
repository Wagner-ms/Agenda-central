'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
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
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

// Schema with all fields required and no age limit
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


export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof authorizationSchema>>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined, // use undefined for number inputs
      serie: '',
      turno: '',
      escola: initialSchoolName || '', // Set initial value here
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });
  
  useEffect(() => {
    // Reset the form's school value if the initialSchoolName prop changes
    form.reset({ ...form.getValues(), escola: initialSchoolName });
  }, [initialSchoolName, form]);

  async function onSubmit(values: z.infer<typeof authorizationSchema>) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createAuthorizationAction(values);

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: 'Autorização Enviada com Sucesso!',
          description: 'Obrigado por preencher o formulário.',
          className: 'bg-accent text-accent-foreground',
        });
        form.reset();
      } else {
        // Handle validation errors from server
        if (result.errors) {
            Object.entries(result.errors).forEach(([field, errors]) => {
                const fieldName = field as keyof z.infer<typeof authorizationSchema>;
                const message = (errors as string[]).join(', ');
                form.setError(fieldName, { type: 'server', message });
            });
             setSubmitError('Por favor, corrija os erros no formulário.');
        } else {
             setSubmitError(result.error || 'Ocorreu um erro desconhecido.');
        }
      }
    } catch (error) {
      console.error(error);
      setSubmitError('Não foi possível enviar o formulário. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const resetForm = () => {
    setIsSuccess(false);
    setSubmitError(null);
    form.reset({
      nomeAluno: '',
      idade: undefined,
      serie: '',
      turno: '',
      escola: initialSchoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    });
  }


  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-accent/20">
        <CheckCircle className="h-16 w-16 text-accent-foreground mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Formulário Enviado!</h3>
        <p className="text-muted-foreground mb-6">Sua autorização foi registrada com sucesso. Agradecemos a sua colaboração.</p>
        <Button onClick={resetForm}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Preencher Novo Formulário
        </Button>
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
                  <Input type="number" placeholder="Idade do aluno" {...field} />
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
                  <Input placeholder="Ex: 5º Ano" {...field} />
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
                <Input
                  placeholder="Nome da escola"
                  {...field}
                />
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
                    <Input placeholder="Seu nome completo" {...field} />
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
                    <Input type="tel" placeholder="(XX) XXXXX-XXXX" {...field} />
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
                <FormLabel>Termo de Consentimento</FormLabel>
                <FormDescription>
                  Autorizo meu filho(a) a participar da atividade e concordo com os termos.
                </FormDescription>
                 <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {submitError && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Falha no Envio</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
            </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar Autorização'}
        </Button>
      </form>
    </Form>
  );
}
