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
import { Download, Star, ThumbsUp, MessageCircle, User } from 'lucide-react';
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
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ThumbsUp className="h-5 w-5 text-blue-500" />
                        Card de Avaliação
                    </DialogTitle>
                    <DialogDescription>
                        Prévia do card que será gerado como imagem PNG.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 flex justify-center">
                    <div
                        ref={cardRef}
                        className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-xl overflow-hidden shadow-lg"
                        style={{ width: '550px', height: '400px', border: '2px solid #e5e7eb' }}
                    >
                        {/* Logo D-TAXI */}
                        <div className="absolute top-6 right-6">
                            <div className="rounded-lg p-0 shadow-sm">
                                <img
                                    src="/logo.png"
                                    alt="D-TAXI Logo"
                                    className="h-14 w-auto"
                                />
                            </div>
                        </div>

                        {/* Cabeçalho com avaliação */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="flex items-center justify-center space-x-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-7 w-7 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                                ))}
                            </div>
                            <h2 className="text-2xl font-bold text-blue-600 mb-1">
                                Nova avaliação
                            </h2>
                        </div>

                        {/* Mensagem do passageiro */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-6 shadow-md border border-white/50">
                            <div className="flex items-start mb-3">
                                <MessageCircle className="h-4 w-4 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                <p className="text-sm font-semibold text-gray-700">Mensagem do passageiro:</p>
                            </div>
                            <p className="text-lg italic text-gray-700 pl-8 leading-relaxed font-medium">
                                "{safeData.message}"
                            </p>
                        </div>

                        {/* Informações do motorista e data */}
                        <div className="flex justify-between items-end">
                            {/* Informações do motorista */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/50">
                                <p className="text-xs text-gray-500 mb-1">Unidade:</p>
                                <p className="text-2xl font-bold text-blue-600">{safeData.driverCode}</p>
                            </div>

                            {/* Nome do passageiro com destaque */}
                            <div className="text-right">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg transform -rotate-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="h-4 w-4" />
                                        <span className="text-xs font-medium opacity-90">Avaliado por:</span>
                                    </div>
                                    <p className="text-xl font-bold tracking-wide">{safeData.passengerName}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {format(safeData.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </div>

                        {/* Decoração de fundo */}
                        <div className="absolute -bottom-12 -left-12 opacity-5">
                            <ThumbsUp className="h-48 w-48 text-blue-500 transform rotate-12" />
                        </div>
                        
                        {/* Padrão decorativo */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"></div>
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