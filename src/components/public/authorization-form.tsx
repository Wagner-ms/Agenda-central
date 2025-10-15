'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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

const formSchema = z.object({
    nomeAluno: z.string().min(3, 'O nome do aluno é obrigatório.'),
    idade: z.coerce.number().min(1, 'A idade é obrigatória.'),
    serie: z.string().min(1, 'A série é obrigatória.'),
    turno: z.string().min(1, 'O turno é obrigatório.'),
    escola: z.string(),
    nomeResponsavel: z.string().min(3, 'O nome do responsável é obrigatório.'),
    telefone: z.string().min(10, 'O telefone é obrigatório.'),
    consent: z.boolean().refine(value => value === true, 'Você precisa confirmar o consentimento.'),
});

export function AuthorizationForm({ schoolName }: { schoolName?: string }) {
    const { toast } = useToast();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nomeAluno: '',
            idade: undefined,
            serie: '',
            turno: '',
            escola: schoolName || '',
            nomeResponsavel: '',
            telefone: '',
            consent: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível conectar ao banco de dados. Tente novamente.',
            });
            return;
        }

        try {
            const authorizationsRef = collection(firestore, 'authorizations');
            
            // We don't need the consent field in the database
            const { consent, ...dataToSave } = values;

            await addDocumentNonBlocking(authorizationsRef, {
                ...dataToSave,
                status: 'pendente',
                criadoPor: 'sistema',
                dataCadastro: serverTimestamp(),
                atualizadoEm: serverTimestamp(),
            });

            toast({
                title: 'Sucesso!',
                description: 'Autorização enviada com sucesso. Agradecemos sua colaboração.',
                className: 'bg-accent text-accent-foreground',
            });
            form.reset();
        } catch (error) {
            console.error('Error saving authorization: ', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao salvar',
                description: 'Não foi possível salvar a autorização. Por favor, tente novamente mais tarde.',
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <hr className="my-6" />

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
                                <p className="text-sm text-muted-foreground">
                                    Ao marcar esta caixa, você autoriza a participação do aluno na atividade e confirma que os dados fornecidos estão corretos.
                                </p>
                                 <FormMessage />
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
