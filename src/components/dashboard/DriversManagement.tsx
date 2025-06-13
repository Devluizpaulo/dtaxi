
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Search, Filter, MoreVertical, Phone, Mail, MapPin, Clock, Star, AlertTriangle, CheckCircle, XCircle, Eye, Edit, Trash2, RefreshCw, Activity, TrendingUp, Award, Calendar, MessageSquare, Plus, Car, FileText } from 'lucide-react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Mock data for active drivers
const activeDrivers = [
  { id: 1, name: 'Carlos Oliveira', avatar: 'CO', car: 'Toyota Corolla Híbrido', rating: 4.8, status: 'active', phone: '(11) 98765-4321', email: 'carlos@example.com', rides: 2456, joined: '2018-05-12', location: 'São Paulo - SP' },
  { id: 2, name: 'Maria Silva', avatar: 'MS', car: 'Honda Civic Híbrido', rating: 4.9, status: 'active', phone: '(11) 97654-3210', email: 'maria@example.com', rides: 3120, joined: '2019-03-20', location: 'São Paulo - SP' },
  { id: 3, name: 'João Santos', avatar: 'JS', car: 'Nissan Leaf Elétrico', rating: 4.7, status: 'active', phone: '(11) 96543-2109', email: 'joao@example.com', rides: 1835, joined: '2020-08-15', location: 'São Paulo - SP' },
  { id: 4, name: 'Ana Costa', avatar: 'AC', car: 'Toyota Prius Híbrido', rating: 4.6, status: 'active', phone: '(11) 95432-1098', email: 'ana@example.com', rides: 2103, joined: '2019-11-23', location: 'São Paulo - SP' },
  { id: 5, name: 'Pedro Alves', avatar: 'PA', car: 'Chevrolet Bolt Elétrico', rating: 4.5, status: 'active', phone: '(11) 94321-0987', email: 'pedro@example.com', rides: 980, joined: '2021-04-10', location: 'São Paulo - SP' },
];

// Mock data for pending drivers
const pendingDrivers = [
  { id: 6, name: 'Fernanda Lima', avatar: 'FL', car: 'Toyota Corolla 2021', rating: 0, status: 'pending', phone: '(11) 93210-9876', email: 'fernanda@example.com', rides: 0, joined: '2023-02-28', location: 'São Paulo - SP' },
  { id: 7, name: 'Ricardo Gomes', avatar: 'RG', car: 'Honda City 2020', rating: 0, status: 'pending', phone: '(11) 92109-8765', email: 'ricardo@example.com', rides: 0, joined: '2023-03-05', location: 'São Paulo - SP' },
  { id: 8, name: 'Camila Martins', avatar: 'CM', car: 'Nissan Versa 2022', rating: 0, status: 'pending', phone: '(11) 91098-7654', email: 'camila@example.com', rides: 0, joined: '2023-03-10', location: 'São Paulo - SP' },
];

const DriversManagement = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [activeTab, setActiveTab] = useState('ativos');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    pendentes: 0,
    inativos: 0,
    disponivel: 0,
    ocupado: 0,
    avaliacaoMedia: 0,
    corridasTotal: 0
  });

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const driversRef = collection(db, 'drivers');
      const q = query(driversRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const driversData = snapshot.docs.map(doc => ({
        id: doc.id,
        avaliacao: Math.floor(Math.random() * 2) + 4, // 4-5 estrelas simulado
        corridasRealizadas: Math.floor(Math.random() * 500) + 50, // Simulado
        tempoOnline: Math.floor(Math.random() * 12) + 1, // horas simulado
        ganhosDiarios: Math.floor(Math.random() * 300) + 100, // R$ simulado
        ...doc.data()
      }));
      
      setDrivers(driversData);
      
      // Calcular estatísticas
      const avaliacaoMedia = driversData.reduce((acc, d) => acc + (d.avaliacao || 0), 0) / driversData.length;
      const corridasTotal = driversData.reduce((acc, d) => acc + (d.corridasRealizadas || 0), 0);
      
      const statsData = {
        total: driversData.length,
        ativos: driversData.filter(d => d.status === 'ativo').length,
        pendentes: driversData.filter(d => d.status === 'pendente').length,
        inativos: driversData.filter(d => d.status === 'inativo').length,
        disponivel: driversData.filter(d => d.disponibilidade === 'disponivel').length,
        ocupado: driversData.filter(d => d.disponibilidade === 'ocupado').length,
        avaliacaoMedia: Math.round(avaliacaoMedia * 10) / 10,
        corridasTotal
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const getFilteredDrivers = () => {
    return drivers.filter(driver => {
      const matchesSearch = driver.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           driver.telefone?.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'todos' || driver.status === statusFilter;
      const matchesTab = activeTab === 'todos' || 
                        (activeTab === 'ativos' && driver.status === 'ativo') ||
                        (activeTab === 'pendentes' && driver.status === 'pendente') ||
                        (activeTab === 'inativos' && driver.status === 'inativo');
      
      return matchesSearch && matchesStatus && matchesTab;
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
      case 'ativo': return 'bg-green-100 text-green-700 border-green-300';
      case 'pendente': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'inativo': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getAvailabilityColor = (disponibilidade: string) => {
    switch (disponibilidade) {
      case 'disponivel': return 'bg-blue-100 text-blue-700';
      case 'ocupado': return 'bg-orange-100 text-orange-700';
      case 'offline': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
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

  const handleSelectDriver = (driver: any) => {
    setSelectedDriver(driver);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Motoristas</h1>
          <p className="text-muted-foreground">Gerencie e monitore todos os motoristas da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDrivers} disabled={isRefreshing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
            Atualizar
          </Button>
          <Button className="bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white">
            <Plus className="mr-2 h-4 w-4" /> Novo Motorista
          </Button>
        </div>
      </div>

      {/* Estatísticas Interativas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">{stats.total}</div>
                <p className="text-xs text-muted-foreground font-medium">Total</p>
              </div>
              <User className="h-8 w-8 text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform">{stats.ativos}</div>
                <p className="text-xs text-muted-foreground font-medium">Ativos</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">{stats.pendentes}</div>
                <p className="text-xs text-muted-foreground font-medium">Pendentes</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600 group-hover:scale-110 transition-transform">{stats.inativos}</div>
                <p className="text-xs text-muted-foreground font-medium">Inativos</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">{stats.avaliacaoMedia}</div>
                <p className="text-xs text-muted-foreground font-medium">Avaliação</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">{stats.corridasTotal}</div>
                <p className="text-xs text-muted-foreground font-medium">Corridas</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="ativos">Ativos ({stats.ativos})</TabsTrigger>
                  <TabsTrigger value="pendentes">Pendentes ({stats.pendentes})</TabsTrigger>
                  <TabsTrigger value="inativos">Inativos ({stats.inativos})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Carregando motoristas...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Lista de motoristas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredDrivers().map((driver, index) => {
                  const isExpanded = expandedCards.has(driver.id);
                  const isSelected = selectedDriver === driver.id;
                  
                  return (
                    <Card 
                      key={driver.id} 
                      className={cn(
                        'hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4',
                        isSelected && 'ring-2 ring-blue-500 shadow-xl',
                        driver.status === 'ativo' && 'border-l-green-500',
                        driver.status === 'pendente' && 'border-l-yellow-500',
                        driver.status === 'inativo' && 'border-l-red-500',
                        'hover:scale-[1.02]'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => {
                        setSelectedDriver(isSelected ? null : driver.id);
                        toggleCardExpansion(driver.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform duration-200">
                                <AvatarImage src={driver.foto} />
                                <AvatarFallback className={cn(
                                  'font-bold text-white',
                                  driver.status === 'ativo' && 'bg-gradient-to-br from-green-400 to-green-600',
                                  driver.status === 'pendente' && 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                                  driver.status === 'inativo' && 'bg-gradient-to-br from-red-400 to-red-600'
                                )}>
                                  {driver.nome?.split(' ').map(n => n[0]).join('') || 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                                driver.disponibilidade === 'disponivel' && 'bg-green-500',
                                driver.disponibilidade === 'ocupado' && 'bg-orange-500',
                                driver.disponibilidade === 'offline' && 'bg-gray-500'
                              )}></div>
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-gray-900">{driver.nome}</h3>
                              <p className="text-sm text-gray-600">{driver.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={cn('text-xs', getStatusColor(driver.status))}>
                                  {driver.status === 'ativo' && '🟢'}
                                  {driver.status === 'pendente' && '🟡'}
                                  {driver.status === 'inativo' && '🔴'}
                                  {driver.status}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  {renderStars(driver.avaliacao)}
                                  <span className="text-xs text-gray-600 ml-1">{driver.avaliacao}</span>
                                </div>
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
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="h-4 w-4 mr-2" />
                                Histórico
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Mensagem
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Desativar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Informações básicas sempre visíveis */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-sm font-bold text-gray-700">{driver.corridasRealizadas}</div>
                              <div className="text-xs text-gray-500">Corridas</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-sm font-bold text-gray-700">{driver.tempoOnline}h</div>
                              <div className="text-xs text-gray-500">Online hoje</div>
                            </div>
                          </div>
                          
                          {/* Informações expandidas */}
                          <div className={cn(
                            'transition-all duration-300 overflow-hidden',
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          )}>
                            <div className="space-y-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 font-medium">Disponibilidade:</span>
                                <Badge className={cn('text-xs', getAvailabilityColor(driver.disponibilidade))}>
                                  {driver.disponibilidade === 'disponivel' && '🟢 Disponível'}
                                  {driver.disponibilidade === 'ocupado' && '🟠 Ocupado'}
                                  {driver.disponibilidade === 'offline' && '⚫ Offline'}
                                </Badge>
                              </div>
                              
                              {driver.telefone && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Phone className="h-3 w-3 text-blue-500" />
                                  <span className="text-gray-600">{driver.telefone}</span>
                                </div>
                              )}
                              
                              {driver.veiculo && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600 font-medium">Veículo:</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                                      <span className="text-xs text-white font-bold">🚗</span>
                                    </div>
                                    <span className="text-xs font-semibold">{driver.veiculo.placa}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-2 bg-green-50 rounded">
                                  <div className="text-sm font-bold text-green-700">R$ {driver.ganhosDiarios}</div>
                                  <div className="text-xs text-green-600">Ganhos hoje</div>
                                </div>
                                <div className="text-center p-2 bg-blue-50 rounded">
                                  <div className="text-sm font-bold text-blue-700">{Math.floor(Math.random() * 20) + 5}</div>
                                  <div className="text-xs text-blue-600">Corridas hoje</div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button size="sm" variant="outline" className="flex-1 text-xs">
                                  <Phone className="h-3 w-3 mr-1" />
                                  Ligar
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 text-xs">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Mensagem
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{format(driver.createdAt?.toDate() || new Date(), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={cn(
                                'w-2 h-2 rounded-full',
                                driver.disponibilidade === 'disponivel' && 'bg-green-500 animate-pulse',
                                driver.disponibilidade === 'ocupado' && 'bg-orange-500',
                                driver.disponibilidade === 'offline' && 'bg-gray-500'
                              )}></div>
                              <span className="text-xs text-gray-500 font-medium">
                                {driver.disponibilidade === 'disponivel' && 'Online'}
                                {driver.disponibilidade === 'ocupado' && 'Em corrida'}
                                {driver.disponibilidade === 'offline' && 'Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {getFilteredDrivers().length === 0 && (
                <div className="text-center py-20">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhum motorista encontrado</h3>
                  <p className="text-muted-foreground">Tente ajustar os filtros ou adicionar um novo motorista</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default DriversManagement;
