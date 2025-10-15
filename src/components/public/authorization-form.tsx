'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  nomeAluno: z.string().min(3, { message: 'O nome do aluno deve ter pelo menos 3 caracteres.' }),
  idade: z.coerce.number().min(5, { message: 'A idade deve ser de pelo menos 5 anos.' }).max(18, { message: 'A idade não pode ser maior que 18 anos.' }),
  serie: z.string().min(1, { message: 'A série é obrigatória.' }),
  turno: z.enum(['Manhã', 'Tarde']),
  escola: z.string().min(1, { message: 'O nome da escola é obrigatório.' }),
  nomeResponsavel: z.string().min(3, { message: 'O nome do responsável deve ter pelo menos 3 caracteres.' }),
  telefone: z.string().min(10, { message: 'O telefone deve ter pelo menos 10 dígitos.' }),
  consentimento: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com os termos para continuar.',
  }),
});

type AuthorizationFormValues = z.infer<typeof formSchema>;

export function AuthorizationForm({ schoolName }: { schoolName: string }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined,
      serie: '',
      turno: 'Manhã',
      escola: schoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consentimento: false,
    },
  });
  
  React.useEffect(() => {
    form.setValue('escola', schoolName);
  }, [schoolName, form]);

  const onSubmit = async (data: AuthorizationFormValues) => {
    setIsSubmitting(true);
    console.log('Dados do formulário:', data);

    // Simulação de chamada de API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AQUI SERÁ A LÓGICA PARA ENVIAR PARA O FIRESTORE
    // Por exemplo: await addDoc(collection(db, "authorizations"), newAuthData);

    toast({
      title: 'Autorização Enviada com Sucesso!',
      description: `Obrigado, ${data.nomeResponsavel}! Os dados de ${data.nomeAluno} foram recebidos.`,
      className: 'bg-accent text-accent-foreground',
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
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
            <FormField
                control={form.control}
                name="escola"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Escola</FormLabel>
                    <FormControl>
                        <Input placeholder="Nome da escola" {...field} disabled={!!schoolName} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="idade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idade</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex: 8" {...field} />
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
                      <SelectValue placeholder="Selecione o turno" />
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
        
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
            <FormField
                control={form.control}
                name="nomeResponsavel"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome do Responsável</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Maria da Silva" {...field} />
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
                    <FormLabel>Telefone para Contato</FormLabel>
                    <FormControl>
                        <Input type="tel" placeholder="(00) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="consentimento"
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
                  Confirmação de Consentimento
                </FormLabel>
                <FormDescription>
                  Autorizo a participação do aluno na atividade e confirmo que as informações fornecidas são verdadeiras.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    'Enviar Autorização'
                )}
            </Button>
        </div>
      </form>
    </Form>
  );
}
