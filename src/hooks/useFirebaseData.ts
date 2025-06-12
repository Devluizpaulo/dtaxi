import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';

export interface Driver {
  id: string;
  nome: string;
  status: 'online' | 'offline' | 'busy';
  avaliacao: number;
  localizacao: {
    lat: number;
    lng: number;
  };
  ultima_atualizacao?: Date;
  veiculo?: {
    modelo: string;
    placa: string;
  };
  frota?: string;
  coordenador?: string;
}

export interface Trip {
  id: string;
  motorista_id: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  inicio: Date;
  fim?: Date;
  avaliacao?: number;
  origem: string;
  destino: string;
  valor: number;
  frota?: string;
}

export interface PesquisaSatisfacao {
  id: string;
  dataResposta: string;
  email: string;
  media: number;
  nome: string;
  observacao: string;
  pergunta1: string;
  pergunta2: string;
  pergunta3: string;
  pergunta4: string;
  pergunta5: string;
  prefixo: string;
  telefone: string;
}

export interface Reclamacao {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  prefixo?: string;
  mensagem: string;
  dataEnvio: Date;
  arquivada: boolean;
}

export function useFirebaseData() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pesquisas, setPesquisas] = useState<PesquisaSatisfacao[]>([]);
  const [reclamacoes, setReclamacoes] = useState<Reclamacao[]>([]);
  const [reclamacoesArquivadas, setReclamacoesArquivadas] = useState<Reclamacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Listener para motoristas
    const driversUnsubscribe = onSnapshot(
      collection(db, 'motoristas'),
      (snapshot) => {
        try {
          const driversData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            ultima_atualizacao: doc.data().ultima_atualizacao?.toDate()
          })) as Driver[];
          console.log('Motoristas carregados:', driversData.length);
          setDrivers(driversData);
          setLoading(false);
        } catch (err) {
          console.error('Erro ao processar dados dos motoristas:', err);
          setError('Erro ao processar dados dos motoristas');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erro ao carregar motoristas:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Listener para viagens
    const tripsQuery = query(
      collection(db, 'viagens'),
      orderBy('inicio', 'desc'),
      limit(10)
    );

    const tripsUnsubscribe = onSnapshot(
      tripsQuery,
      (snapshot) => {
        try {
          const tripsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            inicio: doc.data().inicio?.toDate(),
            fim: doc.data().fim?.toDate()
          })) as Trip[];
          console.log('Viagens carregadas:', tripsData.length);
          setTrips(tripsData);
        } catch (err) {
          console.error('Erro ao processar dados das viagens:', err);
          setError('Erro ao processar dados das viagens');
        }
      },
      (err) => {
        console.error('Erro ao carregar viagens:', err);
        setError(err.message);
      }
    );

    // Listener para pesquisas de satisfação
    const pesquisasQuery = query(
      collection(db, 'pesquisa_satisfacao'),
      orderBy('dataResposta', 'desc'),
      limit(10)
    );

    const pesquisasUnsubscribe = onSnapshot(
      pesquisasQuery,
      (snapshot) => {
        try {
          const pesquisasData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as PesquisaSatisfacao[];
          console.log('Pesquisas carregadas:', pesquisasData.length);
          setPesquisas(pesquisasData);
        } catch (err) {
          console.error('Erro ao processar dados das pesquisas:', err);
          setError('Erro ao processar dados das pesquisas');
        }
      },
      (err) => {
        console.error('Erro ao carregar pesquisas:', err);
        setError(err.message);
      }
    );

    // Listener para reclamações ativas
    const reclamacoesQuery = query(
      collection(db, 'reclamacoes'),
      orderBy('dataEnvio', 'desc')
    );

    const reclamacoesUnsubscribe = onSnapshot(
      reclamacoesQuery,
      (snapshot) => {
        try {
          const reclamacoesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dataEnvio: doc.data().dataEnvio?.toDate(),
            arquivada: false
          })) as Reclamacao[];
          console.log('Reclamações ativas carregadas:', reclamacoesData.length);
          setReclamacoes(reclamacoesData);
        } catch (err) {
          console.error('Erro ao processar dados das reclamações:', err);
          setError('Erro ao processar dados das reclamações');
        }
      },
      (err) => {
        console.error('Erro ao carregar reclamações:', err);
        setError(err.message);
      }
    );

    // Listener para reclamações arquivadas
    const reclamacoesArquivadasQuery = query(
      collection(db, 'reclamacoes-arquivadas'),
      orderBy('dataEnvio', 'desc')
    );

    const reclamacoesArquivadasUnsubscribe = onSnapshot(
      reclamacoesArquivadasQuery,
      (snapshot) => {
        try {
          const reclamacoesArquivadasData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dataEnvio: doc.data().dataEnvio?.toDate(),
            arquivada: true
          })) as Reclamacao[];
          console.log('Reclamações arquivadas carregadas:', reclamacoesArquivadasData.length);
          setReclamacoesArquivadas(reclamacoesArquivadasData);
        } catch (err) {
          console.error('Erro ao processar dados das reclamações arquivadas:', err);
          setError('Erro ao processar dados das reclamações arquivadas');
        }
      },
      (err) => {
        console.error('Erro ao carregar reclamações arquivadas:', err);
        setError(err.message);
      }
    );

    // Cleanup function
    return () => {
      driversUnsubscribe();
      tripsUnsubscribe();
      pesquisasUnsubscribe();
      reclamacoesUnsubscribe();
      reclamacoesArquivadasUnsubscribe();
    };
  }, []);

  return { 
    drivers, 
    trips, 
    pesquisas, 
    reclamacoes, 
    reclamacoesArquivadas, 
    loading, 
    error 
  };
} 