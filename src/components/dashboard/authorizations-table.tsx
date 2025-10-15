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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Authorization } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';

export function AuthorizationsTable({ data }: { data: Authorization[] }) {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
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

  const handleRelease = () => {
    if (!firestore) {
        toast({ title: "Erro", description: "O serviço de banco de dados não está disponível.", variant: "destructive" });
        return;
    }
    
    selectedRows.forEach(id => {
      const docRef = doc(firestore, 'authorizations', id);
      updateDocumentNonBlocking(docRef, {
          status: 'liberado',
          dataLiberacao: serverTimestamp(),
          atualizadoEm: serverTimestamp()
      });
    });

    toast({
      title: 'Sucesso!',
      description: `${selectedRows.length} autorizaç${selectedRows.length > 1 ? 'ões' : 'ão'} liberada${selectedRows.length > 1 ? 's' : 'a'}.`,
      className: 'bg-accent text-accent-foreground',
    });
    setSelectedRows([]);
  };
  
  const formatDateFromTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cadastros Recebidos</CardTitle>
          <CardDescription>
            {data.length} cadastros pendentes de liberação.
          </CardDescription>
        </div>
        <Button onClick={handleRelease} disabled={selectedRows.length === 0}>
          <Send className="mr-2 h-4 w-4" />
          Liberar ({selectedRows.length})
        </Button>
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
                    Nenhuma autorização pendente.
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
