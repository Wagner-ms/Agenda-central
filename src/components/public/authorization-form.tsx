'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, { message: "O nome do aluno é obrigatório." }),
  idade: z.coerce.number().min(1, { message: "A idade é obrigatória." }),
  serie: z.string().min(1, { message: "A série é obrigatória." }),
  turno: z.string().min(1, { message: "O turno é obrigatório." }),
  escola: z.string().min(1, { message: "O nome da escola é obrigatório." }),
  nomeResponsavel: z.string().min(3, { message: "O nome do responsável é obrigatório." }),
  telefone: z.string().min(10, { message: "O telefone é obrigatório." }),
  consent: z.boolean().refine((val) => val === true, {
    message: "Você deve marcar a caixa de autorização para continuar.",
  }),
});

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;

function FormLabelWithRequired({ children }: { children: React.ReactNode }) {
    return (
        <FormLabel>
            {children} <span className="text-destructive">*</span>
        </FormLabel>
    );
}

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      nomeAluno: '',
      idade: 0,
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
    if (!firestore) {
      toast({
        title: 'Erro',
        description: 'Serviço de banco de dados indisponível.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const authCollection = collection(firestore, 'authorizations');
      await addDocumentNonBlocking(authCollection, {
        ...data,
        status: 'pendente',
        criadoPor: 'sistema',
        dataCadastro: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: 'Erro ao Enviar',
        description: 'Não foi possível salvar a autorização. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
      return (
        <Alert variant="default" className="bg-accent text-accent-foreground border-accent-foreground/20">
            <AlertTitle className="font-bold text-xl">Autorização Enviada com Sucesso!</AlertTitle>
            <AlertDescription className="mt-2">
                Obrigado! Seus dados foram recebidos e em breve a nossa equipe entrará em contato para mais informações.
            </AlertDescription>
        </Alert>
      )
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
                  <FormLabelWithRequired>Nome Completo do Aluno</FormLabelWithRequired>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} disabled={isLoading} />
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
                    <FormLabelWithRequired>Idade</FormLabelWithRequired>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 8" {...field} disabled={isLoading} />
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
                    <FormLabelWithRequired>Série</FormLabelWithRequired>
                    <FormControl>
                      <Input placeholder="Ex: 3º Ano" {...field} disabled={isLoading} />
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
                    <FormLabelWithRequired>Turno</FormLabelWithRequired>
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
                    <FormLabelWithRequired>Escola</FormLabelWithRequired>
                    <FormControl>
                      <Input placeholder="Nome da escola" {...field} disabled={isLoading} />
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
                    <FormLabelWithRequired>Seu Nome Completo</FormLabelWithRequired>
                    <FormControl>
                      <Input placeholder="Ex: Maria de Souza" {...field} disabled={isLoading} />
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
                    <FormLabelWithRequired>Seu Telefone (com DDD)</FormLabelWithRequired>
                    <FormControl>
                      <Input type="tel" placeholder="(11) 99999-9999" {...field} disabled={isLoading} />
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                />
                </FormControl>
                <div className="space-y-1 leading-none">
                <FormLabelWithRequired>
                    Autorização
                </FormLabelWithRequired>
                 <p className="text-sm text-muted-foreground">
                    Autorizo meu filho(a) a participar da atividade e concordo que meus dados sejam utilizados para agendamento.
                </p>
                <FormMessage className="pt-2" />
                </div>
            </FormItem>
            )}
        />


        <Button type="submit" className="w-full text-lg" size="lg" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar Autorização'}
        </Button>
      </form>
    </Form>
  );
}
