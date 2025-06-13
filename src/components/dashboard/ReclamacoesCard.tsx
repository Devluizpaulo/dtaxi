import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageSquare, Clock, CheckCircle, XCircle, Filter, Download, RefreshCw, Eye, ChevronDown, ChevronUp, Archive, Reply, Flag } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Reclamacao } from '@/hooks/useFirebaseData';

const ReclamacoesCard = () => {
  const [reclamacoes, setReclamacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'pendentes' | 'resolvidas'>('todas');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [atualizando, setAtualizando] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    resolvidas: 0,
    hoje: 0,
    alta: 0,
    media: 0,
    baixa: 0
  });

  const fetchReclamacoes = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const reclamacoesRef = collection(db, 'reclamacoes');
      const q = query(reclamacoesRef, orderBy('timestamp', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      
      const reclamacoesData = snapshot.docs.map(doc => ({
        id: doc.id,
        priority: 'medium', // Prioridade padrão
        ...doc.data()
      }));
      
      setReclamacoes(reclamacoesData);
      
      // Calcular estatísticas
      const agora = new Date();
      const inicioHoje = startOfDay(agora);
      
      const statsData = {
        total: reclamacoesData.length,
        pendentes: reclamacoesData.filter(r => r.status === 'pendente').length,
        resolvidas: reclamacoesData.filter(r => r.status === 'resolvida').length,
        hoje: reclamacoesData.filter(r => r.timestamp?.toDate() >= inicioHoje).length,
        alta: reclamacoesData.filter(r => r.priority === 'high').length,
        media: reclamacoesData.filter(r => r.priority === 'medium').length,
        baixa: reclamacoesData.filter(r => r.priority === 'low').length
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao buscar reclamações:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const alterarStatus = async (id: string, novoStatus: string) => {
    try {
      setAtualizando(true);
      await updateDoc(doc(db, 'reclamacoes', id), {
        status: novoStatus
      });
      await fetchReclamacoes();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setAtualizando(false);
    }
  };

  const exportarDados = () => {
    const dados = getReclamacoesFiltradas();
    const csv = dados.map(r => `${r.usuario?.nome || 'N/A'},${r.mensagem},${r.status},${format(r.timestamp?.toDate() || new Date(), 'dd/MM/yyyy HH:mm')}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reclamacoes.csv';
    a.click();
  };

  useEffect(() => {
    fetchReclamacoes();
  }, []);

  const getReclamacoesFiltradas = () => {
    return reclamacoes.filter(reclamacao => {
      const statusMatch = filtroStatus === 'todas' || reclamacao.status === filtroStatus.slice(0, -1);
      const priorityMatch = selectedPriority === 'all' || reclamacao.priority === selectedPriority;
      return statusMatch && priorityMatch;
    });
  };

  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-orange-300 bg-orange-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { color: 'bg-red-500 text-white', text: 'Alta', icon: '🔥' };
      case 'medium': return { color: 'bg-yellow-500 text-white', text: 'Média', icon: '⚠️' };
      default: return { color: 'bg-orange-500 text-white', text: 'Baixa', icon: '📝' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolvida': return 'bg-green-100 text-green-700 border-green-300';
      case 'pendente': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card className={cn(
      'h-full transition-all duration-300 hover:shadow-lg',
      isExpanded && 'shadow-xl'
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Reclamações
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {getReclamacoesFiltradas().length}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              Feedback e reclamações dos usuários
              {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin" />}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <select 
              className="text-xs border rounded px-2 py-1 bg-white"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
            >
              <option value="todas">Todas</option>
              <option value="pendentes">Pendentes</option>
              <option value="resolvidas">Resolvidas</option>
            </select>
            <select 
              className="text-xs border rounded px-2 py-1 bg-white"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
            >
              <option value="all">Todas Prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReclamacoes()}
            disabled={isRefreshing}
            className="transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className={cn('h-4 w-4 mr-1', isRefreshing && 'animate-spin')} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportarDados}
            disabled={loading || getReclamacoesFiltradas().length === 0}
            className="transition-all duration-200 hover:scale-105"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Estatísticas Interativas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                <div className="text-xs text-gray-600 font-medium">Total</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-red-600">{stats.pendentes}</div>
                <div className="text-xs text-red-600 font-medium">Pendentes</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-green-600">{stats.resolvidas}</div>
                <div className="text-xs text-green-600 font-medium">Resolvidas</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border hover:shadow-md transition-all duration-200">
                <div className="text-2xl font-bold text-blue-600">{stats.hoje}</div>
                <div className="text-xs text-blue-600 font-medium">Hoje</div>
              </div>
            </div>
            
            {/* Lista de reclamações */}
            <div className="space-y-3">
              {getReclamacoesFiltradas().slice(0, isExpanded ? 10 : 4).map((reclamacao, index) => {
                const isCardExpanded = expandedCards.has(reclamacao.id);
                const priorityBadge = getPriorityBadge(reclamacao.priority);
                
                return (
                  <div 
                    key={reclamacao.id} 
                    className={cn(
                      'p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md cursor-pointer group',
                      getPriorityColor(reclamacao.priority),
                      'hover:scale-[1.01]'
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => toggleCardExpansion(reclamacao.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform duration-200">
                            <span className="text-sm">
                              {reclamacao.usuario?.nome?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white">
                            <AlertCircle className="h-2 w-2 text-white m-0.5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {reclamacao.usuario?.nome || 'Usuário Anônimo'}
                            </p>
                            <Badge className={cn('text-xs', priorityBadge.color)}>
                              {priorityBadge.icon} {priorityBadge.text}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', getStatusColor(reclamacao.status))}>
                              {reclamacao.status === 'resolvida' ? '✅ Resolvida' : '⏳ Pendente'}
                            </Badge>
                          </div>
                          <div className={cn(
                            'transition-all duration-300 overflow-hidden',
                            isCardExpanded ? 'max-h-40' : 'max-h-12'
                          )}>
                            <p className={cn(
                              'text-sm text-gray-700 leading-relaxed',
                              !isCardExpanded && 'line-clamp-2'
                            )}>
                              {reclamacao.mensagem}
                            </p>
                          </div>
                          
                          {isCardExpanded && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alterarStatus(reclamacao.id, reclamacao.status === 'pendente' ? 'resolvida' : 'pendente');
                                }}
                                disabled={atualizando}
                              >
                                {reclamacao.status === 'pendente' ? (
                                  <><CheckCircle className="h-3 w-3 mr-1" /> Resolver</>
                                ) : (
                                  <><XCircle className="h-3 w-3 mr-1" /> Reabrir</>
                                )}
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <Reply className="h-3 w-3 mr-1" />
                                Responder
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                <Archive className="h-3 w-3 mr-1" />
                                Arquivar
                              </Button>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 font-medium">
                              {format(reclamacao.timestamp?.toDate() || new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-red-600 font-medium">Urgente</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {getReclamacoesFiltradas().length > 4 && (
              <div className="text-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Ver todas ({getReclamacoesFiltradas().length})
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {getReclamacoesFiltradas().length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhuma reclamação encontrada</p>
                <p className="text-gray-400 text-sm">Tente alterar os filtros</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReclamacoesCard;