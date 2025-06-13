import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, BarChart2, PlusCircle, FileText, Settings, Download, HelpCircle, AlertCircle, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

const AvaliacaoCard: React.FC<{ avaliacao: Avaliacao }> = ({ avaliacao }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getRatingColor = (nota: number) => {
    if (nota >= 4) return 'text-green-600';
    if (nota >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBg = (nota: number) => {
    if (nota >= 4) return 'bg-green-50 border-green-200';
    if (nota >= 3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div 
      className={cn(
        'p-4 border rounded-lg transition-all duration-300 cursor-pointer group',
        'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
        getRatingBg(avaliacao.nota),
        isHovered && 'shadow-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {avaliacao.usuario.iniciais}
            </div>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm transition-all duration-300',
              getRatingColor(avaliacao.nota).replace('text-', 'bg-'),
              isHovered && 'scale-110'
            )}>
              {avaliacao.nota}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{avaliacao.usuario.nome}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5 transition-all duration-200',
                      i < avaliacao.nota 
                        ? 'text-yellow-400 fill-current transform scale-110' 
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-xs px-2 py-0.5',
                  getRatingColor(avaliacao.nota),
                  getRatingBg(avaliacao.nota)
                )}
              >
                {avaliacao.nota}/5
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-gray-500 font-medium">
            {formatDistanceToNow(avaliacao.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
          </span>
          {avaliacao.comentario && (
            <Badge variant="outline" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Comentário
            </Badge>
          )}
        </div>
      </div>
      
      {avaliacao.comentario && (
        <div className={cn(
          'mt-3 transition-all duration-300 overflow-hidden',
          isExpanded ? 'max-h-40' : 'max-h-12'
        )}>
          <div className="bg-white/70 rounded-lg p-3 border border-gray-200/50">
            <p className={cn(
              'text-sm text-gray-700 leading-relaxed',
              !isExpanded && 'line-clamp-2'
            )}>
              "{avaliacao.comentario}"
            </p>
            {avaliacao.comentario.length > 100 && (
              <button 
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MensagemCard: React.FC<{ mensagem: Mensagem }> = ({ mensagem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        'p-4 border rounded-lg transition-all duration-300 cursor-pointer group',
        'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
        'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
        isHovered && 'shadow-lg from-blue-100 to-indigo-100'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {mensagem.usuario.iniciais}
            </div>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white transition-all duration-300',
              isHovered && 'scale-110'
            )}>
              <MessageSquare className="h-2 w-2 text-white m-0.5" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-sm text-gray-900">{mensagem.usuario.nome}</p>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Nova mensagem
              </Badge>
            </div>
            <div className={cn(
              'transition-all duration-300 overflow-hidden',
              isExpanded ? 'max-h-40' : 'max-h-12'
            )}>
              <p className={cn(
                'text-sm text-gray-700 leading-relaxed',
                !isExpanded && 'line-clamp-2'
              )}>
                {mensagem.mensagem}
              </p>
            </div>
            {mensagem.mensagem.length > 100 && (
              <button 
                className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {formatDistanceToNow(mensagem.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Recente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReclamacaoCard: React.FC<{ reclamacao: Reclamacao }> = ({ reclamacao }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-orange-300 bg-orange-50';
    }
  };

  const getPriorityBadge = () => {
    switch (priority) {
      case 'high': return { color: 'bg-red-500', text: 'Alta' };
      case 'medium': return { color: 'bg-yellow-500', text: 'Média' };
      default: return { color: 'bg-orange-500', text: 'Baixa' };
    }
  };

  return (
    <div 
      className={cn(
        'p-4 border-l-4 rounded-lg transition-all duration-300 cursor-pointer group',
        'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
        getPriorityColor(),
        isHovered && 'shadow-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {reclamacao.usuario.iniciais}
            </div>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white transition-all duration-300',
              isHovered && 'scale-110'
            )}>
              <AlertCircle className="h-2 w-2 text-white m-0.5" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-sm text-gray-900">{reclamacao.usuario.nome}</p>
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-xs text-white',
                  getPriorityBadge().color
                )}
              >
                {getPriorityBadge().text}
              </Badge>
              <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                Reclamação
              </Badge>
            </div>
            <div className={cn(
              'transition-all duration-300 overflow-hidden',
              isExpanded ? 'max-h-40' : 'max-h-12'
            )}>
              <p className={cn(
                'text-sm text-gray-700 leading-relaxed',
                !isExpanded && 'line-clamp-2'
              )}>
                {reclamacao.mensagem}
              </p>
            </div>
            {reclamacao.mensagem.length > 100 && (
              <button 
                className="text-xs text-red-600 hover:text-red-800 mt-2 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
            
            {isExpanded && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                <Button size="sm" variant="outline" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Responder
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Archive className="h-3 w-3 mr-1" />
                  Arquivar
                </Button>
                <select 
                  className="text-xs border rounded px-2 py-1"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {formatDistanceToNow(reclamacao.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-600 font-medium">Urgente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PesquisaCard: React.FC<{ pesquisa: Pesquisa }> = ({ pesquisa }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        'p-4 border rounded-lg transition-all duration-300 cursor-pointer group',
        'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
        'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
        isHovered && 'shadow-lg from-purple-100 to-pink-100'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {pesquisa.usuario.iniciais}
            </div>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white transition-all duration-300',
              isHovered && 'scale-110'
            )}>
              <FileText className="h-2 w-2 text-white m-0.5" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-sm text-gray-900">{pesquisa.usuario.nome}</p>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                Pesquisa
              </Badge>
            </div>
            <div className={cn(
              'transition-all duration-300 overflow-hidden',
              isExpanded ? 'max-h-40' : 'max-h-12'
            )}>
              <p className={cn(
                'text-sm text-gray-700 leading-relaxed',
                !isExpanded && 'line-clamp-2'
              )}>
                {pesquisa.resposta}
              </p>
            </div>
            {pesquisa.resposta.length > 100 && (
              <button 
                className="text-xs text-purple-600 hover:text-purple-800 mt-2 font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
            
            {isExpanded && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                <Button size="sm" variant="outline" className="text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Exportar
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <BarChart2 className="h-3 w-3 mr-1" />
                  Analisar
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {formatDistanceToNow(pesquisa.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-purple-600 font-medium">Respondida</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default DashboardOverview;
