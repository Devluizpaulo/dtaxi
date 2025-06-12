// Tipos centralizados para os componentes de coordination

export interface Coordenador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  regiao: string;
  status: "ativo" | "inativo";
}

export interface Documento {
  id: string;
  tipo: string;
  titulo: string;
  data: string;
  descricao?: string;
  arquivoUrl?: string;
  observacoes?: string;
  numero?: string;
  horario?: string;
  local?: string;
  presentes?: string;
  convidados?: string;
  ausentes?: string;
  ordem?: string;
  debates?: string;
  decisoes?: string;
  votos?: string;
  recurso?: string;
  encerramento?: string;
  proxima?: string;
  secretario?: string;
  pdfUrl?: string;
  linkOrigem?: string;
  texto?: string;
  [key: string]: any;
}

export interface Comunicado {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
  enviadoPara?: string;
}

export interface ModeloDocumento {
  titulo: string;
  corpo: string;
}
export interface MensagemModelo {
  id: string;
  titulo: string;
  corpo: string;
}
