import LoginForm from '@/components/auth/login-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';
import Link from 'next/link';

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
          <CardFooter className="flex justify-center">
             <Link href="/autorizar?escola=Escola%20Exemplo" className="text-sm text-primary hover:underline">
                Acessar formulário de autorização dos pais
              </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
