import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Praise {
  driverName: string;
  driverCode: string;
  message: string;
  passengerName: string;
  date: Date;
}

interface PraiseCardPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  praise: Praise | null;
  onGenerateCard: (praise: Praise, cardRef: React.RefObject<HTMLDivElement>) => Promise<void>;
}

export const PraiseCardPreview: React.FC<PraiseCardPreviewProps> = ({
  open,
  onOpenChange,
  praise,
  onGenerateCard
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!praise) return null;

  // Garantir que os dados existam com valores padrão
  const safeData = {
    driverName: praise.driverName || 'Nome não informado',
    driverCode: praise.driverCode || 'Código não informado',
    message: praise.message || 'Mensagem não informada',
    passengerName: praise.passengerName || 'Passageiro não informado',
    date: praise.date || new Date()
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-blue-500" />
            Card de Avaliação
          </DialogTitle>
          <DialogDescription>
            Prévia do card que será gerado como imagem PNG.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4">
          <div 
            ref={cardRef} 
            className="relative bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg overflow-hidden"
            style={{ width: '500px', height: '350px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
          >
            {/* Logo D-TAXI */}
            <div className="absolute top-4 right-4">
              <img 
                src="/logo.png" 
                alt="D-TAXI Logo" 
                className="h-10 w-auto"
              />
            </div>
            
            {/* Cabeçalho com avaliação */}
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <h2 className="text-xl font-semibold text-blue-600">
                Avaliação Positiva
              </h2>
            </div>
            
            {/* Informações do motorista */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-500">Motorista:</p>
                  <p className="text-lg font-bold text-gray-800">{safeData.driverName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Código:</p>
                  <p className="text-lg font-bold text-blue-600">{safeData.driverCode}</p>
                </div>
              </div>
            </div>
            
            {/* Mensagem do passageiro */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-start mb-2">
                <MessageCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <p className="text-sm font-medium text-gray-700">Mensagem do passageiro:</p>
              </div>
              <p className="text-base italic text-gray-600 pl-7">"{safeData.message}"</p>
            </div>
            
            {/* Rodapé com informações */}
            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
              <div>
                <p>Data: {format(safeData.date, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              <div>
                <p>De: {safeData.passengerName}</p>
              </div>
            </div>
            
            {/* Decoração de fundo */}
            <div className="absolute -bottom-10 -right-10 opacity-5">
              <ThumbsUp className="h-40 w-40 text-blue-500" />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button 
            onClick={() => onGenerateCard(praise, cardRef)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar Imagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};