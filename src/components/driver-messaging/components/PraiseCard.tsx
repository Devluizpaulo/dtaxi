import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Calendar,
    Star,
    SendHorizontal,
    Heart,
    CheckCircle,
    Clock,
    Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
interface Praise {
    driverName: string;
    driverCode: string;
    isProcessed: boolean;
    message: string;
    date: Date;
    passengerName: string;
}

interface PraiseCardProps {
    praise: Praise;
    onSendClick: (praise: Praise) => void;
    onDetailsClick: (praise: Praise) => void;
    onCardPreviewClick: (praise: Praise) => void;
}

export const PraiseCard: React.FC<PraiseCardProps> = ({
    praise,
    onSendClick,
    onDetailsClick,
    onCardPreviewClick
}) => {
    return (
        <Card
            className={cn(
                "group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-0 shadow-lg",
                praise.isProcessed
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-400"
                    : "bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-400"
            )}
            onClick={() => onDetailsClick(praise)}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-full shadow-sm transition-colors",
                            praise.isProcessed ? "bg-green-100" : "bg-blue-100"
                        )}>
                            <User className={cn(
                                "h-5 w-5",
                                praise.isProcessed ? "text-green-600" : "text-blue-600"
                            )} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">
                                Unidade: {praise.driverCode}
                            </p>
                        </div>
                    </div>
                    {praise.isProcessed ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 shadow-sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enviado
                        </Badge>
                    ) : (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 shadow-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                {/* Estrelas de avaliação */}
                <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Heart className="h-4 w-4 text-red-400 ml-1" />
                </div>

                {/* Mensagem do elogio */}
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg mb-4 border border-white/50 shadow-sm">
                    <p className="text-gray-700 italic text-sm leading-relaxed line-clamp-3">
                        "{praise.message}"
                    </p>
                </div>

                {/* Informações do passageiro e data */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                        {format(praise.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    <div className="flex items-center text-xs text-gray-700 font-medium">
                        <User className="h-3 w-3 mr-2 text-gray-400" />
                        {praise.passengerName}
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs bg-white/50 hover:bg-white border-gray-200 hover:border-gray-300 transition-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onCardPreviewClick(praise);
                        }}
                    >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Card
                    </Button>
                    <Button
                        size="sm"
                        className={cn(
                            "flex-1 h-8 text-xs transition-all shadow-sm",
                            praise.isProcessed
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSendClick(praise);
                        }}
                    >
                        <SendHorizontal className="h-3 w-3 mr-1" />
                        {praise.isProcessed ? 'Reenviar' : 'Enviar'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};