'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Users } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();

  const handleLogin = (role: 'coordinator' | 'telemarketing') => {
    // In a real app, you'd handle authentication here.
    // For this demo, we'll just redirect based on role.
    if (role === 'coordinator') {
      router.push('/dashboard/autorizacoes');
    } else {
      router.push('/dashboard/agendamento');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="seu@email.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" placeholder="********" />
      </div>
      <div className="space-y-2 pt-4">
        <p className="text-center text-sm text-muted-foreground">Para demonstração, escolha um perfil:</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => handleLogin('coordinator')} className="w-full" variant="outline">
            <User className="mr-2 h-4 w-4" /> Entrar como Coordenadora
          </Button>
          <Button onClick={() => handleLogin('telemarketing')} className="w-full">
            <Users className="mr-2 h-4 w-4" /> Entrar como Telemarketing
          </Button>
        </div>
      </div>
    </div>
  );
}
