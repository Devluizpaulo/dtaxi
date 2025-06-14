// Criar arquivo para tipos do Firebase
export interface FirebaseTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

export interface AvaliacaoFirebase {
  id: string;
  nota?: number;
  rating?: number;
  timestamp: FirebaseTimestamp;
  userId: string;
  motorista?: string;
  comentario?: string;
}

export interface MensagemFirebase {
  id: string;
  conteudo: string;
  remetente: string;
  timestamp: FirebaseTimestamp;
  read?: boolean;
  lida?: boolean;
  tipo?: string;
}

export interface ReclamacaoFirebase {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'resolvida' | 'aberta' | 'fechada';
  prioridade?: 'baixa' | 'media' | 'alta';
  timestamp: FirebaseTimestamp;
  usuario: string;
}