

'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Authorization } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';

function LinedField({ label, value, className }: { label: string; value?: string | number; className?: string }) {
    return (
        <div className={className}>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-600">{label}</label>
            <div className="border-b border-gray-500 p-1 text-xs h-5 flex items-end">{value || ''}</div>
        </div>
    );
}

function CheckboxField({ label, option1, option2, qualLabel }: { label: string; option1: string; option2: string; qualLabel?: string }) {
    return (
        <div className="flex items-end gap-x-3 text-[10px]">
            <span className="font-semibold">{label}</span>
            <span className="flex items-center gap-1">( ) {option1}</span>
            {qualLabel && <span className="flex items-center gap-1">QUAL? <div className="border-b border-gray-500 w-24 h-4"></div></span>}
            <span className="flex items-center gap-1">( ) {option2}</span>
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
        <div className="bg-white text-black font-sans p-2 max-w-4xl mx-auto printable-area border border-black">
            <header className="mb-2">
                 <div className="flex justify-between items-start mb-1">
                    <h1 className="text-base font-bold mt-2">FICHA DE ATENDIMENTO – Nº ________</h1>
                    <Image 
                        src="/logo.png" 
                        alt="Logo da Empresa" 
                        width={150} 
                        height={50}
                        className="object-contain"
                    />
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-left text-xs">
                    <LinedField label="DATA" value={`${format(new Date(), 'dd/MM/yyyy')}`} />
                    <LinedField label="CÓDIGO BOLSA" />
                    <LinedField label="ORIENTADOR" />
                </div>
            </header>

            <section className="mb-1">
                <h2 className="text-xs font-bold bg-gray-200 px-1 py-0.5 mb-1">DADOS PESSOAIS DO JOVEM</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-2 gap-y-0 text-[10px]">
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
                 <div className="mt-1">
                    <CheckboxField label="ALUNO POSSUI ALGUMA NECESSIDADE ESPECIAL?" option1="SIM" option2="NÃO" qualLabel="QUAL" />
                </div>
            </section>
            
            <section className="mb-1">
                <h2 className="text-xs font-bold bg-gray-200 px-1 py-0.5 mb-1">DADOS PESSOAIS DO RESPONSÁVEL</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-0 text-[10px]">
                    <LinedField label="Nome" value={data.nomeResponsavel} className="col-span-2" />
                    <LinedField label="Data de Nascimento" />
                    <LinedField label="Profissão" />
                    <LinedField label="Telefone" value={data.telefone} />
                    <LinedField label="CPF" />
                    <LinedField label="RG" />
                    <LinedField label="E-mail" className="col-span-2" />
                </div>
            </section>

             <section className="mb-1">
                <h2 className="text-xs font-bold bg-gray-200 px-1 py-0.5 mb-1">PERFIL PROFISSIONAL DO ALUNO</h2>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] mb-1">
                    <span>( ) INFORMÁTICA BÁSICA</span>
                    <span>( ) INFORMÁTICA AVANÇADA</span>
                    <span>( ) ADMINISTRAÇÃO</span>
                    <span>( ) INGLÊS</span>
                    <span>( ) ESPANHOL</span>
                </div>
                 <LinedField label="Outros" className="text-xs" />
                 <LinedField label="Que faculdade gostaria de fazer" className="mt-1 text-xs" />
            </section>
            
            <section className="mb-1 text-[10px]">
                <h2 className="text-xs font-bold bg-gray-200 px-1 py-0.5 mb-1">PERFIL SOCIAL</h2>
                <div className="space-y-0.5">
                    <CheckboxField label="JÁ PARTICIPOU DE ALGUM PROJETO SOCIAL?" option1="SIM" option2="NÃO" qualLabel="QUAL"/>
                    <CheckboxField label="JÁ PARTICIPOU DO PROGRAMA JOVEM APRENDIZ?" option1="SIM" option2="NÃO" qualLabel="QUAL EMPRESA"/>
                    <div className="flex gap-2 pt-1">
                        <LinedField label="É BENEFICIÁRIO DO BOLSA FAMÍLIA?" className="flex-1"/>
                        <LinedField label="HÁ QUANTO TEMPO?" className="flex-1"/>
                    </div>
                </div>
            </section>
            
            <section className="mb-1">
                <h2 className="text-xs font-bold bg-gray-200 px-1 py-0.5 mb-1">INDIQUE OUTROS JOVENS PARA TAMBÉM SEREM AJUDADOS PELO PROJETO CORRENTE DO BEM.</h2>
                <div className="space-y-0 text-[10px]">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-12 gap-x-2">
                            <LinedField label="Nome" className="col-span-6" />
                            <LinedField label="Idade" className="col-span-2" />
                            <LinedField label="Telefone" className="col-span-4" />
                        </div>
                    ))}
                </div>
            </section>

            <footer className="mt-4">
                <div className="flex justify-center items-center">
                    <div className="text-center w-1/2">
                        <div className="border-t border-black w-2/3 mx-auto pt-1">
                            <p className="text-xs">Assinatura do Responsável</p>
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
                        font-size: 10px;
                    }
                    @page {
                        size: A4;
                        margin: 8mm;
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
