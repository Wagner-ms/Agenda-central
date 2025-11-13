'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

export function ScholarshipModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open the modal only on the client side after the component mounts
    setIsOpen(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-positivo.png"
              alt="Logo Universidade Positivo Polo Portão"
              width={240}
              height={80}
              className="object-contain"
            />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Bolsas de Estudo 1° Semestre 2026</DialogTitle>
          <DialogDescription className="text-center text-md">
            A Universidade Positivo tem a satisfação de anunciar novas oportunidades!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-left text-muted-foreground">
          <p>
            O que estamos oferecendo:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Treinamentos de capacitação profissional 100% gratuitos, destinados a alunos do 6° ano ao 3° ano do Ensino Médio, por meio do Projeto Aprendiz Positivo (Um projeto filantrópico do polo Portão).
            </li>
            <li>
              Bolsas de estudo com até 80% de desconto** em diversos cursos profissionalizantes, técnicos, graduações e pós-graduações.
            </li>
          </ul>
          <p>
            As bolsas serão concedidas conforme avaliação agendada no polo Portão, incentivando o crescimento acadêmico e preparando para o mercado de trabalho.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
