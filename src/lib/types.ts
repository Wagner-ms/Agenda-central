import type { Timestamp } from 'firebase/firestore';

export type Status = "pendente" | "distribuido" | "liberado" | "agendado" | "compareceu" | "nao_compareceu" | "remarcado" | "tel_incorreto" | "nao_interessado";

export interface Authorization {
  id: string;
  nomeAluno: string;
  idade: number;
  serie: string;
  turno: 'Manhã' | 'Tarde' | string;
  escola: string;
  nomeResponsavel: string;
  telefone: string;
  status: Status;
  dataCadastro: Timestamp | string;
  dataLiberacao?: Timestamp | string;
  dataAgendamento?: Timestamp | string;
  horaAgendamento?: string; // HH:mm
  observacoes?: string;
  gestorId?: string; // Gestor user ID
  coordenadoraId?: string; // Coordenadora user ID
  atendenteId?: string; // Telemarketing user ID
  criadoPor: 'coordenacao' | 'telemarketing' | 'sistema' | 'gestor';
  atualizadoEm: Timestamp | string;
  consent: boolean;
}
