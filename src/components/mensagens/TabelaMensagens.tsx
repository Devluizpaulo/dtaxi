import { Mensagem } from '@/services/firebaseService';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/utils/formatarData';
import { Eye, Archive, Move, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const tipoColors: Record<string, string> = {
  reclamacao: 'border-red-500 bg-red-50',
  sugestao: 'border-purple-500 bg-purple-50',
  informacao: 'border-blue-500 bg-blue-50',
  elogio: 'border-green-500 bg-green-50',
  outro: 'border-gray-400 bg-gray-50',
};

export default function TabelaMensagens({ mensagens, onVisualizar, onArquivar, onMigrar, onDesarquivar }: {
  mensagens: Mensagem[];
  onVisualizar: (msg: Mensagem) => void;
  onArquivar?: (msg: Mensagem) => void;
  onMigrar?: (msg: Mensagem) => void;
  onDesarquivar?: (msg: Mensagem) => void;
}) {
  return (
    <div className="space-y-4">
      <TooltipProvider>
        {mensagens.length === 0 && (
          <div className="text-center text-gray-400 py-12">Nenhuma mensagem encontrada.</div>
        )}
        {mensagens.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 p-4 rounded-xl shadow-md border-l-8 bg-white hover:shadow-lg transition-all group ${tipoColors[msg.tipo?.toLowerCase() || 'outro'] || 'border-gray-300 bg-gray-50'}`}
          >
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs text-gray-500">{msg.protocolo}</span>
                <Badge className={tipoColors[msg.tipo?.toLowerCase() || 'outro'].replace('border-', 'bg-') + ' text-xs font-semibold'}>
                  {msg.tipo}
                </Badge>
                <span className="text-gray-700 font-medium">{msg.nome}</span>
                <span className="text-gray-400 text-xs">{msg.prefixo}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span>Data: {formatarData(msg.dataCriacao)}</span>
                {msg.dataArquivamento && <span>Arquivado em: {formatarData(msg.dataArquivamento)}</span>}
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => onVisualizar(msg)} className="hover:bg-taxi-green/20">
                    <Eye className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Visualizar</TooltipContent>
              </Tooltip>
              {onArquivar && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => onArquivar(msg)} className="hover:bg-red-100">
                      <Archive className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Arquivar</TooltipContent>
                </Tooltip>
              )}
              {onMigrar && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => onMigrar(msg)} className="hover:bg-purple-100">
                      <Move className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Migrar</TooltipContent>
                </Tooltip>
              )}
              {onDesarquivar && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => onDesarquivar(msg)} className="hover:bg-blue-100">
                      <Undo2 className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desarquivar</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </TooltipProvider>
    </div>
  );
} 