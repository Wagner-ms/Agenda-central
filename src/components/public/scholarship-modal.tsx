'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function ScholarshipModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the modal has been shown before in this session
    const hasBeenShown = sessionStorage.getItem('scholarshipModalShown');
    if (!hasBeenShown) {
      setIsOpen(true);
      sessionStorage.setItem('scholarshipModalShown', 'true');
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-positivo.png"
              alt="Logo Universidade Positivo Polo Portão"
              width={240}
              height={80}
              className="object-contain"
            />
          </div>
          <DialogTitle className="text-center text-2xl font-bold tracking-tight">
            Inscrições Abertas para Bolsas de Estudo!
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2 text-sm text-muted-foreground space-y-4">
            <p className='font-semibold'>A Universidade Positivo tem a satisfação de informar que estão abertas as inscrições para BOLSAS DE ESTUDO do 1° semestre de 2026.</p>
            <div>
                <p className="font-semibold text-foreground">O que estamos oferecendo:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>
                        Treinamentos de capacitação profissional 100% gratuitos, destinados a alunos do 6° ano ao 3° ano do Ensino Médio, por meio do Projeto Aprendiz Positivo (Um projeto filantrópico do polo Portão).
                    </li>
                    <li>
                        Bolsas de estudo com até 80% de desconto em diversos cursos profissionalizantes, técnicos, graduações e pós-graduações.
                    </li>
                </ul>
            </div>
            <p>
                As bolsas serão concedidas conforme avaliação agendada no polo Portão, incentivando o crescimento acadêmico e preparando para o mercado de trabalho.
            </p>
        </div>
        <DialogFooter className="p-6 pt-0 bg-secondary/30">
          <Button onClick={() => setIsOpen(false)} className="w-full">
            Entendi, continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
