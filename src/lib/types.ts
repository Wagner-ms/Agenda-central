import type { Timestamp } from 'firebase/firestore';

export type Status = "pendente" | "liberado" | "agendado" | "compareceu" | "nao_compareceu" | "remarcado";

export interface Authorization {
  id: string;
  nomeAluno: string;
  idade: number;
  serie: string;
  turno: 'Manhã' | 'Tarde' | string; // Allow string for form flexibility
  escola: string;
  nomeResponsavel: string;
  telefone: string;
  status: Status;
  dataCadastro: Timestamp | string; // Can be a server timestamp or ISO string
  dataLiberacao?: Timestamp | string;
  dataAgendamento?: Timestamp | string;
  horaAgendamento?: string; // HH:mm
  observacoes?: string;
  atendenteId?: string; // Telemarketing user ID
  criadoPor: 'coordenacao' | 'telemarketing' | 'sistema';
  atualizadoEm: Timestamp | string;
}
