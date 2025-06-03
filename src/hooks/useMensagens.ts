import { useState, useEffect } from 'react';
import { Mensagem, MensagemTipo } from '@/services/firebaseService';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const colecaoPorTipo: Record<string, string> = {
  reclamacao: 'reclamacoes',
  sugestao: 'sugestoes',
  informacao: 'informacoes',
  elogio: 'elogios',
  outro: 'outras-mensagens',
  arquivadas: 'reclamacoes-arquivadas',
};

export function useMensagens(tipo: string) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  useEffect(() => {
    let colecao = colecaoPorTipo[tipo] || tipo;
    let q;
    if (tipo === 'arquivadas') {
      q = query(collection(db, colecao));
    } else {
      q = query(collection(db, colecao), where('dataArquivamento', '==', null));
    }
    getDocs(q).then(snap => {
      setMensagens(snap.docs.map(doc => {
        const data = doc.data() as any;
        return { ...data, id: doc.id } as Mensagem;
      }));
    });
  }, [tipo]);
  return mensagens;
} 