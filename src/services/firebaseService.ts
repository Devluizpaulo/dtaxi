import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, Timestamp, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export type MensagemTipo = 'reclamacao' | 'elogio' | 'informacao' | 'sugestao' | 'duvida';

export interface HistoricoAcao {
  acao: string;
  usuario: { uid: string; nome: string };
  data: Timestamp;
  observacao?: string;
}

export interface Mensagem {
  id?: string;
  protocolo: string | null;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  prefixo: string;
  tipo: MensagemTipo;
  assunto: string;
  status: 'pendente' | 'resolvido' | 'arquivado';
  politicaPrivacidade: boolean;
  dataCriacao: Timestamp;
  dataArquivamento?: Timestamp;
  resolvido: boolean;
  resolucao?: string;
  historico: HistoricoAcao[];
}

export async function gerarProtocolo(tipo: MensagemTipo): Promise<string> {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  
  // Prefixos específicos por tipo
  const prefixos = {
    'reclamacao': 'REC',
    'elogio': 'ELO', 
    'sugestao': 'SUG',
    'duvida': 'DUV',
    'informacao': 'INF'
  };
  
  // Busca quantidade do ano para incrementar
  const colecao = COLECOES_FIREBASE[tipo];
  const snap = await getDocs(collection(db, colecao));
  const count = snap.docs.filter(doc => {
    const d = doc.data().dataCriacao?.toDate();
    return d && d.getFullYear() === ano;
  }).length + 1;
  
  return `${prefixos[tipo]}-${String(count).padStart(5, '0')}-${ano}`;
}

export async function adicionarMensagem(
  dados: {
    nome: string;
    email: string;
    telefone: string;
    mensagem: string;
    prefixo: string;
    assunto: string;
    politicaPrivacidade: boolean;
  }, 
  tipo: MensagemTipo, 
  usuario?: User
) {
  const protocolo = await gerarProtocolo(tipo);
  const novaMensagem: Mensagem = {
    ...dados,
    protocolo,
    tipo,
    status: 'pendente',
    dataCriacao: Timestamp.now(),
    resolvido: false,
    historico: [{
      acao: 'Mensagem criada',
      usuario: { 
        uid: usuario?.uid || 'sistema', 
        nome: usuario?.displayName || 'Sistema' 
      },
      data: Timestamp.now(),
    }]
  };
  
  const colecao = COLECOES_FIREBASE[tipo];
  await addDoc(collection(db, colecao), novaMensagem);
  return novaMensagem;
}

// Constante para mapear tipos para coleções
export const COLECOES_FIREBASE = {
  'reclamacao': 'reclamacoes',
  'elogio': 'elogios', 
  'sugestao': 'sugestoes',
  'duvida': 'duvidas',
  'informacao': 'informacoes',
  'arquivadas': 'arquivadas'
} as const;
// Outras funções: listar, migrar, arquivar, desarquivar, adicionar ao histórico, etc.