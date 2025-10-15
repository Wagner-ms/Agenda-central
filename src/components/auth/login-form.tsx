'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const coordinatorCredentials = {
  email: 'coordenadora@agendacentral.com',
  password: 'senha123',
};

const telemarketingCredentials = {
  email: 'telemarketing@agendacentral.com',
  password: 'senha123',
};


export default function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!auth) {
        setError('Serviço de autenticação indisponível.');
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: 'Login bem-sucedido!',
        description: `Bem-vindo(a) de volta!`,
        className: 'bg-accent text-accent-foreground',
      });
      
      // Redirect based on the logged-in user's email
      if (userCredential.user.email === coordinatorCredentials.email) {
        router.push('/dashboard/autorizacoes');
      } else {
        router.push('/dashboard/agendamento');
      }

    } catch (err: any) {
      setError('Credenciais inválidas. Verifique seu email e senha.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillForm = (role: 'coordinator' | 'telemarketing') => {
    if (role === 'coordinator') {
      setEmail(coordinatorCredentials.email);
      setPassword(coordinatorCredentials.password);
    } else {
      setEmail(telemarketingCredentials.email);
      setPassword(telemarketingCredentials.password);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="seu@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="********" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro no Login</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 pt-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar'}
        </Button>
        <div className='text-center text-xs text-muted-foreground'>
            <p>Para demonstração, use os logins abaixo:</p>
            <div className='flex gap-2 justify-center pt-2'>
                <Button type="button" variant="link" size="sm" className="p-0 h-auto" onClick={() => fillForm('coordinator')}>Usar Coordenadora</Button>
                <Button type="button" variant="link" size="sm" className="p-0 h-auto" onClick={() => fillForm('telemarketing')}>Usar Telemarketing</Button>
            </div>
        </div>
      </div>
    </form>
  );
}
