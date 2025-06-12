import React from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Clock, CheckCircle } from 'lucide-react';
import { Praise } from '../types';

interface DriverMessagingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: "all" | "pending" | "processed";
  onFilterChange: (value: "all" | "pending" | "processed") => void;
  praises: Praise[];
}

export const DriverMessagingFilters: React.FC<DriverMessagingFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  praises
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow-sm border">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por código, nome ou mensagem..." 
          className="pl-10 bg-white shadow-sm border-gray-200 focus:border-blue-400 transition-colors"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Tabs value={filterStatus} onValueChange={onFilterChange} className="w-full sm:w-auto">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-white shadow-sm border">
          <TabsTrigger value="all" className="flex items-center gap-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Todos</span>
            <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
              {praises.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Pendentes</span>
            <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 border-amber-200">
              {praises.filter(p => !p.isProcessed).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="processed" className="flex items-center gap-1 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Enviados</span>
            <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200">
              {praises.filter(p => p.isProcessed).length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};