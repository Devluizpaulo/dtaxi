import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import { FaStar, FaTrophy, FaChartLine, FaEye, FaHeart } from 'react-icons/fa';

interface SatisfactionChartsProps {
  distEstrelas: any[];
  evolucaoMedia: any[];
  pesquisasPeriodo: any[];
}

const SatisfactionCharts: React.FC<SatisfactionChartsProps> = ({ 
  distEstrelas, 
  evolucaoMedia, 
  pesquisasPeriodo 
}) => {
  const [activeChart, setActiveChart] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cores gradientes personalizadas
  const gradientColors = {
    excellent: ['#10b981', '#059669'],
    good: ['#f59e0b', '#d97706'],
    average: ['#f97316', '#ea580c'],
    poor: ['#ef4444', '#dc2626'],
    primary: ['#1976d2', '#1565c0'],
    secondary: ['#9c27b0', '#7b1fa2']
  };

  // Dados para o gráfico radar de performance
  const radarData = [
    { subject: 'Atendimento', A: 4.2, B: 3.8, fullMark: 5 },
    { subject: 'Limpeza', A: 4.5, B: 4.1, fullMark: 5 },
    { subject: 'Conservação', A: 4.0, B: 3.9, fullMark: 5 },
    { subject: 'Tempo', A: 3.8, B: 3.5, fullMark: 5 },
    { subject: 'Cordialidade', A: 4.3, B: 4.0, fullMark: 5 }
  ];

  // Tooltip customizado com animação
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Dados para gráfico de satisfação por período
  const satisfactionTrend = evolucaoMedia.map((item, index) => ({
    ...item,
    trend: index > 0 ? (item.media > evolucaoMedia[index - 1].media ? 'up' : 'down') : 'neutral',
    satisfaction: item.media >= 4 ? 'high' : item.media >= 3 ? 'medium' : 'low'
  }));

  return (
    <div className="charts-container">
      {/* Header com estatísticas rápidas */}
      <div className="stats-header">
        <div className="stat-card excellent">
          <div className="stat-icon">
            <FaTrophy />
          </div>
          <div className="stat-content">
            <h3>{pesquisasPeriodo.filter(p => p.media >= 4.5).length}</h3>
            <p>Excelentes</p>
          </div>
        </div>
        <div className="stat-card good">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{pesquisasPeriodo.filter(p => p.media >= 3.5 && p.media < 4.5).length}</h3>
            <p>Boas</p>
          </div>
        </div>
        <div className="stat-card average">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{pesquisasPeriodo.filter(p => p.media >= 2.5 && p.media < 3.5).length}</h3>
            <p>Regulares</p>
          </div>
        </div>
        <div className="stat-card poor">
          <div className="stat-icon">
            <FaEye />
          </div>
          <div className="stat-content">
            <h3>{pesquisasPeriodo.filter(p => p.media < 2.5).length}</h3>
            <p>Ruins</p>
          </div>
        </div>
      </div>

      {/* Grid principal de gráficos */}
      <div className="charts-grid">
        {/* Gráfico de barras 3D com gradiente */}
        <div 
          className={`chart-card ${activeChart === 'bars' ? 'active' : ''}`}
          onMouseEnter={() => setActiveChart('bars')}
          onMouseLeave={() => setActiveChart(null)}
        >
          <div className="chart-header">
            <h3>Distribuição de Estrelas</h3>
            <div className="chart-subtitle">Análise detalhada por classificação</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distEstrelas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="estrela" 
                tickFormatter={e => `${e}★`}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="quantidade" 
                fill="url(#barGradient1)"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationBegin={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de área com gradiente */}
        <div 
          className={`chart-card ${activeChart === 'area' ? 'active' : ''}`}
          onMouseEnter={() => setActiveChart('area')}
          onMouseLeave={() => setActiveChart(null)}
        >
          <div className="chart-header">
            <h3>Evolução da Satisfação</h3>
            <div className="chart-subtitle">Tendência temporal com previsão</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={satisfactionTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1976d2" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#1976d2" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="data" 
                tickFormatter={d => d.slice(5, 10)}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                domain={[1, 5]}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={4} stroke="#10b981" strokeDasharray="5 5" label="Meta" />
              <Area 
                type="monotone" 
                dataKey="media" 
                stroke="#1976d2" 
                strokeWidth={3}
                fill="url(#areaGradient)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico Radar de Performance */}
        <div 
          className={`chart-card ${activeChart === 'radar' ? 'active' : ''}`}
          onMouseEnter={() => setActiveChart('radar')}
          onMouseLeave={() => setActiveChart(null)}
        >
          <div className="chart-header">
            <h3>Performance por Categoria</h3>
            <div className="chart-subtitle">Análise multidimensional</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#6b7280', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 5]} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Radar
                name="Atual"
                dataKey="A"
                stroke="#1976d2"
                fill="#1976d2"
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={1500}
              />
              <Radar
                name="Anterior"
                dataKey="B"
                stroke="#9c27b0"
                fill="#9c27b0"
                fillOpacity={0.2}
                strokeWidth={2}
                animationDuration={1500}
                animationBegin={500}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza Interativo */}
        <div 
          className={`chart-card ${activeChart === 'pie' ? 'active' : ''}`}
          onMouseEnter={() => setActiveChart('pie')}
          onMouseLeave={() => setActiveChart(null)}
        >
          <div className="chart-header">
            <h3>Distribuição de Feedback</h3>
            <div className="chart-subtitle">Com e sem observações</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1976d2" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#1565c0" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b0bec5" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#90a4ae" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <Pie
                dataKey="value"
                data={[
                  { 
                    name: 'Com Observação', 
                    value: pesquisasPeriodo.filter(p => p.observacoes).length,
                    percentage: Math.round((pesquisasPeriodo.filter(p => p.observacoes).length / pesquisasPeriodo.length) * 100)
                  },
                  { 
                    name: 'Sem Observação', 
                    value: pesquisasPeriodo.length - pesquisasPeriodo.filter(p => p.observacoes).length,
                    percentage: Math.round(((pesquisasPeriodo.length - pesquisasPeriodo.filter(p => p.observacoes).length) / pesquisasPeriodo.length) * 100)
                  }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={5}
                animationDuration={1500}
                label={({ percentage }) => `${percentage}%`}
                labelLine={false}
              >
                <Cell fill="url(#pieGradient1)" />
                <Cell fill="url(#pieGradient2)" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style jsx>{`
        .charts-container {
          padding: 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 16px;
          margin-bottom: 32px;
        }

        .stats-header {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border-left: 4px solid;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .stat-card:hover::before {
          transform: translateX(100%);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.2);
        }

        .stat-card.excellent {
          border-left-color: #10b981;
        }

        .stat-card.good {
          border-left-color: #f59e0b;
        }

        .stat-card.average {
          border-left-color: #f97316;
        }

        .stat-card.poor {
          border-left-color: #ef4444;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }

        .excellent .stat-icon {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .good .stat-icon {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .average .stat-icon {
          background: linear-gradient(135deg, #f97316, #ea580c);
        }

        .poor .stat-icon {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .stat-content h3 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .stat-content p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .chart-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .chart-card:hover::before {
          opacity: 1;
        }

        .chart-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #1976d2;
        }

        .chart-card.active {
          border-color: #1976d2;
          box-shadow: 0 20px 25px -5px rgba(25, 118, 210, 0.2);
        }

        .chart-header {
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .chart-header h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          background: linear-gradient(135deg, #1976d2, #1565c0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .chart-subtitle {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .custom-tooltip {
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tooltip-label {
          margin: 0 0 8px 0;
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .tooltip-value {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .charts-container {
            padding: 16px;
          }

          .stats-header {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-card {
            padding: 16px;
            gap: 12px;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .stat-content h3 {
            font-size: 24px;
          }

          .charts-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .chart-card {
            padding: 16px;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chart-card {
          animation: slideIn 0.6s ease-out;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default SatisfactionCharts;