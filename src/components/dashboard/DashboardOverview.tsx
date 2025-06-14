import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, BarChart2, PlusCircle, FileText, Settings, Download, HelpCircle, AlertCircle, Archive, Users, Car, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { collection, query, orderBy, limit, getDocs, Timestamp, onSnapshot, QuerySnapshot, DocumentData, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow, format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Interfaces
interface DashboardStats {
  totalDrivers: number;
  activeDrivers: number;
  totalMessages: number;
  unreadMessages: number;
  totalRatings: number;
  averageRating: number;
  totalComplaints: number;
  pendingComplaints: number;
  totalSurveys: number;
  completedToday: number;
  ratingsDistribution: number[];
  weeklyTrends: number[];
}

interface RecentActivity {
  id: string;
  type: 'rating' | 'message' | 'complaint' | 'survey';
  user: {
    name: string;
    initials: string;
  };
  content: string;
  timestamp: Timestamp;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'resolved' | 'in_progress';
}

// Custom Hooks
const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDrivers: 0,
    activeDrivers: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalRatings: 0,
    averageRating: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    totalSurveys: 0,
    completedToday: 0,
    ratingsDistribution: [0, 0, 0, 0, 0],
    weeklyTrends: [0, 0, 0, 0, 0, 0, 0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar estatísticas em paralelo
        const [driversSnap, messagesSnap, ratingsSnap, complaintsSnap, surveysSnap] = await Promise.all([
          getDocs(collection(db, 'drivers')),
          getDocs(collection(db, 'mensagens')),
          getDocs(collection(db, 'avaliacoes')),
          getDocs(collection(db, 'reclamacoes')),
          getDocs(collection(db, 'pesquisas'))
        ]);

        // Calcular estatísticas
        const drivers = driversSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const messages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const ratings = ratingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const complaints = complaintsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const surveys = surveysSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const today = new Date();
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        // Calcular distribuição de avaliações
        const ratingsDistribution = [0, 0, 0, 0, 0];
        const totalRatingSum = 0;

        ratings.forEach((rating: any) => {
          const nota = rating.nota || rating.rating || 0;
        });

        // ✅ Solução
        interface Rating {
          id: string;
          nota?: number;
          rating?: number;
          timestamp: Timestamp;
          userId: string;
        }

        ratings.forEach((rating: Rating) => {
          const nota = rating.nota || rating.rating || 0;
        });

        // Calcular tendência semanal (últimos 7 dias)
        const weeklyTrends = [0, 0, 0, 0, 0, 0, 0];
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        ratings.forEach((rating: any) => {
          const timestamp = rating.timestamp?.toDate();
          if (timestamp && timestamp >= oneWeekAgo) {
            const dayIndex = timestamp.getDay();
            weeklyTrends[dayIndex]++;
          }
        });

        const newStats: DashboardStats = {
          totalDrivers: drivers.length,
          activeDrivers: drivers.filter((d: any) => d.status === 'ativo' || d.ativo === true).length,
          totalMessages: messages.length,
          unreadMessages: messages.filter((m: any) => !m.read && !m.lida).length,
          totalRatings: ratings.length,
          averageRating: ratings.length > 0 ? totalRatingSum / ratings.length : 0,
          totalComplaints: complaints.length,
          pendingComplaints: complaints.filter((c: any) => c.status === 'pendente' || c.status === 'aberta').length,
          totalSurveys: surveys.length,
          completedToday: surveys.filter((s: any) => {
            const timestamp = s.timestamp?.toDate();
            return timestamp && timestamp >= startToday && timestamp <= endToday;
          }).length,
          ratingsDistribution,
          weeklyTrends
        };

        setStats(newStats);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setError('Erro ao carregar estatísticas do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
};

const useRecentActivity = () => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    try {
      setLoading(true);

      // Escutar mudanças em tempo real
      const collections = [
        { name: 'avaliacoes', type: 'rating' as const },
        { name: 'mensagens', type: 'message' as const },
        { name: 'reclamacoes', type: 'complaint' as const },
        { name: 'pesquisas', type: 'survey' as const }
      ];

      collections.forEach(({ name, type }) => {
        const q = query(
          collection(db, name),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newActivities = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              type,
              user: {
                name: data.nomeUsuario || data.userName || data.nome || 'Usuário Anônimo',
                initials: (data.nomeUsuario || data.userName || data.nome || 'UA').substring(0, 2).toUpperCase()
              },
              content: data.comentario || data.mensagem || data.descricao || data.conteudo || 'Sem conteúdo',
              timestamp: data.timestamp || Timestamp.now(),
              priority: data.prioridade || data.priority || 'medium',
              status: data.status || 'pending'
            };
          }) as RecentActivity[];

          setActivities(prev => {
            const filtered = prev.filter(a => a.type !== type);
            return [...filtered, ...newActivities]
              .sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime())
              .slice(0, 20);
          });
        }, (error) => {
          console.error(`Erro ao escutar ${name}:`, error);
        });

        unsubscribes.push(unsubscribe);
      });

      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      setError('Erro ao carregar atividades recentes');
      setLoading(false);
    }

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  return { activities, loading, error };
};

// Componentes
const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
}> = ({ title, value, subtitle, icon, trend, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    green: 'from-green-50 to-green-100 border-green-200 text-green-700',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700',
    red: 'from-red-50 to-red-100 border-red-200 text-red-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700'
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105',
        `bg-gradient-to-br ${colorClasses[color]}`
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center mt-2 text-sm',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className="text-4xl opacity-80">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityCard: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'rating': return <Star className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'complaint': return <AlertCircle className="h-4 w-4" />;
      case 'survey': return <BarChart2 className="h-4 w-4" />;
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'rating': return 'text-yellow-600 bg-yellow-100';
      case 'message': return 'text-blue-600 bg-blue-100';
      case 'complaint': return 'text-red-600 bg-red-100';
      case 'survey': return 'text-green-600 bg-green-100';
    }
  };

  const getPriorityColor = () => {
    switch (activity.priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 border-l-4 rounded-r-lg bg-white hover:bg-gray-50 transition-colors',
      getPriorityColor()
    )}>
      <div className={cn(
        'p-2 rounded-full',
        getActivityColor()
      )}>
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm text-gray-900">{activity.user.name}</p>
          {activity.status && (
            <Badge variant="outline" className="text-xs">
              {activity.status === 'pending' && 'Pendente'}
              {activity.status === 'resolved' && 'Resolvido'}
              {activity.status === 'in_progress' && 'Em andamento'}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{activity.content}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { activities, loading: activitiesLoading, error: activitiesError } = useRecentActivity();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Dados para gráficos usando dados reais
  const chartData = {
    ratings: {
      labels: ['1★', '2★', '3★', '4★', '5★'],
      datasets: [{
        data: stats.ratingsDistribution,
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
        borderWidth: 0
      }]
    },
    trends: {
      labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      datasets: [{
        label: 'Avaliações',
        data: stats.weeklyTrends,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    }
  };

  // Função para formatar a avaliação média
  const formatAverageRating = (rating: number) => {
    if (rating === 0) return '0.0';
    return rating.toFixed(1);
  };

  // Função para obter a cor da avaliação
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'green';
    if (rating >= 4.0) return 'yellow';
    if (rating >= 3.0) return 'yellow';
    return 'red';
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Carregando...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erro ao carregar dados</span>
            </div>
            <p className="text-red-600 mt-2">{statsError}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo de volta! Aqui está um resumo das atividades de hoje.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-500">Sistema Online</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <Download className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="flex gap-2">
        {[
          { key: 'today', label: 'Hoje' },
          { key: 'week', label: 'Esta Semana' },
          { key: 'month', label: 'Este Mês' }
        ].map(period => (
          <Button
            key={period.key}
            variant={selectedPeriod === period.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period.key as any)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Motoristas Ativos"
          value={stats.activeDrivers}
          subtitle={`${stats.totalDrivers} total`}
          icon={<Users />}
          color="blue"
          onClick={() => navigate('/dashboard/drivers')}
        />
        <StatCard
          title="Avaliação Média Geral"
          value={formatAverageRating(stats.averageRating)}
          subtitle={`${stats.totalRatings} avaliações`}
          icon={<Star />}
          color={getRatingColor(stats.averageRating)}
          trend={{ value: 5.2, isPositive: stats.averageRating >= 4.0 }}
          onClick={() => navigate('/dashboard/satisfacao')}
        />
        <StatCard
          title="Mensagens Pendentes"
          value={stats.unreadMessages}
          subtitle={`${stats.totalMessages} total`}
          icon={<MessageSquare />}
          color={stats.unreadMessages > 10 ? 'red' : 'green'}
          onClick={() => navigate('/dashboard/mensagens')}
        />
        <StatCard
          title="Reclamações Abertas"
          value={stats.pendingComplaints}
          subtitle={`${stats.totalComplaints} total`}
          icon={<AlertCircle />}
          color={stats.pendingComplaints > 5 ? 'red' : 'green'}
          onClick={() => navigate('/dashboard/reclamacoes')}
        />
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse rapidamente as funcionalidades mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => navigate('/dashboard/satisfacao')}>
              <PlusCircle className="h-6 w-6 text-green-600" />
              <span className="text-xs">Nova Avaliação</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => navigate('/dashboard/mensagens')}>
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <span className="text-xs">Mensagens</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => navigate('/dashboard/drivers')}>
              <Car className="h-6 w-6 text-purple-600" />
              <span className="text-xs">Motoristas</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => navigate('/dashboard/reclamacoes')}>
              <AlertCircle className="h-6 w-6 text-red-600" />
              <span className="text-xs">Reclamações</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => alert('Gerar relatório!')}>
              <FileText className="h-6 w-6 text-indigo-600" />
              <span className="text-xs">Relatórios</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20" onClick={() => navigate('/dashboard/configuracoes')}>
              <Settings className="h-6 w-6 text-gray-600" />
              <span className="text-xs">Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição de Avaliações */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Avaliações</CardTitle>
            <CardDescription>Últimas 100 avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut
                data={chartData.ratings}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tendência Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência Semanal</CardTitle>
            <CardDescription>Avaliações por dia da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={chartData.trends}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas interações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {activitiesLoading ? (
                <div className="p-6 text-center text-gray-500">Carregando atividades...</div>
              ) : activities.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Nenhuma atividade recente</div>
              ) : (
                <div className="space-y-1">
                  {activities.slice(0, 10).map(activity => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
            {activities.length > 10 && (
              <div className="p-4 border-t">
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/dashboard/atividades')}>
                  Ver todas as atividades
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Notificações */}
      {(stats.pendingComplaints > 5 || stats.unreadMessages > 20) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.pendingComplaints > 5 && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm">Você tem {stats.pendingComplaints} reclamações pendentes</span>
                  <Button size="sm" onClick={() => navigate('/dashboard/reclamacoes?status=pendente')}>
                    Revisar
                  </Button>
                </div>
              )}
              {stats.unreadMessages > 20 && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm">Você tem {stats.unreadMessages} mensagens não lidas</span>
                  <Button size="sm" onClick={() => navigate('/dashboard/mensagens?status=nao-lida')}>
                    Ver Mensagens
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links Rápidos */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard/satisfacao')}>
          <Eye className="h-4 w-4 mr-2" />
          Ver Todas as Avaliações
        </Button>
        <Button variant="outline" onClick={() => navigate('/dashboard/mensagens')}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Gerenciar Mensagens
        </Button>
        <Button variant="outline" onClick={() => navigate('/dashboard/drivers')}>
          <Users className="h-4 w-4 mr-2" />
          Gerenciar Motoristas
        </Button>
        <Button onClick={() => navigate('/dashboard/relatorios')}>
          <FileText className="h-4 w-4 mr-2" />
          Gerar Relatório Completo
        </Button>
      </div>
    </div>
  );
};

export default DashboardOverview;