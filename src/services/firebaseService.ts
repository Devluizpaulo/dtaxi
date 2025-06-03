import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, Timestamp, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export type MensagemTipo = 'reclamacao' | 'elogio' | 'informacao' | 'sugestao';

export interface HistoricoAcao {
  acao: string;
  usuario: { uid: string; nome: string };
  data: Timestamp;
  observacao?: string;
}

export interface Mensagem {
  id?: string;
  protocolo: string;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  prefixo: string;
  tipo: MensagemTipo;
  dataCriacao: Timestamp;
  dataArquivamento?: Timestamp;
  resolvido: boolean;
  resolucao?: string;
  historico: HistoricoAcao[];
}

export async function gerarProtocolo(tipo: MensagemTipo): Promise<string> {
  const hoje = new Date();
  const dataStr = hoje.toISOString().slice(0, 10).replace(/-/g, '');
  // Busca quantidade do dia para incrementar
  const snap = await getDocs(collection(db, tipo + 's'));
  const count = snap.docs.filter(doc => {
    const d = doc.data().dataCriacao?.toDate();
    return d && d.toISOString().slice(0, 10) === hoje.toISOString().slice(0, 10);
  }).length + 1;
  return `REC-${dataStr}-${String(count).padStart(4, '0')}`;
}

export async function adicionarMensagem(mensagem: Omit<Mensagem, 'protocolo' | 'dataCriacao' | 'historico'>, tipo: MensagemTipo, usuario: User) {
  const protocolo = await gerarProtocolo(tipo);
  const novaMensagem: Mensagem = {
    ...mensagem,
    protocolo,
    tipo,
    dataCriacao: Timestamp.now(),
    resolvido: false,
    historico: [{
      acao: 'criado',
      usuario: { uid: usuario.uid, nome: usuario.displayName || 'Usuário' },
      data: Timestamp.now(),
    }]
  };
  await addDoc(collection(db, tipo + 's'), novaMensagem);
  return novaMensagem;
}
// Outras funções: listar, migrar, arquivar, desarquivar, adicionar ao histórico, etc. 