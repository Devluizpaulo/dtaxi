import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Star, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SatisfactionSummaryCardsProps {
  total: number;
  mediaGeral: string | number;
  percentualObs: number;
  periodo: string;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
  previousData?: {
    total: number;
    mediaGeral: number;
    percentualObs: number;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
  onClick?: () => void;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  description,
  color = 'blue',
  onClick,
  loading = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    green: 'from-green-50 to-green-100 border-green-200 text-green-700',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700'
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300 cursor-pointer group',
        'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        `bg-gradient-to-br ${colorClasses[color]}`,
        isHovered && 'shadow-xl'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700">
            {title}
          </CardTitle>
          <div className={cn(
            'p-2 rounded-lg transition-all duration-300',
            isHovered ? 'bg-white/80 shadow-sm' : 'bg-white/50'
          )}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-gray-600" />
            ) : (
              icon
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className={cn(
              'text-2xl font-bold transition-all duration-300',
              loading && 'animate-pulse'
            )}>
              {loading ? '...' : value}
            </div>
            {trend && trendValue && (
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-xs px-2 py-1 transition-all duration-300',
                  getTrendColor(),
                  isHovered && 'scale-105'
                )}
              >
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  {trendValue}
                </div>
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-600 transition-opacity duration-300">
              {description}
            </p>
          )}
        </div>
      </CardContent>
      
      {/* Efeito de brilho no hover */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
        'transform -skew-x-12 transition-transform duration-700',
        isHovered ? 'translate-x-full' : '-translate-x-full'
      )} />
    </Card>
  );
};

const SatisfactionSummaryCards: React.FC<SatisfactionSummaryCardsProps> = ({ 
  total, 
  mediaGeral, 
  percentualObs, 
  periodo,
  onRefresh,
  onExport,
  loading = false,
  previousData
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Calcular tendências se dados anteriores estiverem disponíveis
  const getTrend = (current: number, previous?: number) => {
    if (!previous) return { trend: 'neutral' as const, value: '' };
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    
    if (diff > 0) return { trend: 'up' as const, value: `+${percentage}%` };
    if (diff < 0) return { trend: 'down' as const, value: `${percentage}%` };
    return { trend: 'neutral' as const, value: '0%' };
  };

  const totalTrend = getTrend(total, previousData?.total);
  const mediaTrend = getTrend(Number(mediaGeral), previousData?.mediaGeral);
  const obsTrend = getTrend(percentualObs, previousData?.percentualObs);

  const handleCardClick = (cardType: string) => {
    setSelectedCard(selectedCard === cardType ? null : cardType);
  };

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Resumo de Satisfação</h3>
          <p className="text-sm text-gray-600">Métricas principais do período selecionado</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              Atualizar
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="transition-all duration-200 hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Grid de cards responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Avaliações"
          value={total.toLocaleString()}
          icon={<BarChart3 className="h-4 w-4" />}
          trend={totalTrend.trend}
          trendValue={totalTrend.value}
          description="Avaliações coletadas"
          color="blue"
          onClick={() => handleCardClick('total')}
          loading={loading}
        />
        
        <MetricCard
          title="Média Geral"
          value={typeof mediaGeral === 'number' ? mediaGeral.toFixed(2) : mediaGeral}
          icon={<Star className="h-4 w-4" />}
          trend={mediaTrend.trend}
          trendValue={mediaTrend.value}
          description="Nota média das avaliações"
          color="green"
          onClick={() => handleCardClick('media')}
          loading={loading}
        />
        
        <MetricCard
          title="Com Observação"
          value={`${percentualObs}%`}
          icon={<MessageSquare className="h-4 w-4" />}
          trend={obsTrend.trend}
          trendValue={obsTrend.value}
          description="Avaliações com comentários"
          color="yellow"
          onClick={() => handleCardClick('obs')}
          loading={loading}
        />
        
        <MetricCard
          title="Período"
          value={periodo}
          icon={<Calendar className="h-4 w-4" />}
          description="Período de análise"
          color="purple"
          onClick={() => handleCardClick('periodo')}
          loading={loading}
        />
      </div>

      {/* Informações detalhadas do card selecionado */}
      {selectedCard && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 transition-all duration-300">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  {selectedCard === 'total' && 'Detalhes das Avaliações'}
                  {selectedCard === 'media' && 'Sobre a Média Geral'}
                  {selectedCard === 'obs' && 'Avaliações com Observações'}
                  {selectedCard === 'periodo' && 'Informações do Período'}
                </h4>
                <p className="text-sm text-blue-700">
                  {selectedCard === 'total' && 'Este número representa o total de avaliações coletadas no período selecionado. Inclui todas as avaliações válidas registradas no sistema.'}
                  {selectedCard === 'media' && 'A média geral é calculada com base em todas as notas válidas do período. Valores mais altos indicam maior satisfação dos usuários.'}
                  {selectedCard === 'obs' && 'Percentual de avaliações que incluem comentários ou observações dos usuários. Feedback qualitativo valioso para melhorias.'}
                  {selectedCard === 'periodo' && 'Período de tempo considerado para o cálculo das métricas apresentadas. Os dados são atualizados em tempo real.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SatisfactionSummaryCards;