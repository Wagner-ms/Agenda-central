'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import React from 'react';
import { createAuthorizationAction } from '@/app/autorizar/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const authorizationSchema = z
  .object({
    nomeAluno: z.string().min(3, { message: 'O nome do aluno deve ter pelo menos 3 caracteres.' }),
    idade: z.coerce.number().min(5, { message: 'A idade deve ser de pelo menos 5 anos.' }).max(18, { message: 'A idade não pode ser superior a 18 anos.' }),
    serie: z.string().min(1, { message: 'A série é obrigatória.' }),
    turno: z.string().min(1, { message: 'O turno é obrigatório.' }),
    escola: z.string().min(3, { message: 'O nome da escola é obrigatório.' }),
    nomeResponsavel: z.string().min(3, { message: 'O nome do responsável é obrigatório.' }),
    telefone: z.string().min(10, { message: 'O telefone é obrigatório e deve incluir o DDD.' }),
    consent: z.literal<boolean>(true, {
      errorMap: () => ({ message: 'Você deve autorizar para continuar.' }),
    }),
  });

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;


export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName: string }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [isSuccess, setIsSuccess] = React.useState(false);


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

    async function onSubmit(data: AuthorizationFormValues) {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const result = await createAuthorizationAction(data);

            if (result.success) {
                toast({
                    title: 'Autorização Enviada com Sucesso!',
                    description: 'Seus dados foram registrados e em breve nossa equipe entrará em contato.',
                    className: 'bg-accent text-accent-foreground',
                });
                setIsSuccess(true);
                form.reset();
            } else {
                 throw new Error(result.error || 'Ocorreu um erro desconhecido.');
            }
        } catch (error: any) {
            console.error('Submission Error:', error);
            setSubmitError('Não foi possível enviar sua autorização. Por favor, tente novamente mais tarde.');
            toast({
                title: 'Erro ao Enviar',
                description: error.message || 'Não foi possível registrar seus dados.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    if (isSuccess) {
        return (
             <div className="flex flex-col items-center justify-center text-center p-8 bg-green-50 rounded-lg">
                <Send className="h-16 w-16 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Enviado com Sucesso!</h2>
                <p className="text-gray-600">
                    Sua autorização foi recebida. Nossa equipe entrará em contato em breve.
                </p>
                <Button onClick={() => setIsSuccess(false)} className="mt-6">
                    Preencher Novo Formulário
                </Button>
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
                                    <Input type="number" placeholder="Idade do aluno" {...field} />
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
                                    <Input placeholder="Ex: 9º Ano, 3ª Série" {...field} />
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

                <hr className="my-6 border-t" />

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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                                Autorização e Termos
                            </FormLabel>
                             <p className="text-sm text-muted-foreground">
                                Autorizo meu filho(a) a participar e concordo em ser contatado(a) pela equipe.
                            </p>
                            <FormMessage />
                        </div>
                        </FormItem>
                    )}
                />
                
                {submitError && (
                     <Alert variant="destructive">
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
