import { Mensagem } from '@/services/firebaseService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatarData } from '@/utils/formatarData';
import {
  User,
  Mail,
  Phone,
  Hash,
  Tag,
  Calendar,
  MessageSquare,
  FileText,
  Archive,
  Move,
  Printer,
  CheckCircle,
  Copy,
  MessageCircle,
  Info,
  History,
  CarTaxiFrontIcon,
} from 'lucide-react';
import { FaTaxi } from 'react-icons/fa';

export default function ModalMensagem({ mensagem, open, onClose, onMarcarResolvido, onArquivar, onMigrar, onImprimir }: {
  mensagem: Mensagem | null;
  open: boolean;
  onClose: () => void;
  onMarcarResolvido: (resolucao: string) => void;
  onArquivar: () => void;
  onMigrar: () => void;
  onImprimir: () => void;
}) {
  if (!mensagem) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 sm:p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="w-6 h-6 text-taxi-green" />
            Protocolo: <span className="font-mono text-base sm:text-lg">{mensagem.protocolo}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 p-6 max-h-[70vh] overflow-y-auto">
          {/* Dados da mensagem */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-center gap-2 text-base">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-semibold">{mensagem.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-base">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>{mensagem.email}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" asChild>
                        <a href={`mailto:${mensagem.email}`}>
                          <Mail className="w-4 h-4 text-blue-600" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Responder por e-mail</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(mensagem.email)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar e-mail</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 text-base">
                <Phone className="w-5 h-5 text-gray-500" />
                <span>{mensagem.telefone}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" asChild>
                        <a href={`tel:${mensagem.telefone.replace(/\D/g, '')}`}>
                          <Phone className="w-4 h-4 text-blue-600" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ligar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(mensagem.telefone)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar telefone</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" asChild>
                        <a href={`https://wa.me/55${mensagem.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>WhatsApp</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 text-base">
                <CarTaxiFrontIcon className="w-5 h-5 text-gray-500" />
                <span>Prefixo: <span className="font-mono">{mensagem.prefixo}</span></span>
              </div>
              <div className="flex items-center gap-2 text-base">
                <Hash className="w-5 h-5 text-gray-500" />
                <span>Tipo:</span>
                <Badge className="ml-1 capitalize" variant="outline">{mensagem.tipo}</Badge>
                <div className="flex items-center gap-2 text-base">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Data: {formatarData(mensagem.dataCriacao)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-base">
                <MessageSquare className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <span className="font-semibold">Mensagem:</span>
                  <div className="whitespace-pre-line break-words text-gray-800 bg-gray-50 rounded p-2 mt-1 border max-h-60 text-justify overflow-y-auto">
                    {mensagem.mensagem}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Histórico embaixo */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">Histórico</span>
            </div>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 bg-gray-50 rounded p-2 border">
              {Array.isArray(mensagem.historico) && mensagem.historico.length > 0 ? (
                mensagem.historico.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-taxi-green mt-0.5" />
                    <div>
                      <div className="font-mono text-xs text-gray-500">{formatarData(h.data)}</div>
                      <div className="font-semibold text-gray-700">{h.acao} <span className="text-gray-500 font-normal">por {h.usuario?.nome}</span></div>
                      {h.observacao && <div className="text-gray-600 text-xs mt-1">{h.observacao}</div>}
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Nenhum histórico registrado.</li>
              )}
            </ul>
          </div>
        </div>
        <DialogFooter className="px-6 pb-6 pt-2 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onImprimir} variant="outline">
                  <Printer className="w-4 h-4" /> Imprimir
                </Button>
              </TooltipTrigger>
              <TooltipContent>Imprimir mensagem</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => onMarcarResolvido('Resolvido via painel')} variant="secondary">
                  <CheckCircle className="w-4 h-4" /> Marcar como resolvido
                </Button>
              </TooltipTrigger>
              <TooltipContent>Marcar como resolvido</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onArquivar} variant="ghost">
                  <Archive className="w-4 h-4" /> Arquivar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Arquivar mensagem</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onMigrar} variant="ghost">
                  <Move className="w-4 h-4" /> Migrar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Migrar mensagem</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
