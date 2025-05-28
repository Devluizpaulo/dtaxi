import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, BarChart2, PlusCircle, FileText, Settings, Download, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
  const navigate = useNavigate();

  // Exemplo de dados para gráfico de evolução da média (mock)
  const mediaHistorico = [4.2, 4.4, 4.5, 4.6, 4.7, 4.5, 4.8];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button variant="secondary" className="flex flex-col items-center gap-1 py-6" onClick={() => navigate('/dashboard/satisfacao')}>
          <PlusCircle className="h-7 w-7 mb-1 text-taxi-green" />
          Nova Avaliação
        </Button>
        <Button variant="secondary" className="flex flex-col items-center gap-1 py-6" onClick={() => navigate('/dashboard/mensagens')}>
          <PlusCircle className="h-7 w-7 mb-1 text-taxi-yellow" />
          Nova Mensagem
        </Button>
        <Button variant="secondary" className="flex flex-col items-center gap-1 py-6" onClick={() => navigate('/dashboard/satisfacao')}>
          <FileText className="h-7 w-7 mb-1 text-blue-500" />
          Relatório
        </Button>
        <Button variant="secondary" className="flex flex-col items-center gap-1 py-6" onClick={() => navigate('/dashboard/configuracoes')}>
          <Settings className="h-7 w-7 mb-1 text-gray-500" />
          Configurações
        </Button>
      </div>
      {/* Cards principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Avaliações */}
        <Card className="col-span-1">
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
        <Card className="col-span-1">
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
        {/* Card de Gráfico de evolução da média */}
        <Card className="col-span-1 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle>Evolução da Média</CardTitle>
            <CardDescription>Últimos 7 períodos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              {/* Gráfico de barras simples (mock) */}
              <div className="flex items-end gap-1 h-24 w-full max-w-xs mx-auto">
                {mediaHistorico.map((valor, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end h-full">
                    <div
                      className="bg-taxi-green rounded-t-md"
                      style={{ height: `${valor * 20}px`, width: '18px', minHeight: '8px' }}
                      title={`Média: ${valor}`}
                    ></div>
                    <span className="text-xs text-muted-foreground mt-1">{valor.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Ferramentas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Button variant="outline" className="flex items-center gap-2 justify-center py-6" onClick={() => alert('Exportar dados!')}>
          <Download className="h-6 w-6 text-blue-500" /> Exportar Dados
        </Button>
        <Button variant="outline" className="flex items-center gap-2 justify-center py-6" onClick={() => alert('Gerar PDF!')}>
          <FileText className="h-6 w-6 text-taxi-green" /> Gerar Relatório PDF
        </Button>
        <Button variant="outline" className="flex items-center gap-2 justify-center py-6" onClick={() => alert('Acessar suporte!')}>
          <HelpCircle className="h-6 w-6 text-yellow-500" /> Suporte
        </Button>
      </div>
      {/* Links rápidos extras */}
      <div className="flex flex-wrap gap-4 mt-6">
        <Button variant="outline" onClick={() => navigate('/dashboard/satisfacao')}>Ver todas as avaliações</Button>
        <Button variant="outline" onClick={() => navigate('/dashboard/mensagens')}>Ver todas as mensagens</Button>
        <Button variant="default" onClick={() => navigate('/dashboard/mensagens?status=pendente')}>Reclamações Pendentes</Button>
        <Button variant="default" onClick={() => navigate('/dashboard/satisfacao')}>Relatório de Satisfação</Button>
      </div>
    </div>
  );
};

export default DashboardOverview;
