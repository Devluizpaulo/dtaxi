import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Mail, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Star,
  HelpCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from '@/hooks/useFirestore';
import { where, doc, updateDoc, collection, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { db } from '@/lib/firebase';

// Use Firestore para reclamações, mas mantenha os dados mockados até a implementação completa
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
      return { label: 'Dúvida', color: 'bg-blue-100 text-blue-800', icon: <HelpCircle className="h-4 w-4 mr-1" /> };
    case 'elogio':
      return { label: 'Elogio', color: 'bg-green-100 text-green-800', icon: <Star className="h-4 w-4 mr-1" /> };
    case 'reclamacao':
      return { label: 'Reclamação', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4 mr-1" /> };
    case 'sugestao':
      return { label: 'Sugestão', color: 'bg-purple-100 text-purple-800', icon: <Lightbulb className="h-4 w-4 mr-1" /> };
    default:
      return { label: 'Outro', color: 'bg-gray-100 text-gray-800', icon: <MessageSquare className="h-4 w-4 mr-1" /> };
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

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  type: string;
  status: string;
}

interface ReclamacaoData {
  id: string;
  nome: string;
  tipo: string;
  mensagem: string;
  dataEnvio: Date;
  email?: string;
}

const ContactMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>(mockContactMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("todos");
  const [resolucaoObs, setResolucaoObs] = useState('');
  const [historicoResolucao, setHistoricoResolucao] = useState<{[id: string]: {data: string, quem: string, obs: string}}>(() => ({}));
  
  // Tente carregar dados do Firestore
  const { data: reclamacoesData, loading: isLoading } = useFirestore<ReclamacaoData>({
    collectionName: 'reclamacoes',
    limitCount: 100
  });
  
  // Adicione o hook para buscar arquivadas
  const { data: arquivadasData, loading: isLoadingArquivadas } = useFirestore<ReclamacaoData & { status?: string; dataArquivamento?: any }>(
    {
      collectionName: 'reclamacoes-arquivadas',
      limitCount: 100
    }
  );
  
  // Estado para modal de arquivada
  const [selectedArchived, setSelectedArchived] = useState<null | (ReclamacaoData & { status?: string; dataArquivamento?: any })>(null);
  
  // Estado para filtro de tipo nas arquivadas
  const [archivedTypeFilter, setArchivedTypeFilter] = useState<string>('todos');
  
  // Sincroniza dados do Firestore com os dados locais quando disponíveis
  useEffect(() => {
    if (reclamacoesData && reclamacoesData.length > 0) {
      const formattedData = reclamacoesData.map((item) => {
        const tipo = item.tipo?.toLowerCase() || "";
        let messageType = "outro";
        if (tipo.includes("elogio")) messageType = "elogio";
        else if (tipo.includes("reclama")) messageType = "reclamacao";
        else if (tipo.includes("dúvida") || tipo.includes("duvida")) messageType = "duvida";
        else if (tipo.includes("sugestão") || tipo.includes("sugestao")) messageType = "sugestao";
        return {
          id: item.id,
          name: item.nome || "Sem nome",
          email: item.email || "email@exemplo.com",
          subject: item.tipo || "Sem assunto",
          message: item.mensagem || "",
          date: item.dataEnvio instanceof Date ? item.dataEnvio.toISOString() : new Date().toISOString(),
          type: messageType,
          status: (item as any).status || "pendente"
        };
      });
      setMessages(formattedData);
    }
  }, [reclamacoesData]);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  };
  
  const handleStatusChange = async (messageId: string, newStatus: string) => {
    console.log('Alterando status:', { messageId, newStatus });
    let updateSuccess = false;
    try {
      // 1. Atualiza ou cria o status no documento original
      const ref = doc(collection(db, 'reclamacoes'), messageId);
      await setDoc(ref, { status: newStatus }, { merge: true });
      console.log('Status atualizado no Firestore para', messageId);
      // 2. Se for arquivar, copia para 'reclamacoes-arquivadas'
      if (newStatus === 'arquivado') {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const originalData = snap.data();
          await setDoc(doc(collection(db, 'reclamacoes-arquivadas'), messageId), {
            ...originalData,
            status: 'arquivado',
            dataArquivamento: Timestamp.fromDate(new Date())
          }, { merge: true });
          console.log('Documento copiado para reclamacoes-arquivadas:', messageId);
        } else {
          console.warn('Documento não encontrado para arquivar:', messageId);
        }
      }
      updateSuccess = true;
    } catch (err) {
      console.error('Erro ao arquivar:', err);
      toast({
        title: 'Erro ao atualizar status',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
    if (updateSuccess) {
      window.location.reload();
    }
  };
  
  const handleReplyMessage = () => {
    if (selectedMessage) {
      // Em uma implementação real, isso abriria um formulário de resposta
      toast({
        title: "Resposta enviada",
        description: `Resposta enviada para ${selectedMessage.name} (${selectedMessage.email})`,
      });
      
      handleStatusChange(selectedMessage.id, 'respondido');
      setIsDialogOpen(false);
    }
  };
  
  // Filtra mensagens com base em pesquisa, filtros e tab ativa
  const getFilteredMessages = () => {
    let filtered = messages.filter(message => {
      const matchesSearch = 
        message.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        message.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(message.status);
      let matchesType = typeFilter.length === 0 || typeFilter.includes(message.type);
      
      // Se estamos em uma tab específica, aplica o filtro de tipo
      if (activeTab !== "todos") {
        matchesType = message.type === activeTab;
      }
      
      return matchesSearch && matchesStatus && matchesType;
    });
    
    // Ordenar mensagens - pendentes primeiro, depois por data mais recente
    filtered.sort((a, b) => {
      // Priorizar mensagens pendentes
      if (a.status === 'pendente' && b.status !== 'pendente') return -1;
      if (a.status !== 'pendente' && b.status === 'pendente') return 1;
      
      // Depois ordenar por data, mais recente primeiro
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return filtered;
  };
  
  const filteredMessages = getFilteredMessages();
  
  // Contagem de mensagens por tipo e status para os badges
  const getCounts = () => {
    const pendingCounts = {
      reclamacao: messages.filter(m => m.type === 'reclamacao' && m.status === 'pendente').length,
      elogio: messages.filter(m => m.type === 'elogio' && m.status === 'pendente').length,
      duvida: messages.filter(m => m.type === 'duvida' && m.status === 'pendente').length,
      sugestao: messages.filter(m => m.type === 'sugestao' && m.status === 'pendente').length,
    };
    
    const totalPending = Object.values(pendingCounts).reduce((a, b) => a + b, 0);
    
    return { ...pendingCounts, totalPending };
  };
  
  const counts = getCounts();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Central de Comunicações</CardTitle>
          <CardDescription>
            Gerencie todas as comunicações recebidas através do Fale Conosco
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="grid grid-cols-6 mb-4">
                <TabsTrigger value="todos" className="flex items-center gap-1">
                  Todos
                  {counts.totalPending > 0 && (
                    <Badge className="ml-1 bg-yellow-500 text-white">{counts.totalPending}</Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger value="reclamacao" className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Reclamações
                  {counts.reclamacao > 0 && (
                    <Badge className="ml-1 bg-red-500 text-white">{counts.reclamacao}</Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger value="elogio" className="flex items-center gap-1">
                  <Star className="h-4 w-4 mr-1" />
                  Elogios
                  {counts.elogio > 0 && (
                    <Badge className="ml-1 bg-green-500 text-white">{counts.elogio}</Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger value="duvida" className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Dúvidas
                  {counts.duvida > 0 && (
                    <Badge className="ml-1 bg-blue-500 text-white">{counts.duvida}</Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger value="sugestao" className="flex items-center gap-1">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Sugestões
                  {counts.sugestao > 0 && (
                    <Badge className="ml-1 bg-purple-500 text-white">{counts.sugestao}</Badge>
                  )}
                </TabsTrigger>
                
                <TabsTrigger value="arquivadas" className="flex items-center gap-1">
                  <X className="h-4 w-4 mr-1" />
                  Arquivadas
                  <Badge className="ml-1 bg-gray-500 text-white">{messages.filter(m => m.status === 'arquivado' && m.type === 'reclamacao').length}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nome, e-mail, assunto ou conteúdo..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes('pendente')}
                      onCheckedChange={(checked) => {
                        setStatusFilter(checked 
                          ? [...statusFilter, 'pendente']
                          : statusFilter.filter(s => s !== 'pendente')
                        );
                      }}
                    >
                      Pendente
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes('respondido')}
                      onCheckedChange={(checked) => {
                        setStatusFilter(checked 
                          ? [...statusFilter, 'respondido']
                          : statusFilter.filter(s => s !== 'respondido')
                        );
                      }}
                    >
                      Respondido
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes('arquivado')}
                      onCheckedChange={(checked) => {
                        setStatusFilter(checked 
                          ? [...statusFilter, 'arquivado']
                          : statusFilter.filter(s => s !== 'arquivado')
                        );
                      }}
                    >
                      Arquivado
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Carregando mensagens...
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length > 0 ? (
                  filteredMessages.map((msg, idx) => (
                    <TableRow
                      key={msg.id}
                      className={
                        `transition-all duration-150 cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-taxi-green/10 focus:bg-taxi-green/20`}
                      tabIndex={0}
                      onClick={() => handleViewMessage(msg)}
                      aria-label={`Ver mensagem de ${msg.name}`}
                    >
                      <TableCell className="font-medium">{msg.name}</TableCell>
                      <TableCell>{msg.email}</TableCell>
                      <TableCell>{msg.subject}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTypeLabel(msg.type).color}`}>{getTypeLabel(msg.type).icon}{getTypeLabel(msg.type).label}</span>
                            </TooltipTrigger>
                            <TooltipContent>{getTypeLabel(msg.type).label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusLabel(msg.status).color}`}>{getStatusLabel(msg.status).label}</span>
                            </TooltipTrigger>
                            <TooltipContent>{getStatusLabel(msg.status).label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>{new Date(msg.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e => { e.stopPropagation(); handleViewMessage(msg); }}
                          aria-label="Visualizar mensagem"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => { e.stopPropagation(); handleStatusChange(msg.id, 'arquivado'); toast({ title: 'Mensagem arquivada!' }); }}
                          aria-label="Arquivar mensagem"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhuma mensagem encontrada. Ajuste os filtros para ver mais resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredMessages.length} de {messages.length} mensagens
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm">Página 1 de 1</span>
                <Button variant="outline" size="sm" disabled>
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de reclamações arquivadas com histórico */}
      {activeTab === 'arquivadas' && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><X className="h-5 w-5" /> Reclamações Arquivadas</h3>
          {/* Filtros por tipo de reclamação */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['todos', 'Elogio', 'Reclamação', 'Sugestão', 'Dúvida'].map(tipo => (
              <Button
                key={tipo}
                variant={archivedTypeFilter === tipo ? 'default' : 'outline'}
                onClick={() => setArchivedTypeFilter(tipo)}
                className="capitalize"
              >
                {tipo}
              </Button>
            ))}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Reclamação</TableHead>
                <TableHead>Data Arquivamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingArquivadas ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Carregando arquivadas...</TableCell>
                </TableRow>
              ) : !arquivadasData || arquivadasData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Nenhuma reclamação arquivada.</TableCell>
                </TableRow>
              ) : (
                arquivadasData
                  .filter(m => {
                    if (archivedTypeFilter === 'todos') return true;
                    if (!m.tipo) return false;
                    return m.tipo.toLowerCase().includes(archivedTypeFilter.toLowerCase());
                  })
                  .map(m => (
                    <TableRow key={m.id} className="cursor-pointer hover:bg-gray-100" onClick={() => setSelectedArchived(m)}>
                      <TableCell>{m.nome || '-'}</TableCell>
                      <TableCell>{m.tipo || '-'}</TableCell>
                      <TableCell>{
                        m.dataEnvio instanceof Date
                          ? m.dataEnvio.toLocaleDateString('pt-BR')
                          : (typeof m.dataEnvio === 'object' && m.dataEnvio && 'toDate' in m.dataEnvio && typeof (m as any).toDate === 'function'
                              ? (m as any).toDate().toLocaleDateString('pt-BR')
                              : '-')
                      }</TableCell>
                      <TableCell>{
                        m.dataArquivamento && typeof m.dataArquivamento === 'object' && 'toDate' in m.dataArquivamento && typeof (m as any).toDate === 'function'
                          ? (m as any).toDate().toLocaleDateString('pt-BR')
                          : '-'
                      }</TableCell>
                      <TableCell>{((m as any).status) || 'arquivado'}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          {/* Modal de detalhes da arquivada */}
          <Dialog open={!!selectedArchived} onOpenChange={open => !open && setSelectedArchived(null)}>
            <DialogContent className="w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <X className="h-5 w-5 text-gray-500" />
                  Detalhes da Reclamação Arquivada
                </DialogTitle>
              </DialogHeader>
              {selectedArchived && (
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold">Nome:</span> {selectedArchived.nome || '-'}
                  </div>
                  <div>
                    <span className="font-semibold">Tipo:</span> {selectedArchived.tipo || '-'}
                  </div>
                  <div>
                    <span className="font-semibold">E-mail:</span> {selectedArchived.email || '-'}
                  </div>
                  <div>
                    <span className="font-semibold">Telefone:</span> {'telefone' in selectedArchived && typeof (selectedArchived as any).telefone === 'string' ? (selectedArchived as any).telefone || '-' : '-'}
                  </div>
                  <div>
                    <span className="font-semibold">Prefixo:</span> {'prefixo' in selectedArchived && typeof (selectedArchived as any).prefixo === 'string' ? (selectedArchived as any).prefixo || '-' : '-'}
                  </div>
                  <div>
                    <span className="font-semibold">Data da Reclamação:</span> {
                      selectedArchived.dataEnvio instanceof Date
                        ? selectedArchived.dataEnvio.toLocaleString('pt-BR')
                        : (typeof selectedArchived.dataEnvio === 'object' && selectedArchived.dataEnvio && 'toDate' in selectedArchived.dataEnvio && typeof (selectedArchived.dataEnvio as any).toDate === 'function'
                            ? (selectedArchived.dataEnvio as any).toDate().toLocaleString('pt-BR')
                            : '-')
                    }
                  </div>
                  <div>
                    <span className="font-semibold">Data de Arquivamento:</span> {
                      selectedArchived.dataArquivamento && typeof selectedArchived.dataArquivamento === 'object' && 'toDate' in selectedArchived.dataArquivamento && typeof (selectedArchived.dataArquivamento as any).toDate === 'function'
                        ? (selectedArchived.dataArquivamento as any).toDate().toLocaleString('pt-BR')
                        : '-'
                    }
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {selectedArchived.status || 'arquivado'}
                  </div>
                  <div>
                    <span className="font-semibold">Mensagem:</span>
                    <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap mt-1">
                      {selectedArchived.mensagem || '-'}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {selectedMessage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeLabel(selectedMessage.type).icon}
                {selectedMessage.subject}
              </DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={getTypeLabel(selectedMessage.type).color}>
                    {getTypeLabel(selectedMessage.type).label}
                  </Badge>
                  <Badge variant="outline" className={getStatusLabel(selectedMessage.status).color}>
                    {getStatusLabel(selectedMessage.status).label}
                  </Badge>
                  {selectedMessage.type === 'reclamacao' && selectedMessage.status !== 'respondido' && (() => {
                    const dataMsg = new Date(selectedMessage.date);
                    const agora = new Date();
                    const diffHrs = Math.floor((agora.getTime() - dataMsg.getTime()) / (1000 * 60 * 60));
                    if (diffHrs <= 48) {
                      return <Badge className="bg-yellow-200 text-yellow-900">Prazo para resposta: {48 - diffHrs}h</Badge>;
                    } else {
                      return <Badge className="bg-red-600 text-white animate-pulse">Prazo excedido!</Badge>;
                    }
                  })()}
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">De:</p>
                <p>{selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Data:</p>
                <p>{new Date(selectedMessage.date).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Mensagem:</p>
                <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                  <p>{selectedMessage.message}</p>
                </div>
              </div>
              {/* Botões de resposta */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Resposta: ${encodeURIComponent(selectedMessage.subject)}&body=Olá ${selectedMessage.name},%0D%0A%0D%0A`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="secondary" aria-label="Responder por E-mail" className="w-full">
                    Responder por E-mail
                  </Button>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Olá ${selectedMessage.name}, sobre sua mensagem: '${selectedMessage.subject}' - `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" aria-label="Responder por WhatsApp" className="w-full">
                    Responder por WhatsApp
                  </Button>
                </a>
              </div>
              {/* Observação de resolução */}
              {selectedMessage.status !== 'arquivado' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Observação de resolução (opcional):</label>
                  <textarea
                    className="w-full border rounded-md p-2 text-sm"
                    rows={2}
                    value={resolucaoObs}
                    onChange={e => setResolucaoObs(e.target.value)}
                    placeholder="Ex: Cliente foi contatado por WhatsApp em 10/06/2024."
                  />
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="flex gap-2 w-full">
                <Button onClick={handleReplyMessage} className="flex-1">
                  Marcar como Respondido
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { handleStatusChange(selectedMessage.id, 'arquivado'); setResolucaoObs(''); }}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Arquivar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContactMessages;
