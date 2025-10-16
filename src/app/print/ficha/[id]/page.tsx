

'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Authorization } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function LinedField({ label, value, className }: { label: string; value?: string | number; className?: string }) {
    return (
        <div className={className}>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-gray-600">{label}</label>
            <div className="border-b border-gray-500 p-1 text-sm h-6 flex items-end">{value || ''}</div>
        </div>
    );
}

function CheckboxField({ label, option1, option2, qualLabel }: { label: string; option1: string; option2: string; qualLabel?: string }) {
    return (
        <div className="flex items-end gap-x-4 text-sm">
            <span>{label}</span>
            <span className="flex items-center gap-2">( ) {option1}</span>
            {qualLabel && <span className="flex items-center gap-2">QUAL? <div className="border-b border-gray-500 w-32 h-5"></div></span>}
            <span className="flex items-center gap-2">( ) {option2}</span>
        </div>
    );
}

function FichaDeAtendimento({ data }: { data: Authorization }) {
    
    const formatDate = (date: any) => {
        if (!date) return '___/___/______';
        const d = date.toDate ? date.toDate() : new Date(date);
        return format(d, "dd/MM/yyyy", { locale: ptBR });
    }

    return (
        <div className="bg-white text-black font-sans p-6 max-w-4xl mx-auto printable-area border-2 border-black">
            <header className="text-center mb-6">
                <h1 className="text-xl font-bold">FICHA DE ATENDIMENTO – Nº ________</h1>
                <div className="grid grid-cols-3 gap-4 text-left mt-3 text-xs">
                    <LinedField label="DATA" value={`${format(new Date(), 'dd/MM/yyyy')}`} />
                    <LinedField label="CÓDIGO BOLSA" />
                    <LinedField label="ORIENTADOR" />
                </div>
            </header>

            <section className="mb-4">
                <h2 className="text-base font-bold bg-gray-200 px-2 py-0.5 mb-2">DADOS PESSOAIS DO JOVEM</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2">
                    <LinedField label="Nome" value={data.nomeAluno} className="col-span-3" />
                    <LinedField label="Data Nascimento" />
                    <LinedField label="Idade" value={data.idade} />
                    <LinedField label="Série" value={data.serie} />
                    <LinedField label="CPF" />
                    <LinedField label="RG" />
                    <LinedField label="Telefone" />
                    <LinedField label="Escola" value={data.escola} className="col-span-2" />
                    <LinedField label="Turno" value={data.turno} />
                    <LinedField label="E-mail" className="col-span-4" />
                    <LinedField label="Endereço" className="col-span-2" />
                    <LinedField label="CEP" />
                     <LinedField label="N°" />
                    <LinedField label="Bairro" className="col-span-2"/>
                    <LinedField label="Cidade" />
                    <LinedField label="UF" />
                </div>
                 <div className="mt-2 text-xs">
                    <CheckboxField label="ALUNO POSSUI ALGUMA NECESSIDADE ESPECIAL?" option1="SIM" option2="NÃO" qualLabel="QUAL" />
                </div>
            </section>
            
            <section className="mb-4">
                <h2 className="text-base font-bold bg-gray-200 px-2 py-0.5 mb-2">DADOS PESSOAIS DO RESPONSÁVEL</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                    <LinedField label="Nome" value={data.nomeResponsavel} className="col-span-2" />
                    <LinedField label="Data de Nascimento" />
                    <LinedField label="Profissão" />
                    <LinedField label="Telefone" value={data.telefone} />
                    <LinedField label="CPF" />
                    <LinedField label="RG" />
                    <LinedField label="E-mail" className="col-span-2" />
                </div>
            </section>

             <section className="mb-4">
                <h2 className="text-base font-bold bg-gray-200 px-2 py-0.5 mb-2">PERFIL PROFISSIONAL DO ALUNO</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2">
                    <span>( ) INFORMÁTICA BÁSICA</span>
                    <span>( ) INFORMÁTICA AVANÇADA</span>
                    <span>( ) ADMINISTRAÇÃO</span>
                    <span>( ) INGLÊS</span>
                    <span>( ) ESPANHOL</span>
                </div>
                 <LinedField label="Outros" />
                 <LinedField label="Que faculdade gostaria de fazer" className="mt-1" />
            </section>
            
            <section className="mb-4 text-xs">
                <h2 className="text-base font-bold bg-gray-200 px-2 py-0.5 mb-2">PERFIL SOCIAL</h2>
                <div className="space-y-2">
                    <CheckboxField label="JÁ PARTICIPOU DE ALGUM PROJETO SOCIAL?" option1="SIM" option2="NÃO" qualLabel="QUAL"/>
                    <CheckboxField label="JÁ PARTICIPOU DO PROGRAMA JOVEM APRENDIZ?" option1="SIM" option2="NÃO" qualLabel="QUAL EMPRESA"/>
                    <div className="flex gap-4 pt-1">
                        <LinedField label="É BENEFICIÁRIO DO BOLSA FAMÍLIA?" className="flex-1"/>
                        <LinedField label="HÁ QUANTO TEMPO?" className="flex-1"/>
                    </div>
                </div>
            </section>
            
            <section className="mb-4">
                <h2 className="text-base font-bold bg-gray-200 px-2 py-0.5 mb-2">INDIQUE OUTROS JOVENS PARA TAMBÉM SEREM AJUDADOS PELO PROJETO CORRENTE DO BEM.</h2>
                <div className="space-y-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-12 gap-x-4">
                            <LinedField label="Nome" className="col-span-6" />
                            <LinedField label="Idade" className="col-span-2" />
                            <LinedField label="Telefone" className="col-span-4" />
                        </div>
                    ))}
                </div>
            </section>

            <footer className="mt-8">
                <div className="flex justify-center items-center">
                    <div className="text-center w-1/2">
                        <div className="border-t-2 border-black w-2/3 mx-auto pt-1">
                            <p className="text-sm">Assinatura do Responsável</p>
                        </div>
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
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }
                .border-b {
                    border-color: #374151; /* gray-700 */
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

    
