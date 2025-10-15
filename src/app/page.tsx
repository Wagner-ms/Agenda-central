import LoginForm from '@/components/auth/login-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckSquare className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Agenda Central</CardTitle>
            <CardDescription>Bem-vindo! Faça login para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
