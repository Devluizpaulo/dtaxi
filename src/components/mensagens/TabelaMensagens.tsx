import { Mensagem } from '@/services/firebaseService';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/utils/formatarData';
import { Eye, Archive, Move, Undo2, Clock, User, Mail, Phone, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const tipoConfig = {
  reclamacao: {
    color: 'bg-red-50 border-red-200 text-red-800',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    icon: '🚨'
  },
  elogio: {
    color: 'bg-green-50 border-green-200 text-green-800',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    icon: '⭐'
  },
  duvida: {
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '❓'
  },
  sugestao: {
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '💡'
  },
  informacao: {
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: 'ℹ️'
  },
  outro: {
    color: 'bg-gray-50 border-gray-200 text-gray-800',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: '📝'
  }
};

const StatusBadge = ({ resolvido }: { resolvido: boolean }) => (
  <Badge 
    variant={resolvido ? "default" : "secondary"}
    className={cn(
      "text-xs font-medium",
      resolvido 
        ? "bg-green-100 text-green-800 border-green-300" 
        : "bg-yellow-100 text-yellow-800 border-yellow-300"
    )}
  >
    {resolvido ? '✅ Resolvido' : '⏳ Pendente'}
  </Badge>
);

const ActionButton = ({ 
  icon: Icon, 
  onClick, 
  tooltip, 
  variant = "ghost",
  className = ""
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  tooltip: string;
  variant?: "ghost" | "outline";
  className?: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button 
        size="sm" 
        variant={variant} 
        onClick={onClick} 
        className={cn("h-8 w-8 p-0 hover:scale-105 transition-all", className)}
      >
        <Icon className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);

export default function TabelaMensagens({ 
  mensagens, 
  onVisualizar, 
  onArquivar, 
  onMigrar, 
  onDesarquivar 
}: {
  mensagens: Mensagem[];
  onVisualizar: (msg: Mensagem) => void;
  onArquivar?: (msg: Mensagem) => void;
  onMigrar?: (msg: Mensagem) => void;
  onDesarquivar?: (msg: Mensagem) => void;
}) {
  if (mensagens.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma mensagem encontrada</h3>
          <p className="text-sm text-gray-500">Não há mensagens nesta categoria no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="shadow-sm border-0 bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 w-[120px]">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Protocolo
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Cliente
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[120px]">
                    <div className="flex items-center gap-2">
                      <Badge className="w-4 h-4 rounded-full" />
                      Tipo
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[100px]">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[140px]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Data
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[120px] text-center">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensagens.map((msg, index) => {
                  const config = tipoConfig[msg.tipo?.toLowerCase() as keyof typeof tipoConfig] || tipoConfig.outro;
                  
                  return (
                    <TableRow 
                      key={msg.id || index} 
                      className={cn(
                        "hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group",
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      )}
                      onClick={() => onVisualizar(msg)}
                    >
                      <TableCell className="font-mono text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{msg.protocolo || 'Sem protocolo'}</span>
                          {msg.prefixo && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              🚕 {msg.prefixo}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900">{msg.nome}</span>
                          <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                            {msg.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {msg.email}
                              </span>
                            )}
                            {msg.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {msg.telefone}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={cn("text-xs font-medium border", config.badgeColor)}>
                          <span className="mr-1">{config.icon}</span>
                          {msg.tipo}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <StatusBadge resolvido={msg.resolvido || false} />
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex flex-col gap-0.5">
                          <span>{formatarData(msg.dataCriacao)}</span>
                          {msg.dataArquivamento && (
                            <span className="text-xs text-orange-600">
                              Arquivado: {formatarData(msg.dataArquivamento)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <ActionButton
                            icon={Eye}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onVisualizar(msg);
                            }}
                            tooltip="Visualizar detalhes"
                            className="hover:bg-blue-100 hover:text-blue-700"
                          />
                          
                          {onArquivar && (
                            <ActionButton
                              icon={Archive}
                              onClick={(e) => {
                                e.stopPropagation();
                                onArquivar(msg);
                              }}
                              tooltip="Arquivar mensagem"
                              className="hover:bg-red-100 hover:text-red-700"
                            />
                          )}
                          
                          {onMigrar && (
                            <ActionButton
                              icon={Move}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onMigrar(msg);
                              }}
                              tooltip="Migrar categoria"
                              className="hover:bg-purple-100 hover:text-purple-700"
                            />
                          )}
                          
                          {onDesarquivar && (
                            <ActionButton
                              icon={Undo2}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDesarquivar(msg);
                              }}
                              tooltip="Desarquivar"
                              className="hover:bg-green-100 hover:text-green-700"
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}