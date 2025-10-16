
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Authorization } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format }s from 'date-fns';
import { ptBR } from 'date-fns/locale';

function FichaDeAtendimento({ data }: { data: Authorization }) {
    
    const formatDate = (date: any) => {
        if (!date) return '___/___/______';
        const d = date.toDate ? date.toDate() : new Date(date);
        return format(d, "dd/MM/yyyy", { locale: ptBR });
    }

    return (
        <div className="bg-white text-black font-serif p-8 max-w-4xl mx-auto printable-area">
            <header className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-2">FICHA DE ATENDIMENTO</h1>
                <p className="text-lg">Preencha os campos abaixo com atenção.</p>
            </header>

            <section className="mb-8">
                <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-4">DADOS DO ALUNO</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Nome Completo do Aluno(a):</label>
                        <div className="border-b border-gray-400 p-2 text-lg">{data.nomeAluno}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Idade:</label>
                        <div className="border-b border-gray-400 p-2 text-lg">{data.idade}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Escola:</label>
                        <div className="border-b border-gray-400 p-2 text-lg">{data.escola}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Série / Ano:</label>
                        <div className="border-b border-gray-400 p-2 text-lg">{data.serie}</div>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-4">DADOS DO RESPONSÁVEL</h2>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Nome do Responsável:</label>
                        <div className="border-b border-gray-400 p-2 text-lg">{data.nomeResponsavel}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Telefone para Contato:</label>
                        <div className="border-b border-gray-400 p-2 text-lg">{data.telefone}</div>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold mb-1">Endereço:</label>
                        <div className="border-b border-gray-400 p-2 h-10"></div>
                    </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1">Bairro:</label>
                        <div className="border-b border-gray-400 p-2 h-10"></div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Cidade:</label>
                        <div className="border-b border-gray-400 p-2 h-10"></div>
                    </div>
                </div>
            </section>
            
            <section className="mb-8">
                <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-4">INFORMAÇÕES ADICIONAIS</h2>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-semibold mb-1">Como conheceu nossa unidade?</label>
                        <div className="border-b border-gray-400 p-2 h-10"></div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Observações:</label>
                        <div className="border-b border-gray-400 p-2 h-20"></div>
                    </div>
                </div>
            </section>

            <footer className="mt-20">
                <div className="flex justify-between items-center">
                    <div className="text-center w-1/2">
                        <div className="border-t border-black w-2/3 mx-auto pt-2">
                            <p>Assinatura do Responsável</p>
                        </div>
                    </div>
                    <div className="text-center w-1/2">
                         <p>Data: _____/_____/______</p>
                    </div>
                </div>
            </footer>
             <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                }
            `}</style>
        </div>
    );
}


export default function FichaPage() {
    const params = useParams();
    const firestore = useFirestore();
    const authorizationId = params.id as string;

    const authorizationRef = useMemoFirebase(() => {
        if (!firestore || !authorizationId) return null;
        return doc(firestore, 'authorizations', authorizationId);
    }, [firestore, authorizationId]);

    const { data, isLoading } = useDoc<Authorization>(authorizationRef);

    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
                <Skeleton className="h-12 w-1/2 mx-auto" />
                <Skeleton className="h-8 w-1/3" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-8 w-1/3" />
                 <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center p-8">Ficha de atendimento não encontrada.</div>;
    }

    return <FichaDeAtendimento data={data} />;
}

