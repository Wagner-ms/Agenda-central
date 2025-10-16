
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useAuth, useFirestore, addDocumentNonBlocking, initiateAnonymousSignIn } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, "O nome do aluno é obrigatório."),
  idade: z.coerce.number({ invalid_type_error: "A idade é obrigatória." }).positive("A idade deve ser um número positivo."),
  serie: z.string().min(1, "A série é obrigatória."),
  turno: z.string().min(1, "O turno é obrigatório."),
  escola: z.string().min(3, "O nome da escola é obrigatório."),
  nomeResponsavel: z.string().min(3, "O nome do responsável é obrigatório."),
  telefone: z.string().min(10, "O telefone é obrigatório."),
  consent: z.literal<boolean>(true, {
    errorMap: () => ({ message: "Você deve marcar o campo de consentimento para continuar." }),
  }),
});

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();

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

  const onSubmit = async (data: AuthorizationFormValues) => {
    setIsLoading(true);
    setFormError(null);

    if (!auth || !firestore) {
      setFormError("Serviço indisponível. Tente novamente mais tarde.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Ensure anonymous authentication
      if (!auth.currentUser) {
        await initiateAnonymousSignIn(auth);
      }

      // 2. Prepare data for Firestore
      const docData = {
        ...data,
        status: 'pendente',
        criadoPor: 'sistema',
        dataCadastro: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      };
      
      // 3. Add document to Firestore non-blockingly
      const authorizationsRef = collection(firestore, 'authorizations');
      addDocumentNonBlocking(authorizationsRef, docData);

      // 4. Handle success UI
      toast({
        title: 'Autorização Enviada!',
        description: 'Seus dados foram enviados com sucesso. Obrigado!',
        className: 'bg-accent text-accent-foreground',
      });
      setFormSuccess(true);
      form.reset();

    } catch (error: any) {
      console.error("Form submission error:", error);
      setFormError("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.");
      toast({
        title: 'Falha no Envio',
        description: error.message || 'Ocorreu um erro no servidor ao processar sua solicitação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (formSuccess) {
    return (
        <div className="text-center p-8 rounded-lg bg-green-50 border border-green-200">
            <h3 className="text-2xl font-bold text-green-800">Enviado com Sucesso!</h3>
            <p className="text-green-700 mt-2">Obrigado por preencher a autorização.</p>
        </div>
    )
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
                    <Input type="number" placeholder="Idade" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
            control={form.control}
            name="serie"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Série / Ano</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: 3º Ano, 5ª Série" {...field} />
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
        
        <div className="border-t border-border pt-6">
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
        </div>
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
                <p className="text-sm text-muted-foreground">
                  Autorizo a participação do meu filho(a) na atividade e o contato da escola.
                </p>
                 <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {formError && (
            <Alert variant="destructive">
            <AlertTitle>Falha no Envio</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
            </Alert>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar Autorização'}
        </Button>
      </form>
    </Form>
  );
}
