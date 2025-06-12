
import React, { useState } from 'react';
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
  ChevronRight 
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
  const [messages, setMessages] = useState(mockContactMessages);
  const [selectedMessage, setSelectedMessage] = useState<typeof mockContactMessages[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  
  const handleViewMessage = (message: typeof mockContactMessages[0]) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  };
  
  const handleStatusChange = (messageId: string, newStatus: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: newStatus } : msg
    ));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage({ ...selectedMessage, status: newStatus });
    }
  };
  
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      message.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(message.status);
    const matchesType = typeFilter.length === 0 || typeFilter.includes(message.type);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mensagens de Contato</CardTitle>
          <CardDescription>
            Gerencie as mensagens enviadas através do formulário de contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nome, e-mail ou assunto..."
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Tipo
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por Tipo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('duvida')}
                    onCheckedChange={(checked) => {
                      setTypeFilter(checked 
                        ? [...typeFilter, 'duvida']
                        : typeFilter.filter(t => t !== 'duvida')
                      );
                    }}
                  >
                    Dúvida
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('elogio')}
                    onCheckedChange={(checked) => {
                      setTypeFilter(checked 
                        ? [...typeFilter, 'elogio']
                        : typeFilter.filter(t => t !== 'elogio')
                      );
                    }}
                  >
                    Elogio
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('reclamacao')}
                    onCheckedChange={(checked) => {
                      setTypeFilter(checked 
                        ? [...typeFilter, 'reclamacao']
                        : typeFilter.filter(t => t !== 'reclamacao')
                      );
                    }}
                  >
                    Reclamação
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('sugestao')}
                    onCheckedChange={(checked) => {
                      setTypeFilter(checked 
                        ? [...typeFilter, 'sugestao']
                        : typeFilter.filter(t => t !== 'sugestao')
                      );
                    }}
                  >
                    Sugestão
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
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <Badge variant="outline" className={getTypeLabel(message.type).color}>
                        {getTypeLabel(message.type).label}
                      </Badge>
                    </TableCell>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>{new Date(message.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusLabel(message.status).color}>
                        {getStatusLabel(message.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewMessage(message)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(message.id, 'pendente')}>
                              Marcar como Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(message.id, 'respondido')}>
                              Marcar como Respondido
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(message.id, 'arquivado')}>
                              Arquivar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhuma mensagem encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm">Página 1 de 1</span>
            <Button variant="outline" size="sm">
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {selectedMessage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={getTypeLabel(selectedMessage.type).color}>
                    {getTypeLabel(selectedMessage.type).label}
                  </Badge>
                  <Badge variant="outline" className={getStatusLabel(selectedMessage.status).color}>
                    {getStatusLabel(selectedMessage.status).label}
                  </Badge>
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
                <div className="bg-gray-50 p-3 rounded-md">
                  <p>{selectedMessage.message}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedMessage.id, 'respondido')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar como Respondido
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedMessage.id, 'arquivado')}
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
