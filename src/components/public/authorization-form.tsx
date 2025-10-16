'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createAuthorizationAction } from '@/app/autorizar/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// Client-side schema mirroring server-side validation
const formSchema = z.object({
  nomeAluno: z.string().min(3, { message: 'O nome do aluno é obrigatório.' }),
  idade: z.coerce.number({ invalid_type_error: 'A idade é obrigatória.' }).positive({ message: 'A idade deve ser um número positivo.' }),
  serie: z.string().min(1, { message: 'A série é obrigatória.' }),
  turno: z.enum(['manha', 'tarde'], { required_error: 'O turno é obrigatório.' }),
  escola: z.string().min(3, { message: 'O nome da escola é obrigatório.' }),
  nomeResponsavel: z.string().min(3, { message: 'O nome do responsável é obrigatório.' }),
  telefone: z.string().min(10, { message: 'O telefone é obrigatório.' }),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Você deve ler e concordar com os termos." }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AuthorizationForm({ initialSchoolName }: { initialSchoolName?: string }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeAluno: '',
      idade: undefined,
      serie: '',
      turno: undefined,
      escola: initialSchoolName || '',
      nomeResponsavel: '',
      telefone: '',
      consent: false,
    },
  });
  
  const { register, handleSubmit, formState: { errors } } = form;

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const result = await createAuthorizationAction(data);
      if (result.success) {
        toast({
          title: 'Autorização Enviada!',
          description: 'Seus dados foram recebidos com sucesso.',
          className: 'bg-accent text-accent-foreground',
        });
        setIsSuccess(true);
      } else {
         const errorMsg = result.errors ? Object.values(result.errors).flat().join(' ') : result.error;
        setSubmissionError(errorMsg || 'Ocorreu um erro. Tente novamente.');
        toast({
          title: 'Falha no Envio',
          description: errorMsg || 'Por favor, verifique os dados e tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setSubmissionError('Ocorreu um erro de comunicação. Tente novamente mais tarde.');
      toast({
        title: 'Erro de Rede',
        description: 'Não foi possível conectar ao servidor.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <h3 className="text-2xl font-bold text-green-700 mb-2">Sucesso!</h3>
        <p className="text-muted-foreground">Sua autorização foi enviada. Entraremos em contato em breve.</p>
        <p className="text-muted-foreground mt-2">Obrigado por participar!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submissionError && (
          <Alert variant="destructive">
            <AlertTitle>Erro no Formulário</AlertTitle>
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}
        
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome-aluno">Nome do Aluno(a)</Label>
          <Input id="nome-aluno" {...register('nomeAluno')} placeholder="Nome completo do aluno" />
          {errors.nomeAluno && <p className="text-xs text-destructive">{errors.nomeAluno.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="idade">Idade</Label>
          <Input id="idade" type="number" {...register('idade')} placeholder="Idade do aluno" />
           {errors.idade && <p className="text-xs text-destructive">{errors.idade.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serie">Série</Label>
            <Input id="serie" {...register('serie')} placeholder="Ex: 5º Ano" />
             {errors.serie && <p className="text-xs text-destructive">{errors.serie.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Turno</Label>
            <Controller
                name="turno"
                control={form.control}
                render={({ field }) => (
                    <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4 pt-2"
                    >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manha" id="manha" />
                        <Label htmlFor="manha">Manhã</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tarde" id="tarde" />
                        <Label htmlFor="tarde">Tarde</Label>
                    </div>
                    </RadioGroup>
                )}
                />

             {errors.turno && <p className="text-xs text-destructive pt-2">{errors.turno.message}</p>}
          </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="escola">Escola</Label>
        <Input id="escola" {...register('escola')} placeholder="Nome da escola" />
         {errors.escola && <p className="text-xs text-destructive">{errors.escola.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome-responsavel">Nome do Responsável</Label>
          <Input id="nome-responsavel" {...register('nomeResponsavel')} placeholder="Nome do pai ou mãe" />
           {errors.nomeResponsavel && <p className="text-xs text-destructive">{errors.nomeResponsavel.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone para Contato</Label>
          <Input id="telefone" type="tel" {...register('telefone')} placeholder="(99) 99999-9999" />
           {errors.telefone && <p className="text-xs text-destructive">{errors.telefone.message}</p>}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-start space-x-3">
          <Controller
            name="consent"
            control={form.control}
            render={({ field }) => (
                <Checkbox 
                    id="consent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                />
            )}
          />
          <Label htmlFor="consent" className="font-normal text-sm text-muted-foreground">
            Ao marcar esta caixa, você autoriza seu filho(a) a participar da atividade e concorda que a equipe entre em contato para agendamento.
          </Label>
        </div>
        {errors.consent && <p className="text-xs text-destructive pl-9 -mt-2">{errors.consent.message}</p>}
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar Autorização'}
        </Button>
      </div>
    </form>
  );
}
