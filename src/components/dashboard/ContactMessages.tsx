
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Mail, Search, Filter, MoreVertical, Reply, Archive, Trash2, Clock, User, Phone, MessageSquare, AlertCircle, CheckCircle, Star, RefreshCw, Eye, Send, Flag, Heart, ThumbsUp, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { collection, query, orderBy, getDocs, where, addDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Mock data para mensagens de contato
const mockContactMessages = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    subject: 'Dúvida sobre tarifa',
    message: 'Olá, gostaria de saber como é calculada a tarifa para viagens intermunicipais. Obrigado!',
    date: '2025-04-01T14:32:00',
    type: 'duvida',
    status: 'pendente'
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    subject: 'Elogio ao motorista Carlos',
    message: 'Gostaria de elogiar o motorista Carlos que me atendeu ontem. Foi extremamente educado e prestativo!',
    date: '2025-03-30T09:15:00',
    type: 'elogio',
    status: 'respondido'
  },
  {
    id: '3',
    name: 'Pedro Santos',
    email: 'pedro.santos@email.com',
    subject: 'Reclamação sobre atraso',
    message: 'O táxi que solicitei demorou mais de 30 minutos para chegar, o que me fez perder um compromisso importante.',
    date: '2025-03-29T16:45:00',
    type: 'reclamacao',
    status: 'pendente'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    subject: 'Sugestão de aplicativo',
    message: 'Sugiro que vocês adicionem a opção de pedir táxi para horários futuros no aplicativo. Seria muito útil!',
    date: '2025-03-28T11:20:00',
    type: 'sugestao',
    status: 'pendente'
  },
  {
    id: '5',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    subject: 'Dúvida sobre pagamento',
    message: 'Como posso solicitar um recibo para viagens corporativas? Preciso para reembolso na empresa.',
    date: '2025-03-27T10:05:00',
    type: 'duvida',
    status: 'respondido'
  },
  {
    id: '6',
    name: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    subject: 'Elogio ao serviço',
    message: 'Quero parabenizar toda a equipe pelo excelente serviço. Uso os táxis da D-TAXI frequentemente e sempre tenho boas experiências.',
    date: '2025-03-26T13:40:00',
    type: 'elogio',
    status: 'pendente'
  },
  {
    id: '7',
    name: 'Roberto Alves',
    email: 'roberto.alves@email.com',
    subject: 'Reclamação sobre cobrança',
    message: 'Fui cobrado um valor maior do que o estimado inicialmente. Gostaria de uma explicação sobre isso.',
    date: '2025-03-25T17:30:00',
    type: 'reclamacao',
    status: 'respondido'
  }
];

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'duvida':
      return { label: 'Dúvida', color: 'bg-blue-100 text-blue-800' };
    case 'elogio':
      return { label: 'Elogio', color: 'bg-green-100 text-green-800' };
    case 'reclamacao':
      return { label: 'Reclamação', color: 'bg-red-100 text-red-800' };
    case 'sugestao':
      return { label: 'Sugestão', color: 'bg-purple-100 text-purple-800' };
    default:
      return { label: 'Outro', color: 'bg-gray-100 text-gray-800' };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pendente':
      return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
    case 'respondido':
      return { label: 'Respondido', color: 'bg-green-100 text-green-800' };
    case 'arquivado':
      return { label: 'Arquivado', color: 'bg-gray-100 text-gray-800' };
    default:
      return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
  }
};

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [archivedMessages, setArchivedMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [priorityFilter, setPriorityFilter] = useState('todas');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('ativas');
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    novas: 0,
    pendentes: 0,
    respondidas: 0,
    arquivadas: 0,
    elogios: 0,
    reclamacoes: 0,
    duvidas: 0,
    sugestoes: 0
  });
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      
      // Buscar mensagens ativas
      const messagesRef = collection(db, 'contact_messages');
      const q = query(messagesRef, where('status', '!=', 'arquivada'), orderBy('status'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        prioridade: ['baixa', 'media', 'alta'][Math.floor(Math.random() * 3)],
        satisfacao: Math.floor(Math.random() * 3) + 3,
        tempoResposta: Math.floor(Math.random() * 24) + 1,
        categoria: ['suporte', 'reclamacao', 'sugestao', 'elogio'][Math.floor(Math.random() * 4)],
        telefone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        ...doc.data()
      }));
      
      setMessages(messagesData.map(msg => ({
        ...msg,
        status: (msg as any).status || 'nova',
        prioridade: msg.prioridade as 'baixa' | 'media' | 'alta',
        categoria: msg.categoria as 'suporte' | 'reclamacao' | 'sugestao' | 'elogio'
      })));
      
      // Buscar mensagens arquivadas
      const archivedRef = collection(db, 'arquivadas');
      const archivedQuery = query(archivedRef, orderBy('archivedAt', 'desc'));
      const archivedSnapshot = await getDocs(archivedQuery);
      
      const archivedData = archivedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setArchivedMessages(archivedData);
      
      // Calcular estatísticas
      const allMessages = [...messagesData, ...archivedData];
      const satisfacaoMedia = allMessages.reduce((acc, m) => acc + (m.satisfacao || 0), 0) / allMessages.length;
      const tempoResposta = allMessages.reduce((acc, m) => acc + (m.tempoResposta || 0), 0) / allMessages.length;
      
      const statsData = {
        total: allMessages.length,
        novas: messagesData.filter(m => m.status === 'nova').length,
        respondidas: messagesData.filter(m => m.status === 'respondida').length,
        arquivadas: archivedData.length,
        satisfacaoMedia: Math.round(satisfacaoMedia * 10) / 10,
        tempoResposta: Math.round(tempoResposta * 10) / 10
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Função para arquivar mensagem
  const handleArchiveMessage = async (messageId: string) => {
    try {
      const messageToArchive = messages.find(m => m.id === messageId);
      if (!messageToArchive) return;

      const batch = writeBatch(db);
      
      // Adicionar à coleção de arquivadas
      const archivedRef = doc(collection(db, 'archived_messages'));
      batch.set(archivedRef, {
        ...messageToArchive,
        originalId: messageId,
        archivedAt: new Date(),
        archivedBy: 'admin', // Substituir pelo usuário logado
        status: 'arquivada'
      });
      
      // Remover da coleção ativa
      const originalRef = doc(db, 'contact_messages', messageId);
      batch.delete(originalRef);
      
      await batch.commit();
      
      // Atualizar estado local
      setMessages(prev => prev.filter(m => m.id !== messageId));
      await fetchMessages(); // Recarregar para atualizar estatísticas
      
    } catch (error) {
      console.error('Erro ao arquivar mensagem:', error);
    }
  };

  // Função para desarquivar mensagem
  const handleUnarchiveMessage = async (archivedId: string) => {
    try {
      const messageToUnarchive = archivedMessages.find(m => m.id === archivedId);
      if (!messageToUnarchive) return;

      const batch = writeBatch(db);
      
      // Adicionar de volta à coleção ativa
      const activeRef = doc(collection(db, 'contact_messages'));
      const { archivedAt, archivedBy, originalId, ...messageData } = messageToUnarchive;
      batch.set(activeRef, {
        ...messageData,
        status: 'nova', // Voltar como nova mensagem
        unarchivedAt: new Date()
      });
      
      // Remover da coleção de arquivadas
      const archivedRef = doc(db, 'archived_messages', archivedId);
      batch.delete(archivedRef);
      
      await batch.commit();
      
      // Atualizar estado local
      setArchivedMessages(prev => prev.filter(m => m.id !== archivedId));
      await fetchMessages(); // Recarregar para atualizar estatísticas
      
    } catch (error) {
      console.error('Erro ao desarquivar mensagem:', error);
    }
  };

  // Função para excluir mensagem permanentemente
  const handleDeleteMessage = async (messageId: string, isArchived = false) => {
    try {
      const collection_name = isArchived ? 'archived_messages' : 'contact_messages';
      await deleteDoc(doc(db, collection_name, messageId));
      
      if (isArchived) {
        setArchivedMessages(prev => prev.filter(m => m.id !== messageId));
      } else {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      }
      
      await fetchMessages(); // Recarregar para atualizar estatísticas
      
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
    }
  };

  // Função para atualizar status da mensagem
  const handleUpdateStatus = async (messageId: string, newStatus: 'nova' | 'respondida') => {
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Atualizar estado local
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: newStatus } : m
      ));
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getFilteredMessages = () => {
    const messagesToFilter = activeTab === 'ativas' ? messages : archivedMessages;
    
    return messagesToFilter.filter(message => {
      const matchesSearch = message.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.assunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.mensagem?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todas' || message.status === statusFilter;
      const matchesPriority = priorityFilter === 'todas' || message.prioridade === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nova': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'respondida': return 'bg-green-100 text-green-700 border-green-300';
      case 'arquivada': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-700';
      case 'media': return 'bg-yellow-100 text-yellow-700';
      case 'baixa': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'suporte': return <MessageSquare className="h-4 w-4" />;
      case 'reclamacao': return <AlertCircle className="h-4 w-4" />;
      case 'sugestao': return <Star className="h-4 w-4" />;
      case 'elogio': return <Heart className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-3 w-3',
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        )}
      />
    ));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mensagens de Contato</h1>
          <p className="text-muted-foreground">Gerencie e responda às mensagens dos usuários</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMessages} disabled={isRefreshing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
            Atualizar
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
        </div>
      </div>

      {/* Estatísticas Interativas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">{stats.total}</div>
                <p className="text-xs text-muted-foreground font-medium">Total</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform">{stats.novas}</div>
                <p className="text-xs text-muted-foreground font-medium">Novas</p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">{stats.respondidas}</div>
                <p className="text-xs text-muted-foreground font-medium">Respondidas</p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-600 group-hover:scale-110 transition-transform">{stats.arquivadas}</div>
                <p className="text-xs text-muted-foreground font-medium">Arquivadas</p>
              </div>
              <Archive className="h-8 w-8 text-gray-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">{stats.satisfacaoMedia}</div>
                <p className="text-xs text-muted-foreground font-medium">Satisfação</p>
              </div>
              <Star className="h-8 w-8 text-purple-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600 group-hover:scale-110 transition-transform">{stats.tempoResposta}h</div>
                <p className="text-xs text-muted-foreground font-medium">Tempo Resp.</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas para Mensagens Ativas e Arquivadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ativas" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Mensagens Ativas ({messages.length})
          </TabsTrigger>
          <TabsTrigger value="arquivadas" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Mensagens Arquivadas ({archivedMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativas" className="space-y-6">
          {/* Filtros e busca para mensagens ativas */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, email, assunto ou mensagem..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Status: {statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setStatusFilter('todas')}>Todas</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('nova')}>Novas</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('respondida')}>Respondidas</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        Prioridade: {priorityFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setPriorityFilter('todas')}>Todas</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriorityFilter('alta')}>Alta</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriorityFilter('media')}>Média</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriorityFilter('baixa')}>Baixa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" onClick={fetchMessages} disabled={isRefreshing}>
                    <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Carregando mensagens...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Lista de mensagens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredMessages().map((message, index) => {
                  const isExpanded = expandedCards.has(message.id);
                  const isSelected = selectedMessage?.id === message.id;
                  
                  return (
                    <Card 
                      key={message.id} 
                      className={cn(
                        'hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4',
                        isSelected && 'ring-2 ring-blue-500 shadow-xl',
                        message.prioridade === 'alta' && 'border-l-red-500',
                        message.prioridade === 'media' && 'border-l-yellow-500',
                        message.prioridade === 'baixa' && 'border-l-green-500',
                        'hover:scale-[1.02]'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => {
                        setSelectedMessage(isSelected ? null : message);
                        toggleCardExpansion(message.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform duration-200">
                                <AvatarImage src={message.foto} />
                                <AvatarFallback className={cn(
                                  'font-bold text-white',
                                  message.categoria === 'suporte' && 'bg-gradient-to-br from-blue-400 to-blue-600',
                                  message.categoria === 'reclamacao' && 'bg-gradient-to-br from-red-400 to-red-600',
                                  message.categoria === 'sugestao' && 'bg-gradient-to-br from-purple-400 to-purple-600',
                                  message.categoria === 'elogio' && 'bg-gradient-to-br from-green-400 to-green-600'
                                )}>
                                  {message.nome?.split(' ').map(n => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center',
                                message.categoria === 'suporte' && 'bg-blue-500',
                                message.categoria === 'reclamacao' && 'bg-red-500',
                                message.categoria === 'sugestao' && 'bg-purple-500',
                                message.categoria === 'elogio' && 'bg-green-500'
                              )}>
                                {getCategoryIcon(message.categoria)}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-gray-900">{message.nome}</h3>
                              <p className="text-xs text-gray-600">{message.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={cn('text-xs', getStatusColor(message.status))}>
                                  {message.status === 'nova' && '🔵'}
                                  {message.status === 'respondida' && '🟢'}
                                  {message.status === 'arquivada' && '⚫'}
                                  {message.status}
                                </Badge>
                                <Badge className={cn('text-xs', getPriorityColor(message.prioridade))}>
                                  {message.prioridade === 'alta' && '🔴'}
                                  {message.prioridade === 'media' && '🟡'}
                                  {message.prioridade === 'baixa' && '🟢'}
                                  {message.prioridade}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                               <DropdownMenuItem onClick={() => handleUpdateStatus(message.id, 'respondida')}>
                                 <Reply className="h-4 w-4 mr-2" />
                                 Marcar como Respondida
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleArchiveMessage(message.id)}>
                                 <Archive className="h-4 w-4 mr-2" />
                                 Arquivar
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleUpdateStatus(message.id, 'nova')}>
                                 <AlertCircle className="h-4 w-4 mr-2" />
                                 Marcar como Nova
                               </DropdownMenuItem>
                               <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteMessage(message.id, false)}>
                                 <Trash2 className="h-4 w-4 mr-2" />
                                 Excluir Permanentemente
                               </DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Assunto sempre visível */}
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">{message.assunto}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">{message.mensagem}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {renderStars(message.satisfacao)}
                              <span className="text-xs text-gray-600 ml-1">{message.satisfacao}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {message.tempoResposta}h resposta
                            </div>
                          </div>
                          
                          {/* Informações expandidas */}
                          <div className={cn(
                            'transition-all duration-300 overflow-hidden',
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          )}>
                            <div className="space-y-3 pt-3 border-t border-gray-200">
                              <div>
                                <h5 className="font-medium text-xs text-gray-700 mb-1">Mensagem completa:</h5>
                                <p className="text-xs text-gray-600 leading-relaxed">{message.mensagem}</p>
                              </div>
                              
                              {message.telefone && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Phone className="h-3 w-3 text-blue-500" />
                                  <span className="text-gray-600">{message.telefone}</span>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-2 bg-blue-50 rounded">
                                  <div className="text-xs font-bold text-blue-700">{message.categoria}</div>
                                  <div className="text-xs text-blue-600">Categoria</div>
                                </div>
                                <div className="text-center p-2 bg-purple-50 rounded">
                                  <div className="text-xs font-bold text-purple-700">{format(message.createdAt?.toDate() || new Date(), 'dd/MM', { locale: ptBR })}</div>
                                  <div className="text-xs text-purple-600">Recebida</div>
                                </div>
                              </div>
                              
                              {/* Área de resposta */}
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="Digite sua resposta..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="text-xs"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                   <Button size="sm" className="flex-1 text-xs" onClick={() => handleUpdateStatus(message.id, 'respondida')}>
                                     <Send className="h-3 w-3 mr-1" />
                                     Enviar Resposta
                                   </Button>
                                   <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleArchiveMessage(message.id)}>
                                     <Archive className="h-3 w-3 mr-1" />
                                     Arquivar
                                   </Button>
                                 </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{format(message.createdAt?.toDate() || new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={cn(
                                'w-2 h-2 rounded-full',
                                message.status === 'nova' && 'bg-blue-500 animate-pulse',
                                message.status === 'respondida' && 'bg-green-500',
                                message.status === 'arquivada' && 'bg-gray-500'
                              )}></div>
                              <span className="text-xs text-gray-500 font-medium">
                                {message.status === 'nova' && 'Aguardando'}
                                {message.status === 'respondida' && 'Respondida'}
                                {message.status === 'arquivada' && 'Arquivada'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {getFilteredMessages().length === 0 && (
                 <div className="text-center py-20">
                   <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                   <h3 className="text-lg font-medium mb-2">Nenhuma mensagem encontrada</h3>
                   <p className="text-muted-foreground">Tente ajustar os filtros ou aguarde novas mensagens</p>
                 </div>
               )}
             </>
           )}
         </CardContent>
       </Card>
     </TabsContent>

     <TabsContent value="arquivadas" className="space-y-6">
       {/* Filtros e busca para mensagens arquivadas */}
       <Card>
         <CardHeader>
           <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
             <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
               <Input
                 placeholder="Buscar mensagens arquivadas..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10"
               />
             </div>
             <div className="flex gap-2">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="outline" size="sm">
                     <Flag className="h-4 w-4 mr-2" />
                     Prioridade: {priorityFilter}
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                   <DropdownMenuItem onClick={() => setPriorityFilter('todas')}>Todas</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setPriorityFilter('alta')}>Alta</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setPriorityFilter('media')}>Média</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setPriorityFilter('baixa')}>Baixa</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
               <Button variant="outline" onClick={fetchMessages} disabled={isRefreshing}>
                 <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
                 Atualizar
               </Button>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           {loading ? (
             <div className="flex items-center justify-center py-20">
               <div className="text-center">
                 <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                 <p className="text-muted-foreground">Carregando mensagens arquivadas...</p>
               </div>
             </div>
           ) : (
             <>
               {/* Lista de mensagens arquivadas */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {getFilteredMessages().map((message, index) => {
                   const isExpanded = expandedCards.has(message.id);
                   const isSelected = selectedMessage?.id === message.id;
                   
                   return (
                     <Card 
                       key={message.id} 
                       className={cn(
                         'hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-gray-400 bg-gray-50',
                         isSelected && 'ring-2 ring-gray-500 shadow-xl',
                         'hover:scale-[1.02]'
                       )}
                       style={{ animationDelay: `${index * 100}ms` }}
                       onClick={() => {
                         setSelectedMessage(isSelected ? null : message);
                         toggleCardExpansion(message.id);
                       }}
                     >
                       <CardContent className="p-4">
                         <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                             <div className="relative">
                               <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform duration-200 opacity-75">
                                 <AvatarImage src={message.foto} />
                                 <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 font-bold text-white">
                                   {message.nome?.split(' ').map(n => n[0]).join('') || 'U'}
                                 </AvatarFallback>
                               </Avatar>
                               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-gray-500">
                                 <Archive className="h-2 w-2 text-white" />
                               </div>
                             </div>
                             <div>
                               <h3 className="font-bold text-sm text-gray-700">{message.nome}</h3>
                               <p className="text-xs text-gray-500">{message.email}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-300">
                                   ⚫ Arquivada
                                 </Badge>
                                 <Badge className={cn('text-xs', getPriorityColor(message.prioridade))}>
                                   {message.prioridade === 'alta' && '🔴'}
                                   {message.prioridade === 'media' && '🟡'}
                                   {message.prioridade === 'baixa' && '🟢'}
                                   {message.prioridade}
                                 </Badge>
                               </div>
                             </div>
                           </div>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                 <MoreVertical className="h-4 w-4" />
                               </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent>
                               <DropdownMenuItem onClick={() => handleUnarchiveMessage(message.id)}>
                                 <Reply className="h-4 w-4 mr-2" />
                                 Desarquivar
                               </DropdownMenuItem>
                               <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteMessage(message.id, true)}>
                                 <Trash2 className="h-4 w-4 mr-2" />
                                 Excluir Permanentemente
                               </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </div>
                         
                         {/* Assunto sempre visível */}
                         <div className="space-y-2">
                           <div>
                             <h4 className="font-semibold text-sm text-gray-700 line-clamp-2">{message.assunto}</h4>
                             <p className="text-xs text-gray-500 line-clamp-2 mt-1">{message.mensagem}</p>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-1">
                               {renderStars(message.satisfacao)}
                               <span className="text-xs text-gray-500 ml-1">{message.satisfacao}</span>
                             </div>
                             <div className="text-xs text-gray-400">
                               Arquivada em {format(message.archivedAt?.toDate() || new Date(), 'dd/MM/yyyy', { locale: ptBR })}
                             </div>
                           </div>
                           
                           {/* Informações expandidas */}
                           <div className={cn(
                             'transition-all duration-300 overflow-hidden',
                             isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                           )}>
                             <div className="space-y-3 pt-3 border-t border-gray-200">
                               <div>
                                 <h5 className="font-medium text-xs text-gray-600 mb-1">Mensagem completa:</h5>
                                 <p className="text-xs text-gray-500 leading-relaxed">{message.mensagem}</p>
                               </div>
                               
                               {message.telefone && (
                                 <div className="flex items-center gap-2 text-xs">
                                   <Phone className="h-3 w-3 text-gray-400" />
                                   <span className="text-gray-500">{message.telefone}</span>
                                 </div>
                               )}
                               
                               <div className="grid grid-cols-2 gap-3">
                                 <div className="text-center p-2 bg-gray-100 rounded">
                                   <div className="text-xs font-bold text-gray-600">{message.categoria}</div>
                                   <div className="text-xs text-gray-500">Categoria</div>
                                 </div>
                                 <div className="text-center p-2 bg-gray-100 rounded">
                                   <div className="text-xs font-bold text-gray-600">{message.archivedBy || 'Admin'}</div>
                                   <div className="text-xs text-gray-500">Arquivada por</div>
                                 </div>
                               </div>
                               
                               {/* Ações para mensagens arquivadas */}
                               <div className="space-y-2">
                                 <div className="flex gap-2">
                                   <Button size="sm" className="flex-1 text-xs" onClick={() => handleUnarchiveMessage(message.id)}>
                                     <Reply className="h-3 w-3 mr-1" />
                                     Desarquivar
                                   </Button>
                                   <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => handleDeleteMessage(message.id, true)}>
                                     <Trash2 className="h-3 w-3 mr-1" />
                                     Excluir
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           </div>
                           
                           <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                             <div className="flex items-center gap-1 text-xs text-gray-400">
                               <Clock className="h-3 w-3" />
                               <span>Recebida: {format(message.createdAt?.toDate() || new Date(), 'dd/MM/yyyy', { locale: ptBR })}</span>
                             </div>
                             <div className="flex items-center gap-1">
                               <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                               <span className="text-xs text-gray-500 font-medium">Arquivada</span>
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   );
                 })}
               </div>
               
               {getFilteredMessages().length === 0 && (
                 <div className="text-center py-20">
                   <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                   <h3 className="text-lg font-medium mb-2">Nenhuma mensagem arquivada encontrada</h3>
                   <p className="text-muted-foreground">As mensagens arquivadas aparecerão aqui</p>
                 </div>
               )}
             </>
           )}
         </CardContent>
       </Card>
     </TabsContent>
   </Tabs>
   </div>
 );
};

export default ContactMessages;
