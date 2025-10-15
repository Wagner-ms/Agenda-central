export type Status = "pendente" | "liberado" | "agendado" | "compareceu" | "nao_compareceu" | "remarcado";

export interface Authorization {
  id: string;
  nomeAluno: string;
  idade: number;
  serie: string;
  turno: 'Manhã' | 'Tarde';
  escola: string;
  nomeResponsavel: string;
  telefone: string;
  status: Status;
  dataCadastro: string; // ISO date string
  dataLiberacao?: string; // ISO date string
  dataAgendamento?: string; // ISO date string
  horaAgendamento?: string; // HH:mm
  observacoes?: string;
  atendenteId?: string; // Telemarketing user ID
  criadoPor: 'coordenacao' | 'telemarketing' | 'sistema';
  atualizadoEm: string; // ISO date string
}
