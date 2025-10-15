'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, { message: 'Nome do aluno deve ter no mínimo 3 caracteres.' }),
  idade: z.coerce.number().min(1, { message: 'Idade é obrigatória.' }),
  serie: z.string().min(1, { message: 'Série é obrigatória.' }),
  turno: z.string().min(1, { message: 'Turno é obrigatório.' }),
  escola: z.string(),
  nomeResponsavel: z.string().min(3, { message: 'Nome do responsável deve ter no mínimo 3 caracteres.' }),
  telefone: z.string().min(10, { message: 'Telefone inválido.' }),
  consent: z.boolean().refine(val => val === true, { message: 'Você deve consentir para continuar.' }),
});

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;

export function AuthorizationForm({ schoolName }: { schoolName: string }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      nomeAluno: '',
      idade: '' as any, // Initialize as empty string to avoid uncontrolled component error
      serie: '',
      turno: '',
      escola: schoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
    values: { // Use values prop to ensure form is always controlled
        nomeAluno: '',
        idade: '' as any,
        serie: '',
        turno: '',
        escola: schoolName || '',
        nomeResponsavel: '',
        telefone: '',
        consent: false,
        ...form.getValues()
    }
  });

  const onSubmit = (data: AuthorizationFormValues) => {
    if (!firestore) {
        toast({ title: "Erro", description: "O serviço de banco de dados não está disponível.", variant: "destructive" });
        return;
    }
    const authorizationsCollection = collection(firestore, 'authorizations');
    
    addDocumentNonBlocking(authorizationsCollection, {
        ...data,
        status: 'pendente',
        dataCadastro: serverTimestamp(),
        criadoPor: 'sistema',
        atualizadoEm: serverTimestamp(),
    });

    toast({
      title: 'Autorização Enviada!',
      description: 'Obrigado por preencher o formulário.',
      className: 'bg-accent text-accent-foreground',
    });
    form.reset();
  };

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
            <div className="grid grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="idade"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="0" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Turno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
        </div>
        <FormField
          control={form.control}
          name="escola"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escola</FormLabel>
              <FormControl>
                <Input {...field} disabled />
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
                    <Input placeholder="Nome de quem autoriza" {...field} />
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
                    <Input placeholder="(99) 99999-9999" {...field} />
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
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                    Eu, o responsável, autorizo a participação do aluno na atividade.
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Autorização'}
        </Button>
      </form>
    </Form>
  );
}
