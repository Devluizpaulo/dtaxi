import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, BarChart2, PlusCircle, FileText, Settings, Download, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, limit, getDocs, Timestamp, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

interface Reclamacao {
  id: string;
  usuario: {
    nome: string;
    iniciais: string;
  };
  mensagem: string;
  timestamp: Timestamp;
}

interface Pesquisa {
  id: string;
  usuario: {
    nome: string;
    iniciais: string;
  };
  resposta: string;
  timestamp: Timestamp;
}

const useAvaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [media, setMedia] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      setLoading(true);
        const q = query(
          collection(db, 'avaliacoes'),
          orderBy('timestamp', 'desc'),
      limit(50)
        );
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
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
      setLoading(false);
    }, () => {
        setError('Erro ao buscar avaliações');
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  return { avaliacoes, media, loading, error };
};

const useMensagens = () => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      setLoading(true);
        const q = query(
          collection(db, 'mensagens'),
          orderBy('timestamp', 'desc'),
      limit(50)
        );
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
        const mensagensData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Mensagem[];
        setMensagens(mensagensData);
      setLoading(false);
    }, () => {
        setError('Erro ao buscar mensagens');
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  return { mensagens, loading, error };
};

const useReclamacoes = () => {
  const [reclamacoes, setReclamacoes] = useState<Reclamacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'reclamacoes'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reclamacao[];
      setReclamacoes(data);
      setLoading(false);
    }, () => {
      setError('Erro ao buscar reclamações');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  return { reclamacoes, loading, error };
};

const usePesquisas = () => {
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'pesquisas'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pesquisa[];
      setPesquisas(data);
      setLoading(false);
    }, () => {
      setError('Erro ao buscar pesquisas');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  return { pesquisas, loading, error };
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

const ReclamacaoCard: React.FC<{ reclamacao: Reclamacao }> = ({ reclamacao }) => (
  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-sm font-medium">{reclamacao.usuario.iniciais}</span>
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{reclamacao.usuario.nome}</h4>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(reclamacao.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
        </span>
      </div>
      <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line break-words">
        {reclamacao.mensagem}
      </div>
    </div>
  </div>
);

const PesquisaCard: React.FC<{ pesquisa: Pesquisa }> = ({ pesquisa }) => (
  <div className="flex items-start gap-3 p-3 bg-muted rounded-md">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-sm font-medium">{pesquisa.usuario.iniciais}</span>
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{pesquisa.usuario.nome}</h4>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(pesquisa.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
        </span>
      </div>
      <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line break-words">
        {pesquisa.resposta}
      </div>
    </div>
  </div>
);

const DashboardOverview = () => {
  const { avaliacoes, media, loading: loadingAval, error: errorAval } = useAvaliacoes();
  const { mensagens, loading: loadingMsg, error: errorMsg } = useMensagens();
  const { reclamacoes, loading: loadingRec, error: errorRec } = useReclamacoes();
  const { pesquisas, loading: loadingPesq, error: errorPesq } = usePesquisas();
  const navigate = useNavigate();

  // Gerar dados para o gráfico real de evolução da média
  const mediaHistorico = (() => {
    // Agrupar por dia (ou semana, se preferir)
    const agrupado: { [key: string]: number[] } = {};
    avaliacoes.forEach(av => {
      const data = av.timestamp.toDate();
      const key = data.toLocaleDateString('pt-BR');
      if (!agrupado[key]) agrupado[key] = [];
      agrupado[key].push(av.nota);
    });
    // Ordenar por data e pegar os últimos 7 períodos
    const chaves = Object.keys(agrupado).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const ultimos = chaves.slice(-7);
    return ultimos.map(key => {
      const notas = agrupado[key];
      return notas.reduce((a, b) => a + b, 0) / notas.length;
    });
  })();
  const labelsHistorico = (() => {
    const agrupado: { [key: string]: number[] } = {};
    avaliacoes.forEach(av => {
      const data = av.timestamp.toDate();
      const key = data.toLocaleDateString('pt-BR');
      if (!agrupado[key]) agrupado[key] = [];
      agrupado[key].push(av.nota);
    });
    const chaves = Object.keys(agrupado).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return chaves.slice(-7);
  })();

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
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="w-full max-w-xs mx-auto">
                <Line
                  data={{
                    labels: labelsHistorico,
                    datasets: [
                      {
                        label: 'Média',
                        data: mediaHistorico,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.2)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      y: { min: 0, max: 5, ticks: { stepSize: 1 } },
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Card de Reclamações */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Novas Reclamações</CardTitle>
            <CardDescription>Últimas reclamações recebidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingRec ? (
                <div className="text-center py-8 text-muted-foreground">Carregando reclamações...</div>
              ) : errorRec ? (
                <div className="text-center py-8 text-red-500">{errorRec}</div>
              ) : reclamacoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma reclamação encontrada.</div>
              ) : (
                reclamacoes.map(reclamacao => (
                  <ReclamacaoCard key={reclamacao.id} reclamacao={reclamacao} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* Card de Pesquisas */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Novas Pesquisas</CardTitle>
            <CardDescription>Últimas pesquisas respondidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingPesq ? (
                <div className="text-center py-8 text-muted-foreground">Carregando pesquisas...</div>
              ) : errorPesq ? (
                <div className="text-center py-8 text-red-500">{errorPesq}</div>
              ) : pesquisas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma pesquisa encontrada.</div>
              ) : (
                pesquisas.map(pesquisa => (
                  <PesquisaCard key={pesquisa.id} pesquisa={pesquisa} />
                ))
              )}
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

const DashboardOverviewContent = () => {
  const location = useLocation();
  
  // Renderizar componente baseado na rota
  const renderContent = () => {
    switch (location.pathname) {
      case '/dashboard/mensagens':
      case '/dashboard':
      default:
        return <ContactMessages />;
    }
  };

  return renderContent();
};

export default DashboardOverview;
