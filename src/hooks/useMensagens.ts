import { useState, useEffect, useCallback } from 'react';
import { Mensagem } from '@/services/firebaseService';
import { getDocs, collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const colecaoPorTipo: Record<string, string> = {
  reclamacao: 'reclamacoes',
  sugestao: 'sugestoes',
  informacao: 'informacoes',
  elogio: 'elogios',
  duvida: 'duvidas',
  outro: 'reclamacoes-arquivadas',
  arquivadas: 'arquivadas',
};

export function useMensagens(tipo: string) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMensagens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const colecao = colecaoPorTipo[tipo] || tipo;
      let q;
      
      if (tipo === 'arquivadas') {
        q = query(collection(db, colecao));
      } else {
        // Para coleções normais, buscar mensagens não arquivadas
        q = query(collection(db, colecao));
      }
      
      const snap = await getDocs(q);
      const mensagensData = snap.docs.map(doc => {
        const data = doc.data() as any;
        return { 
          ...data,
          id: doc.id,
          // Garantir compatibilidade com campos antigos e novos
          nome: data.nome || data.name || '',
          telefone: data.telefone || data.phone || '',
          mensagem: data.mensagem || data.message || '',
          prefixo: data.prefixo || data.vehiclePrefix || '',
          assunto: data.assunto || data.subject || '',
          politicaPrivacidade: data.politicaPrivacidade || data.privacyPolicy || false
        } as Mensagem;
      });
      
      setMensagens(mensagensData || []);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError('Erro ao carregar mensagens');
      setMensagens([]); // Garantir que sempre seja um array
    } finally {
      setLoading(false);
    }
  }, [tipo]);
  
  useEffect(() => {
    fetchMensagens();
  }, [fetchMensagens]);
  
  return { mensagens, loading, error, refresh: fetchMensagens };
}
