'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthorizationForm from '@/components/public/authorization-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

function AuthorizationPageContent() {
    const searchParams = useSearchParams();
    const schoolName = searchParams.get('escola') || '';

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 font-form">
            <div className="w-full max-w-2xl">
                <Card className="shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <CheckSquare className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight">Autorização de Atividade</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                            Preencha os dados abaixo para autorizar a participação do aluno.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AuthorizationForm initialSchoolName={schoolName} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}


export default function AuthorizationPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AuthorizationPageContent />
        </Suspense>
    );
}
