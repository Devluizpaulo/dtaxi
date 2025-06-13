import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Car, Search, Filter, MoreVertical, MapPin, Clock, Fuel, Settings, AlertTriangle, CheckCircle, XCircle, Eye, Edit, Trash2, RefreshCw, Activity, TrendingUp, TrendingDown, Zap, Shield } from 'lucide-react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Mock data for fleet
const fleetVehicles = [
  { id: 1, model: 'Toyota Corolla Híbrido', plate: 'ABC-1234', driver: 'Carlos Oliveira', type: 'hybrid', status: 'active', lastMaintenance: '2023-01-15', nextMaintenance: '2023-07-15', fuelLevel: 85, batteryLevel: 70 },
  { id: 2, model: 'Honda Civic Híbrido', plate: 'DEF-5678', driver: 'Maria Silva', type: 'hybrid', status: 'active', lastMaintenance: '2023-02-20', nextMaintenance: '2023-08-20', fuelLevel: 65, batteryLevel: 90 },
  { id: 3, model: 'Nissan Leaf Elétrico', plate: 'GHI-9012', driver: 'João Santos', type: 'electric', status: 'maintenance', lastMaintenance: '2023-03-10', nextMaintenance: '2023-09-10', fuelLevel: 0, batteryLevel: 45 },
  { id: 4, model: 'Toyota Prius Híbrido', plate: 'JKL-3456', driver: 'Ana Costa', type: 'hybrid', status: 'active', lastMaintenance: '2022-12-05', nextMaintenance: '2023-06-05', fuelLevel: 75, batteryLevel: 80 },
  { id: 5, model: 'Chevrolet Bolt Elétrico', plate: 'MNO-7890', driver: 'Pedro Alves', type: 'electric', status: 'charging', lastMaintenance: '2023-04-01', nextMaintenance: '2023-10-01', fuelLevel: 0, batteryLevel: 30 },
  { id: 6, model: 'Toyota Etios', plate: 'PQR-1234', driver: 'Fernanda Lima', type: 'fuel', status: 'active', lastMaintenance: '2023-02-15', nextMaintenance: '2023-08-15', fuelLevel: 45, batteryLevel: 0 },
  { id: 7, model: 'Honda City', plate: 'STU-5678', driver: 'Ricardo Gomes', type: 'fuel', status: 'maintenance', lastMaintenance: '2023-01-20', nextMaintenance: '2023-07-20', fuelLevel: 20, batteryLevel: 0 },
  { id: 8, model: 'Nissan Versa', plate: 'VWX-9012', driver: 'Camila Martins', type: 'fuel', status: 'inactive', lastMaintenance: '2023-03-05', nextMaintenance: '2023-09-05', fuelLevel: 90, batteryLevel: 0 },
];

const FleetManagement = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [activeTab, setActiveTab] = useState('ativos');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    manutencao: 0,
    inativos: 0,
    disponivel: 0,
    ocupado: 0,
    combustivelMedio: 0,
    kmTotal: 0
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const vehiclesRef = collection(db, 'vehicles');
      const q = query(vehiclesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const vehiclesData = snapshot.docs.map(doc => ({
        id: doc.id,
        fuelLevel: Math.floor(Math.random() * 100), // Simulado
        kmRodados: Math.floor(Math.random() * 50000), // Simulado
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Simulado
        efficiency: Math.floor(Math.random() * 20) + 8, // km/l simulado
        ...doc.data()
      }));
      
      setVehicles(vehiclesData);
      
      // Calcular estatísticas
      const combustivelMedio = vehiclesData.reduce((acc, v) => acc + (v.fuelLevel || 0), 0) / vehiclesData.length;
      const kmTotal = vehiclesData.reduce((acc, v) => acc + (v.kmRodados || 0), 0);
      
      const statsData = {
        total: vehiclesData.length,
        ativos: vehiclesData.filter(v => v.status === 'ativo').length,
        manutencao: vehiclesData.filter(v => v.status === 'manutencao').length,
        inativos: vehiclesData.filter(v => v.status === 'inativo').length,
        disponivel: vehiclesData.filter(v => v.disponibilidade === 'disponivel').length,
        ocupado: vehiclesData.filter(v => v.disponibilidade === 'ocupado').length,
        combustivelMedio: Math.round(combustivelMedio),
        kmTotal
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const getFilteredVehicles = () => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.motorista?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || vehicle.status === statusFilter;
      const matchesTab = activeTab === 'todos' || 
                        (activeTab === 'ativos' && vehicle.status === 'ativo') ||
                        (activeTab === 'manutencao' && vehicle.status === 'manutencao') ||
                        (activeTab === 'inativos' && vehicle.status === 'inativo');
      
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
      case 'manutencao': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'inativo': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getAvailabilityColor = (disponibilidade: string) => {
    switch (disponibilidade) {
      case 'disponivel': return 'bg-blue-100 text-blue-700';
      case 'ocupado': return 'bg-orange-100 text-orange-700';
      case 'manutencao': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 50) return 'bg-green-500';
    if (level > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>;
      case 'maintenance':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Manutenção</Badge>;
      case 'charging':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Carregando</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inativo</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const getVehicleTypeBadge = (type: string) => {
    switch (type) {
      case 'electric':
        return <Badge className="bg-taxi-green/20 text-taxi-green hover:bg-taxi-green/20">Elétrico</Badge>;
      case 'hybrid':
        return <Badge className="bg-taxi-yellow/20 text-taxi-black hover:bg-taxi-yellow/20">Híbrido</Badge>;
      case 'fuel':
        return <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">Combustão</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h1 className="text-3xl font-bold">Frota & Veículos</h1>
        <a
          href="/PrivacyPolicy"
          className="text-sm text-taxi-green underline hover:text-taxi-yellow transition-colors font-medium md:ml-auto"
          target="_blank"
          rel="noopener noreferrer"
        >
          Política de Privacidade
        </a>
      </div>
      <div className="flex justify-between items-center">
        <Button className="bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Veículo
        </Button>
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
              <Car className="h-8 w-8 text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" />
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
                <div className="text-2xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">{stats.manutencao}</div>
                <p className="text-xs text-muted-foreground font-medium">Manutenção</p>
              </div>
              <Settings className="h-8 w-8 text-yellow-500 opacity-20 group-hover:opacity-40 transition-opacity" />
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
                <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">{stats.combustivelMedio}%</div>
                <p className="text-xs text-muted-foreground font-medium">Combustível</p>
              </div>
              <Fuel className="h-8 w-8 text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">{(stats.kmTotal / 1000).toFixed(0)}k</div>
                <p className="text-xs text-muted-foreground font-medium">KM Total</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Veículos</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filtrar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Modelo (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem>Tipo de veículo</DropdownMenuItem>
                  <DropdownMenuItem>Status</DropdownMenuItem>
                  <DropdownMenuItem>Data de manutenção</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>Gerenciamento da frota</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar veículo..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="w-full border-b rounded-none">
                <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
                <TabsTrigger value="active" className="flex-1">Ativos</TabsTrigger>
                <TabsTrigger value="maintenance" className="flex-1">Manutenção</TabsTrigger>
              </TabsList>
              <div className="space-y-2 p-2 max-h-[500px] overflow-y-auto">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedVehicle?.id === vehicle.id ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectVehicle(vehicle)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Car className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{vehicle.model}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{vehicle.plate}</span>
                        </div>
                      </div>
                      <div className="ml-auto">
                        {getStatusBadge(vehicle.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedVehicle ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl">{selectedVehicle.model}</CardTitle>
                      {getVehicleTypeBadge(selectedVehicle.type)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">{selectedVehicle.plate}</span>
                      <span className="text-sm text-muted-foreground">|</span>
                      <span className="text-sm text-muted-foreground">Motorista: {selectedVehicle.driver}</span>
                      <span className="text-sm text-muted-foreground">|</span>
                      {getStatusBadge(selectedVehicle.status)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">Remover</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informações do Veículo</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Tipo</p>
                          <p className="font-medium">
                            {selectedVehicle.type === 'electric' ? 'Elétrico' : 
                             selectedVehicle.type === 'hybrid' ? 'Híbrido' : 'Combustão'}
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-medium">
                            {selectedVehicle.status === 'active' ? 'Ativo' : 
                             selectedVehicle.status === 'maintenance' ? 'Em Manutenção' : 
                             selectedVehicle.status === 'charging' ? 'Carregando' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Motorista Atual</p>
                        <p className="font-medium">{selectedVehicle.driver}</p>
                      </div>
                      
                      {selectedVehicle.type !== 'fuel' && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Nível da Bateria</span>
                            <span className="text-sm font-medium">
                              {selectedVehicle.batteryLevel}%
                            </span>
                          </div>
                          <Progress value={selectedVehicle.batteryLevel} className="h-2" />
                        </div>
                      )}
                      
                      {selectedVehicle.type !== 'electric' && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Nível de Combustível</span>
                            <span className="text-sm font-medium">
                              {selectedVehicle.fuelLevel}%
                            </span>
                          </div>
                          <Progress value={selectedVehicle.fuelLevel} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Manutenção</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Última Manutenção</p>
                          <p className="font-medium">
                            {new Date(selectedVehicle.lastMaintenance).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Próxima Manutenção</p>
                          <p className="font-medium">
                            {new Date(selectedVehicle.nextMaintenance).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Histórico de Manutenção</p>
                        <div className="space-y-2">
                          <div className="p-2 border border-border rounded-md flex justify-between items-center">
                            <div>
                              <p className="font-medium">Revisão 50.000 km</p>
                              <p className="text-sm text-muted-foreground">15/01/2023</p>
                            </div>
                            <Button variant="outline" size="sm">Detalhes</Button>
                          </div>
                          <div className="p-2 border border-border rounded-md flex justify-between items-center">
                            <div>
                              <p className="font-medium">Troca de Óleo</p>
                              <p className="text-sm text-muted-foreground">20/11/2022</p>
                            </div>
                            <Button variant="outline" size="sm">Detalhes</Button>
                          </div>
                          <div className="p-2 border border-border rounded-md flex justify-between items-center">
                            <div>
                              <p className="font-medium">Revisão 40.000 km</p>
                              <p className="text-sm text-muted-foreground">05/07/2022</p>
                            </div>
                            <Button variant="outline" size="sm">Detalhes</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Sustentabilidade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedVehicle.type !== 'fuel' && (
                      <>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Redução de CO₂</p>
                          <p className="text-2xl font-bold">
                            {selectedVehicle.type === 'electric' ? '100%' : '65%'}
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Km Rodados (Modo Elétrico)</p>
                          <p className="text-2xl font-bold">12.458</p>
                        </div>
                      </>
                    )}
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">Economia de Combustível</p>
                      <p className="text-2xl font-bold">
                        {selectedVehicle.type === 'electric' ? '100%' : 
                         selectedVehicle.type === 'hybrid' ? '45%' : '0%'}
                      </p>
                    </div>
                    {selectedVehicle.type === 'fuel' && (
                      <>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Emissão de CO₂</p>
                          <p className="text-2xl font-bold">Padrão</p>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Plano de Substituição</p>
                          <p className="text-2xl font-bold">2024</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Selecione um veículo</h3>
                <p className="text-muted-foreground">Clique em um veículo para ver seus detalhes</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FleetManagement;
