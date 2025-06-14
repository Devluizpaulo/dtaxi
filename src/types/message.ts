export interface ContactMessage {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  tipo: 'duvida' | 'elogio' | 'reclamacao' | 'sugestao' | 'outro';
  status: 'pendente' | 'respondido' | 'arquivado';
  prioridade?: 'baixa' | 'media' | 'alta';
  protocolo?: string;
  tempoResposta?: number;
  foto?: string;
  createdAt?: Date | { toDate(): Date };
  archivedAt?: Date | { toDate(): Date };
  archivedBy?: string;
}

export interface MessageStats {
  total: number;
  novas: number;
  pendentes: number;
  respondidas: number;
  arquivadas: number;
  elogios: number;
  reclamacoes: number;
  duvidas: number;
  sugestoes: number;
}