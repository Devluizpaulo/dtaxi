export interface Turma {
  id: string;
  nome: string;
  data: string;
  criadaEm: any;
  totalMotoristas: number;
  totalNotificados: number;
  totalCertificados: number;
}

export interface Motorista {
  id: string;
  unidade?: string;
  placa?: string;
  modelo?: string;
  nome: string;
  telefone: string;
  notificadoEm?: any;
  certificadoEmitidoEm?: any;
  [key: string]: any;
} 