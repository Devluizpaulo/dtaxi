import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Avaliacao {
  id: string;
  usuario: {
    nome: string;
    iniciais: string;
  };
  nota: number;
  comentario: string;
  timestamp: Timestamp;
}

interface Mensagem {
  id: string;
  usuario: {
    nome: string;
    iniciais: string;
  };
  mensagem: string;
  timestamp: Timestamp;
}

const useAvaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [media, setMedia] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'avaliacoes'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const avaliacoesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Avaliacao[];
        setAvaliacoes(avaliacoesData);
        const media =
          avaliacoesData.length > 0
            ? avaliacoesData.reduce((acc, curr) => acc + curr.nota, 0) / avaliacoesData.length
            : 0;
        setMedia(media);
      } catch (error) {
        setError('Erro ao buscar avaliações');
      } finally {
        setLoading(false);
      }
    };
    fetchAvaliacoes();
  }, []);
  return { avaliacoes, media, loading, error };
};

const useMensagens = () => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMensagens = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'mensagens'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const mensagensData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Mensagem[];
        setMensagens(mensagensData);
      } catch (error) {
        setError('Erro ao buscar mensagens');
      } finally {
        setLoading(false);
      }
    };
    fetchMensagens();
  }, []);
  return { mensagens, loading, error };
};

const AvaliacaoCard: React.FC<{ avaliacao: Avaliacao }> = ({ avaliacao }) => (
  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{avaliacao.usuario.iniciais}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{avaliacao.usuario.nome}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm font-medium">{avaliacao.nota.toFixed(1)}</span>
                        </div>
                      </div>
      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{avaliacao.comentario}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(avaliacao.timestamp.toDate(), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
);

const MensagemCard: React.FC<{ mensagem: Mensagem }> = ({ mensagem }) => (
  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{mensagem.usuario.iniciais}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{mensagem.usuario.nome}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(mensagem.timestamp.toDate(), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </span>
                    </div>
      <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line break-words">
                      {mensagem.mensagem}
      </div>
    </div>
  </div>
);

const DashboardOverview = () => {
  const { avaliacoes, media, loading: loadingAval, error: errorAval } = useAvaliacoes();
  const { mensagens, loading: loadingMsg, error: errorMsg } = useMensagens();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Avaliações */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Avaliações de Satisfação</CardTitle>
            <CardDescription>Últimas avaliações dos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-2xl font-bold">{media.toFixed(1)}</span>
                  </div>
                <div className="text-sm text-muted-foreground">
                  Média geral de satisfação
                </div>
              </div>
              {loadingAval ? (
                <div className="text-center py-8 text-muted-foreground">Carregando avaliações...</div>
              ) : errorAval ? (
                <div className="text-center py-8 text-red-500">{errorAval}</div>
              ) : avaliacoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma avaliação encontrada.</div>
              ) : (
                <div className="space-y-3">
                  {avaliacoes.map(avaliacao => (
                    <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Card de Mensagens */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Últimas Mensagens</CardTitle>
            <CardDescription>Mensagens mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingMsg ? (
                <div className="text-center py-8 text-muted-foreground">Carregando mensagens...</div>
              ) : errorMsg ? (
                <div className="text-center py-8 text-red-500">{errorMsg}</div>
              ) : mensagens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma mensagem encontrada.</div>
              ) : (
                mensagens.map(mensagem => (
                  <MensagemCard key={mensagem.id} mensagem={mensagem} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
