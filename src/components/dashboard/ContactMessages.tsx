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
import { where, doc, updateDoc, collection, getDoc, setDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

type TipoMensagem = "Elogio" | "Reclamação" | "Informação" | "Sugestão";
// Modificar a interface para incluir todos os campos
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string | Timestamp;
  type: TipoMensagem | "Outro";
  status: string;
  prefixo?: string;
  telefone?: string;
  dataArquivamento?: Timestamp;
  historico?: { data: string; quem: string; acao: string; obs?: string }[];
}

interface ReclamacaoData {
  id: string;
  nome: string;
  tipo: string;
  mensagem: string;
  dataEnvio: Date;
  email?: string;
  prefixo?: string;
}

function getFilteredMessages(messages, searchQuery, statusFilter, typeFilter, activeTab) {
  let filtered = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(message.status);
    let matchesType = typeFilter.length === 0 || typeFilter.includes(message.type);
    if (activeTab !== "todos" && activeTab !== "arquivadas") {
      matchesType = message.type === activeTab;
    }
    return matchesSearch && matchesStatus && matchesType;
  });
  filtered.sort((a, b) => {
    if (a.status === 'pendente' && b.status !== 'pendente') return -1;
    if (a.status !== 'pendente' && b.status === 'pendente') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  return filtered;
}

const ContactMessages = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("todos");
  const [resolucaoObs, setResolucaoObs] = useState('');
  const [historicoResolucao, setHistoricoResolucao] = useState<{[id: string]: {data: string, quem: string, obs: string}}>(() => ({}));
  const filteredMessages = getFilteredMessages(messages, searchQuery, statusFilter, typeFilter, activeTab)
    .filter(m => m.status !== 'arquivado');
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 20;
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );
  
  // Tente carregar dados do Firestore
  const { data: reclamacoesData, loading: isLoading } = useFirestore<ReclamacaoData>({
    collectionName: 'reclamacoes',
    limitCount: 100
  });
  
  // Adicione o hook para buscar arquivadas
  const { data: arquivadasData, loading: isLoadingArquivadas } = useFirestore<
    ReclamacaoData & { status?: string; dataArquivamento?: any; historico?: { data: string; quem: string; acao: string; obs?: string }[] }
  >({
    collectionName: 'reclamacoes-arquivadas',
    limitCount: 100
  });
  
  // Estado para modal de arquivada
  const [selectedArchived, setSelectedArchived] = useState<null | (ReclamacaoData & { status?: string; dataArquivamento?: any; historico?: { data: string; quem: string; acao: string; obs?: string }[] })>(null);
  
  // Estado para filtro de tipo nas arquivadas
  const [archivedTypeFilter, setArchivedTypeFilter] = useState<string>('todos');
  
  // Estado para seleção de arquivadas
  const [selectedArchivedIds, setSelectedArchivedIds] = useState<string[]>([]);
  const allArchivedSelected = arquivadasData && selectedArchivedIds.length === arquivadasData.filter(m => {
    if (archivedTypeFilter === 'todos') return true;
    if (!m.tipo) return false;
    return m.tipo.toLowerCase().includes(archivedTypeFilter.toLowerCase());
  }).length;

  // Sincroniza dados do Firestore com os dados locais quando disponíveis
  useEffect(() => {
    if (reclamacoesData && reclamacoesData.length > 0) {
      const formattedData = reclamacoesData.map((item) => {
        const tipo = item.tipo || "Outro";
        let messageType: TipoMensagem | "Outro" = "Outro";
        if (tipo === "Elogio") messageType = "Elogio";
        else if (tipo === "Reclamação") messageType = "Reclamação";
        else if (tipo === "Informação") messageType = "Informação";
        else if (tipo === "Sugestão") messageType = "Sugestão";
        return {
          id: item.id,
          name: item.nome || "Sem nome",
          email: item.email || "email@exemplo.com",
          subject: item.tipo || "Sem assunto",
          message: item.mensagem || "",
          date: item.dataEnvio instanceof Date ? item.dataEnvio.toISOString() : new Date().toISOString(),
          type: messageType,
          status: (item as any).status || "pendente",
          prefixo: (item as any).prefixo || undefined,
          historico: (item as any).historico || [],
        };
      });
      setMessages(formattedData);
    }
  }, [reclamacoesData]);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  };
  
  const addHistorico = async (messageId: string, acao: string, obs: string) => {
    if (!user) return;
    const ref = doc(collection(db, 'reclamacoes'), messageId);
    const snap = await getDoc(ref);
    let historico = [];
    if (snap.exists() && snap.data().historico) {
      historico = snap.data().historico;
    }
    historico.push({
      data: new Date().toISOString(),
      quem: user.displayName || user.email || 'Usuário',
      acao,
      obs
    });
    await setDoc(ref, { historico }, { merge: true });
  };
  
  const handleStatusChange = async (messageId: string, newStatus: string) => {
    let updateSuccess = false;
    try {
      const ref = doc(collection(db, 'reclamacoes'), messageId);
      await setDoc(ref, { status: newStatus }, { merge: true });
      await addHistorico(messageId, `Status alterado para ${newStatus}`, resolucaoObs);
      if (newStatus === 'arquivado') {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const originalData = snap.data();
          await setDoc(doc(collection(db, 'reclamacoes-arquivadas'), messageId), {
            ...originalData,
            status: 'arquivado',
            dataArquivamento: Timestamp.fromDate(new Date()),
            historico: originalData.historico || []
          }, { merge: true });
          await deleteDoc(ref);
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
        }
      }
      updateSuccess = true;
    } catch (err) {
      toast({
        title: 'Erro ao atualizar status',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    }
    if (updateSuccess && newStatus !== 'arquivado') {
      window.location.reload();
    }
  };
  
  const handleReplyMessage = () => {
    if (selectedMessage) {
      toast({
        title: "Resposta enviada",
        description: `Resposta enviada para ${selectedMessage.name} (${selectedMessage.email})`,
      });
      addHistorico(selectedMessage.id, 'Respondido', resolucaoObs);
      handleStatusChange(selectedMessage.id, 'respondido');
      setIsDialogOpen(false);
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Informação':
        return { label: 'Informação', color: 'bg-blue-100 text-blue-800', icon: <HelpCircle className="h-4 w-4 mr-1" /> };
      case 'Elogio':
        return { label: 'Elogio', color: 'bg-green-100 text-green-800', icon: <Star className="h-4 w-4 mr-1" /> };
      case 'Reclamação':
        return { label: 'Reclamação', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4 mr-1" /> };
      case 'Sugestão':
        return { label: 'Sugestão', color: 'bg-purple-100 text-purple-800', icon: <Lightbulb className="h-4 w-4 mr-1" /> };
      default:
        return { label: 'Outro', color: 'bg-gray-100 text-gray-800', icon: <MessageSquare className="h-4 w-4 mr-1" /> };
    }
  };

  const getStatusLabel = (status: string): { label: string; color: string } => {
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

  // Função para desarquivar
  const handleDesarquivarSelecionadas = async () => {
    if (!arquivadasData) return;
    for (const id of selectedArchivedIds) {
      const msg = arquivadasData.find(m => m.id === id);
      if (!msg) continue;
      // Remove de reclamacoes-arquivadas
      await deleteDoc(doc(collection(db, 'reclamacoes-arquivadas'), id));
      // Adiciona em reclamacoes (status pendente)
      const { dataArquivamento, ...msgData } = msg;
      await setDoc(doc(collection(db, 'reclamacoes'), id), {
        ...msgData,
        status: 'pendente',
        dataArquivamento: null,
      }, { merge: true });
    }
    setSelectedArchivedIds([]);
  };

  // Função utilitária para garantir Date
  function toDateSafe(val: string | Timestamp | Date): Date {
    if (val instanceof Date) return val;
    if (val instanceof Timestamp) return val.toDate();
    return new Date(val);
  }

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
            <div className="w-full overflow-x-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                <TabsList className="flex flex-nowrap gap-2 min-w-max mb-4">
                  <TabsTrigger value="todos" className="flex items-center gap-1">
                    Todos
                    {filteredMessages.length > 0 && (
                      <Badge className="ml-1 bg-yellow-500 text-white">{filteredMessages.length}</Badge>
                    )}
                  </TabsTrigger>
                  
                  <TabsTrigger value="Reclamação" className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Reclamações
                    {filteredMessages.filter(m => m.type === 'Reclamação').length > 0 && (
                      <Badge className="ml-1 bg-red-500 text-white">{filteredMessages.filter(m => m.type === 'Reclamação').length}</Badge>
                    )}
                  </TabsTrigger>
                  
                  <TabsTrigger value="Elogio" className="flex items-center gap-1">
                    <Star className="h-4 w-4 mr-1" />
                    Elogios
                    {filteredMessages.filter(m => m.type === 'Elogio').length > 0 && (
                      <Badge className="ml-1 bg-green-500 text-white">{filteredMessages.filter(m => m.type === 'Elogio').length}</Badge>
                    )}
                  </TabsTrigger>
                  
                  <TabsTrigger value="Informação" className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Informações
                    {filteredMessages.filter(m => m.type === 'Informação').length > 0 && (
                      <Badge className="ml-1 bg-blue-500 text-white">{filteredMessages.filter(m => m.type === 'Informação').length}</Badge>
                    )}
                  </TabsTrigger>
                  
                  <TabsTrigger value="Sugestão" className="flex items-center gap-1">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Sugestões
                    {filteredMessages.filter(m => m.type === 'Sugestão').length > 0 && (
                      <Badge className="ml-1 bg-purple-500 text-white">{filteredMessages.filter(m => m.type === 'Sugestão').length}</Badge>
                    )}
                  </TabsTrigger>
                  
                  <TabsTrigger value="arquivadas" className="flex items-center gap-1">
                    <X className="h-4 w-4 mr-1" />
                    Arquivadas
                    <Badge className="ml-1 bg-gray-500 text-white">{messages.filter(m => m.status === 'arquivado' && m.type === 'Reclamação').length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
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
            
            <div className="overflow-x-auto w-full">
              <Table className="min-w-full text-xs sm:text-sm md:text-base" style={{width: '100%'}}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-1">Tipo</TableHead>
                    <TableHead className="px-2 py-1">Nome</TableHead>
                    <TableHead className="px-2 py-1 hidden md:table-cell">Assunto</TableHead>
                    <TableHead className="px-2 py-1">Data</TableHead>
                    <TableHead className="px-2 py-1">Status</TableHead>
                    <TableHead className="px-2 py-1 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-xs">Carregando mensagens...</TableCell>
                    </TableRow>
                  ) : paginatedMessages.length > 0 ? (
                    paginatedMessages.map((msg, idx) => (
                      <TableRow
                        key={msg.id}
                        className={`transition-all duration-150 cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-taxi-green/10 focus:bg-taxi-green/20`}
                        tabIndex={0}
                        onClick={() => handleViewMessage(msg)}
                        aria-label={`Ver mensagem de ${msg.name}`}
                      >
                        <TableCell className="font-medium break-words max-w-[100px] text-xs sm:text-sm">{msg.name}</TableCell>
                        <TableCell className="break-words max-w-[100px] text-xs sm:text-sm">{msg.email}</TableCell>
                        <TableCell className="hidden md:table-cell break-words max-w-[100px] text-xs sm:text-sm">{msg.subject}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{new Date(msg.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTypeLabel(msg.type).color}`}>{getTypeLabel(msg.type).icon}{getTypeLabel(msg.type).label}</span>
                              </TooltipTrigger>
                              <TooltipContent>{getTypeLabel(msg.type).label}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusLabel(msg.status).color}`}>{getStatusLabel(msg.status).label}</span>
                              </TooltipTrigger>
                              <TooltipContent>{getStatusLabel(msg.status).label}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="flex gap-2 text-xs sm:text-sm">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={e => { e.stopPropagation(); handleViewMessage(msg); }}
                            aria-label="Visualizar mensagem"
                            className="px-2 py-1"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={e => { e.stopPropagation(); handleStatusChange(msg.id, 'arquivado'); toast({ title: 'Mensagem arquivada!' }); }}
                            aria-label="Arquivar mensagem"
                            className="px-2 py-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-xs">Nenhuma mensagem encontrada. Ajuste os filtros para ver mais resultados.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Mostrando {paginatedMessages.length} de {filteredMessages.length} mensagens (página {currentPage} de {totalPages})
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-xs sm:text-sm">Página {currentPage} de {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
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
            {['todos', 'Elogio', 'Reclamação', 'Sugestão', 'Informação'].map(tipo => (
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
          {/* Seleção e desarquivação */}
          <div className="flex items-center gap-4 mb-2">
            <input
              type="checkbox"
              checked={allArchivedSelected}
              onChange={() => {
                if (!arquivadasData) return;
                if (allArchivedSelected) setSelectedArchivedIds([]);
                else setSelectedArchivedIds(arquivadasData.filter(m => {
                  if (archivedTypeFilter === 'todos') return true;
                  if (!m.tipo) return false;
                  return m.tipo.toLowerCase().includes(archivedTypeFilter.toLowerCase());
                }).map(m => m.id));
              }}
            />
            <span className="text-sm">Selecionar todos</span>
            {selectedArchivedIds.length > 0 && (
              <Button
                className="btn btn-success ml-4"
                onClick={handleDesarquivarSelecionadas}
              >
                Desarquivar selecionadas ({selectedArchivedIds.length})
              </Button>
            )}
          </div>
          <Table className="min-w-full overflow-x-auto text-xs sm:text-sm md:text-base" style={{width: '100%'}}>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
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
                  <TableCell colSpan={6} className="text-center py-4">Carregando arquivadas...</TableCell>
                </TableRow>
              ) : !arquivadasData || arquivadasData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Nenhuma reclamação arquivada.</TableCell>
                </TableRow>
              ) : (
                arquivadasData
                  .filter(m => {
                    if (archivedTypeFilter === 'todos') return true;
                    if (!m.tipo) return false;
                    return m.tipo.toLowerCase().includes(archivedTypeFilter.toLowerCase());
                  })
                  .map(m => (
                    <TableRow key={m.id} className="cursor-pointer hover:bg-gray-100">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedArchivedIds.includes(m.id)}
                          onChange={() => setSelectedArchivedIds(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                        />
                      </TableCell>
                      <TableCell>{m.nome || '-'}</TableCell>
                      <TableCell>{m.tipo || '-'}</TableCell>
                      <TableCell>{m.dataEnvio ? toDateSafe(m.dataEnvio).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>{m.dataArquivamento ? toDateSafe(m.dataArquivamento).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell>{((m as any).status) || 'arquivado'}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          {/* Modal de detalhes da arquivada */}
          <Dialog open={!!selectedArchived} onOpenChange={open => !open && setSelectedArchived(null)}>
            <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 md:p-6 rounded-lg shadow-lg text-xs sm:text-sm md:text-base">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <X className="h-5 w-5 text-gray-500" />
                  Detalhes da Reclamação Arquivada
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base">
                {selectedArchived ? <>
                <div><span className="font-semibold">Nome:</span> {selectedArchived.nome || '-'}</div>
                <div><span className="font-semibold">Tipo:</span> {selectedArchived.tipo || '-'}</div>
                <div><span className="font-semibold">E-mail:</span> {selectedArchived.email || '-'}</div>
                <div><span className="font-semibold">Telefone:</span> {'telefone' in selectedArchived && typeof (selectedArchived as any).telefone === 'string' ? (selectedArchived as any).telefone || '-' : '-'}</div>
                <div><span className="font-semibold">Prefixo:</span> {selectedArchived && selectedArchived.prefixo ? selectedArchived.prefixo : <span className="text-gray-400">-</span>}</div>
                <div><span className="font-semibold">Data da Reclamação:</span> {
                  selectedArchived.dataEnvio instanceof Date
                    ? selectedArchived.dataEnvio.toLocaleString('pt-BR')
                    : (typeof selectedArchived.dataEnvio === 'object' && selectedArchived.dataEnvio && 'toDate' in selectedArchived.dataEnvio && typeof (selectedArchived.dataEnvio as any).toDate === 'function'
                        ? (selectedArchived.dataEnvio as any).toDate().toLocaleString('pt-BR')
                        : '-')
                }</div>
                <div><span className="font-semibold">Data de Arquivamento:</span> {
                  selectedArchived.dataArquivamento && typeof selectedArchived.dataArquivamento === 'object' && 'toDate' in selectedArchived.dataArquivamento && typeof (selectedArchived.dataArquivamento as any).toDate === 'function'
                    ? (selectedArchived.dataArquivamento as any).toDate().toLocaleString('pt-BR')
                    : '-'
                }</div>
                <div><span className="font-semibold">Status:</span> {selectedArchived.status || 'arquivado'}</div>
                <div>
                  <span className="font-semibold">Mensagem:</span>
                  <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap mt-1">{selectedArchived.mensagem || '-'}</div>
                </div>
                <div className="mt-4 border-t pt-3">
                  <span className="font-semibold">Histórico de Ações:</span>
                  {selectedArchived.historico && selectedArchived.historico.length > 0 ? (
                    <ul className="bg-gray-50 p-2 rounded-md mt-1 text-xs">
                      {selectedArchived.historico.map((h, idx) => (
                        <li key={idx} className="mb-1">
                          <b>{h.data && new Date(h.data).toLocaleString('pt-BR')}</b> - <b>{h.quem}</b>: {h.acao} {h.obs && `- ${h.obs}`}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400 text-xs mt-1">Nenhuma ação registrada.</div>
                  )}
                </div>
                </> : null}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {selectedMessage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-2 sm:p-4 md:p-6 rounded-lg shadow-lg text-xs sm:text-sm md:text-base">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                {getTypeLabel(selectedMessage.type).icon}
                {selectedMessage.subject}
              </DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={getTypeLabel(selectedMessage.type).color + ' text-xs sm:text-sm'}>
                    {getTypeLabel(selectedMessage.type).label}
                  </Badge>
                  <Badge variant="outline" className={getStatusLabel(selectedMessage.status).color + ' text-xs sm:text-sm'}>
                    {getStatusLabel(selectedMessage.status).label}
                  </Badge>
                  {selectedMessage.type === 'Reclamação' && selectedMessage.status !== 'respondido' && (() => {
                    const dataMsg = toDateSafe(selectedMessage.date);
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
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base">
              <div><span className="font-semibold">De:</span> {selectedMessage.name} &lt;{selectedMessage.email}&gt;</div>
              <div><span className="font-semibold">Data:</span> {selectedMessage.date ? toDateSafe(selectedMessage.date).toLocaleString('pt-BR') : '-'}</div>
              <div><span className="font-semibold">Prefixo:</span> {selectedMessage.prefixo ?? <span className="text-gray-400">-</span>}</div>
              <div>
                <span className="font-semibold">Mensagem:</span>
                <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                  <p>{selectedMessage.message}</p>
                </div>
              </div>
              <div className="mt-4 border-t pt-3">
                <span className="font-semibold">Histórico de Ações:</span>
                {selectedMessage.historico && selectedMessage.historico.length > 0 ? (
                  <ul className="bg-gray-50 p-2 rounded-md mt-1 text-xs">
                    {selectedMessage.historico.map((h, idx) => (
                      <li key={idx} className="mb-1">
                        <b>{h.data && new Date(h.data).toLocaleString('pt-BR')}</b> - <b>{h.quem}</b>: {h.acao} {h.obs && `- ${h.obs}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400 text-xs mt-1">Nenhuma ação registrada.</div>
                )}
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
