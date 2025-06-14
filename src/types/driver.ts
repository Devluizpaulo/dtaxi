export interface Driver {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: 'ativo' | 'inativo' | 'pendente';
  avatar?: string;
  carro?: string;
  avaliacao?: number;
  corridas?: number;
  dataIngresso?: Date | { toDate(): Date };
  localizacao?: string;
  createdAt?: Date | { toDate(): Date };
  updatedAt?: Date | { toDate(): Date };
}

export interface DriverStats {
  total: number;
  ativos: number;
  pendentes: number;
  inativos: number;
  disponivel: number;
  ocupado: number;
  avaliacaoMedia: number;
  corridasTotal: number;
}