import { useState, useEffect } from 'react';
import { Mensagem, MensagemTipo } from '@/services/firebaseService';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const colecaoPorTipo: Record<string, string> = {
  reclamacao: 'reclamacoes',
  sugestao: 'sugestoes',
  informacao: 'informacoes',
  elogio: 'elogios',
  duvida: 'duvidas',
  outro: 'outras-mensagens',
  arquivadas: 'arquivadas',
};

export function useMensagens(tipo: string) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchMensagens() {
      try {
        setLoading(true);
        setError(null);
        
        let colecao = colecaoPorTipo[tipo] || tipo;
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
            nome: data.nome || data.name,
            telefone: data.telefone || data.phone,
            mensagem: data.mensagem || data.message,
            prefixo: data.prefixo || data.vehiclePrefix,
            assunto: data.assunto || data.subject,
            politicaPrivacidade: data.politicaPrivacidade || data.privacyPolicy
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
    }
    
    fetchMensagens();
  }, [tipo]);
  
  return { mensagens, loading, error };
}