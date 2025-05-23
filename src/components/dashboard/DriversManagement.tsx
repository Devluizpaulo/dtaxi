
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Car, Star, Phone, Mail, Calendar, FileText, MapPin } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const handleSelectDriver = (driver: any) => {
    setSelectedDriver(driver);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Motoristas</h1>
        <Button className="bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Motorista
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Motoristas</CardTitle>
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
                  <DropdownMenuItem>Nota (maior primeiro)</DropdownMenuItem>
                  <DropdownMenuItem>Data de entrada</DropdownMenuItem>
                  <DropdownMenuItem>Nome (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem>Tipo de veículo</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>Gerencie seus motoristas</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar motorista..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="active">
              <TabsList className="w-full border-b rounded-none">
                <TabsTrigger value="active" className="flex-1">Ativos ({activeDrivers.length})</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">Pendentes ({pendingDrivers.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="m-0">
                <div className="space-y-2 p-2 max-h-[500px] overflow-y-auto">
                  {activeDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedDriver?.id === driver.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectDriver(driver)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{driver.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{driver.name}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Car className="mr-1 h-3.5 w-3.5" />
                            <span>{driver.car}</span>
                          </div>
                        </div>
                        <div className="ml-auto flex items-center">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pending" className="m-0">
                <div className="space-y-2 p-2 max-h-[500px] overflow-y-auto">
                  {pendingDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedDriver?.id === driver.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectDriver(driver)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{driver.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{driver.name}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Car className="mr-1 h-3.5 w-3.5" />
                            <span>{driver.car}</span>
                          </div>
                        </div>
                        <div className="ml-auto flex items-center">
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedDriver ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xl">{selectedDriver.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{selectedDriver.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={selectedDriver.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          }
                        >
                          {selectedDriver.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                        {selectedDriver.status === 'active' && (
                          <div className="flex items-center text-yellow-500">
                            <Star className="fill-current h-4 w-4" />
                            <span className="ml-1 font-medium">{selectedDriver.rating}</span>
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">ID: #{selectedDriver.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedDriver.status === 'pending' ? (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Aprovar</Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">Recusar</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline">Editar</Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">Suspender</Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedDriver.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedDriver.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Desde {new Date(selectedDriver.joined).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedDriver.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informações do Veículo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedDriver.car}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Licença: ABC-1234</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Última vistoria: 20/02/2023</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDriver.status === 'active' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Total de Corridas</p>
                        <p className="text-2xl font-bold">{selectedDriver.rides}</p>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Avaliação Média</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold">{selectedDriver.rating}</p>
                          <Star className="ml-1 h-5 w-5 fill-current text-yellow-500" />
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">Aceitação de Corridas</p>
                        <p className="text-2xl font-bold">95%</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDriver.status === 'pending' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Documentos Pendentes</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <span>CNH</span>
                        <Button variant="outline" size="sm">Visualizar</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <span>Documento do Veículo</span>
                        <Button variant="outline" size="sm">Visualizar</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <span>Antecedentes Criminais</span>
                        <Button variant="outline" size="sm">Visualizar</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Selecione um motorista</h3>
                <p className="text-muted-foreground">Clique em um motorista para ver seus detalhes</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DriversManagement;
