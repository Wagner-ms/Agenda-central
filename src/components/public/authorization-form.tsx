'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import React from 'react';

const formSchema = z.object({
  nomeAluno: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  idade: z.coerce.number().min(5, { message: "A idade deve ser de pelo menos 5 anos." }).max(25, { message: "A idade deve ser no máximo 25 anos." }),
  serie: z.string().min(1, { message: 'A série é obrigatória.' }),
  turno: z.string().min(1, { message: 'O turno é obrigatório.' }),
  escola: z.string().min(3, { message: 'O nome da escola é obrigatório.' }),
  nomeResponsavel: z.string().min(3, { message: 'O nome do responsável é obrigatório.' }),
  telefone: z.string().min(10, { message: 'O telefone deve ter pelo menos 10 dígitos.' }),
  consent: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os termos."
  })
});

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined, // Start with undefined but handle it in the input
      serie: '',
      turno: '',
      escola: initialSchoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!firestore) {
      toast({
        title: 'Erro',
        description: 'Não foi possível conectar ao banco de dados.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const authCollection = collection(firestore, 'authorizations');
      await addDocumentNonBlocking(authCollection, {
        ...values,
        status: 'pendente',
        dataCadastro: serverTimestamp(),
        criadoPor: 'sistema',
        atualizadoEm: serverTimestamp(),
      });
      
      toast({
        title: 'Autorização enviada!',
        description: 'Seus dados foram enviados com sucesso e em breve entraremos em contato.',
        className: 'bg-accent text-accent-foreground',
      });
      form.reset();
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Ocorreu um problema ao enviar seus dados. Tente novamente.',
        variant: 'destructive',
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
                    <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber)} 
                        value={field.value ?? ''}
                    />
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
                    <Input placeholder="Ex: 9º Ano" {...field} />
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
                    <Input placeholder="Nome de um dos pais ou responsável" {...field} />
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
                  Autorizo o contato da equipe da Universidade Positivo para obter mais informações sobre bolsas e oportunidades.
                </FormDescription>
                 <FormMessage className="pt-2" />
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
