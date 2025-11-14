
'use client';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useState } from 'react';

const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, { message: 'O nome do aluno é obrigatório.' }),
  idade: z.coerce
    .number({ invalid_type_error: 'Idade deve ser um número.' })
    .min(1, { message: 'A idade é obrigatória.' }),
  serie: z.string().min(1, { message: 'A série é obrigatória.' }),
  turno: z.string().min(1, { message: 'O turno é obrigatório.' }),
  escola: z.string().min(3, { message: 'O nome da escola é obrigatório.' }),
  nomeResponsavel: z
    .string()
    .min(3, { message: 'O nome do responsável é obrigatório.' }),
  telefone: z.string().min(10, { message: 'O telefone é obrigatório.' }),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com os termos para continuar.',
  }),
});

type AuthorizationFormValues = z.infer<typeof authorizationSchema>;

interface AuthorizationFormProps {
  initialSchoolName: string;
}

export default function AuthorizationForm({ initialSchoolName }: AuthorizationFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined, // Will be treated as empty by coerce.number
      serie: '',
      turno: '',
      escola: initialSchoolName || '', // <<<<< CORRECTION IS HERE
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
    // The key ensures the form re-initializes if the initialSchoolName prop changes
    // which is not the case here but is good practice.
    key: initialSchoolName,
  });

  async function onSubmit(values: AuthorizationFormValues) {
    if (!firestore) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao banco de dados.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'authorizations'), {
        ...values,
        status: 'pendente',
        criadoPor: 'sistema',
        dataCadastro: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      toast({
        title: 'Autorização enviada com sucesso!',
        description:
          'Obrigado por preencher o formulário. Entraremos em contato em breve.',
        className: 'bg-accent text-accent-foreground',
      });
      form.reset();
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        title: 'Erro ao enviar',
        description:
          'Houve um problema ao salvar sua autorização. Tente novamente.',
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
            {/* Nome do Aluno */}
            <FormField
              control={form.control}
              name="nomeAluno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Aluno</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do aluno" {...field} disabled={isSubmitting}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Idade */}
            <FormField
              control={form.control}
              name="idade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Idade do aluno" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} disabled={isSubmitting}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Série */}
             <FormField
              control={form.control}
              name="serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Série / Ano</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 9º Ano, 1º Ano do Ensino Médio" {...field} disabled={isSubmitting}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Turno */}
            <FormField
              control={form.control}
              name="turno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                      <SelectItem value="Integral">Integral</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        {/* Escola */}
        <FormField
          control={form.control}
          name="escola"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escola</FormLabel>
              <FormControl>
                <Input placeholder="Nome da escola" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome do Responsável */}
            <FormField
            control={form.control}
            name="nomeResponsavel"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nome do Responsável</FormLabel>
                <FormControl>
                    <Input placeholder="Nome completo do responsável" {...field} disabled={isSubmitting}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            {/* Telefone */}
            <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Telefone do Responsável</FormLabel>
                <FormControl>
                    <Input type="tel" placeholder="(00) 90000-0000" {...field} disabled={isSubmitting}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {/* Consentimento */}
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Termo de Consentimento
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Autorizo o contato da equipe do Projeto Aprendiz Positivo para
                  oferecer mais informações sobre as bolsas de estudo e
                  oportunidades.
                </p>
                <FormMessage className="pt-2"/>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <>
                <Loader2 className="animate-spin mr-2"/> Enviando...
            </> : 'Enviar Autorização'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
