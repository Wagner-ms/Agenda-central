'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function ScholarshipModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open the modal only once when the component mounts on the client
    setIsOpen(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <Image
              src="/logo-positivo.png"
              alt="Logo Universidade Positivo Polo Portão"
              width={240}
              height={80}
              className="object-contain"
            />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Inscrições Abertas para Bolsas de Estudo</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="space-y-4 text-sm text-foreground">
            <p>
              A Universidade Positivo tem a satisfação de informar que estão abertas as inscrições para BOLSAS DE ESTUDO do 1° semestre de 2026.
            </p>
            <p className="font-semibold">O que estamos oferecendo:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Treinamentos de capacitação profissional 100% gratuitos, destinados a alunos do 6° ano ao 3° ano do Ensino Médio, por meio do Projeto Aprendiz Positivo (Um projeto filantrópico do polo Portão).</li>
              <li>Bolsas de estudo com até 80% de desconto em diversos cursos profissionalizantes, técnicos, graduações e pós-graduações.</li>
            </ul>
            <p>
              As bolsas serão concedidas conforme avaliação agendada no polo Portão, incentivando o crescimento acadêmico e preparando para o mercado de trabalho.
            </p>
          </div>
        </DialogDescription>
        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={() => setIsOpen(false)}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}