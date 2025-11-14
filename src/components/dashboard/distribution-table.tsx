'use client';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Authorization } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Share2, Loader2 } from 'lucide-react';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Label } from '../ui/label';

export function DistributionTable({ data }: { data: Authorization[] }) {
  const { user } = useUser();
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [coordinatorId, setCoordinatorId] = React.useState<string>('');
  const [isDistributing, setIsDistributing] = React.useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(data.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleDistribute = async () => {
    if (!firestore || !user) {
        toast({ title: "Erro", description: "Não foi possível conectar ao sistema. Tente novamente.", variant: "destructive" });
        return;
    }
    if (selectedRows.length === 0 || !coordinatorId) {
        toast({ title: "Atenção", description: "Selecione pelo menos um lead e informe o ID da coordenadora.", variant: "destructive"});
        return;
    }

    setIsDistributing(true);
    try {
        const batch = writeBatch(firestore);
        
        selectedRows.forEach(id => {
            const docRef = doc(firestore, 'authorizations', id);
            batch.update(docRef, {
                status: 'distribuido',
                coordenadoraId: coordinatorId,
                gestorId: user.uid, // Assuming the logged-in user is the gestor
                atualizadoEm: serverTimestamp()
            });
        });

        await batch.commit();

        toast({
            title: 'Sucesso!',
            description: `${selectedRows.length} lead(s) distribuído(s) com sucesso.`,
            className: 'bg-accent text-accent-foreground',
        });

        setSelectedRows([]);
        setCoordinatorId('');
    } catch (error) {
        console.error("Error distributing leads:", error);
        toast({ title: "Erro", description: "Ocorreu um erro ao distribuir os leads.", variant: "destructive"});
    } finally {
        setIsDistributing(false);
    }
  };
  
  const formatDateFromTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };


  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Novos Cadastros</CardTitle>
          <CardDescription>
            {data.length} cadastros aguardando para serem distribuídos.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <div className="space-y-1">
             <Label htmlFor="coordinatorId" className="sr-only">ID da Coordenadora</Label>
             <Input 
              id="coordinatorId"
              placeholder="ID da Coordenadora"
              value={coordinatorId}
              onChange={(e) => setCoordinatorId(e.target.value)}
              disabled={isDistributing}
              className="w-full sm:w-[220px]"
            />
          </div>
          <Button 
            onClick={handleDistribute} 
            disabled={selectedRows.length === 0 || !coordinatorId || isDistributing}
            className="w-full sm:w-auto"
          >
            {isDistributing ? <Loader2 className="mr-2 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            Distribuir ({selectedRows.length})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox
                    onCheckedChange={handleSelectAll}
                    checked={data.length > 0 && selectedRows.length === data.length ? true : selectedRows.length > 0 ? 'indeterminate' : false}
                    aria-label="Selecionar todos"
                    />
                </TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead className="hidden md:table-cell">Escola</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="hidden sm:table-cell">Data de Cadastro</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length > 0 ? data.map((auth) => (
                <TableRow key={auth.id} data-state={selectedRows.includes(auth.id) && "selected"}>
                    <TableCell>
                    <Checkbox
                        onCheckedChange={(checked) => handleSelectRow(auth.id, !!checked)}
                        checked={selectedRows.includes(auth.id)}
                        aria-label={`Selecionar ${auth.nomeAluno}`}
                    />
                    </TableCell>
                    <TableCell className="font-medium">{auth.nomeAluno}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{auth.escola}</TableCell>
                    <TableCell>{auth.nomeResponsavel}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDateFromTimestamp(auth.dataCadastro)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{auth.status}</Badge>
                    </TableCell>
                </TableRow>
                )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum cadastro pendente para distribuição.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
