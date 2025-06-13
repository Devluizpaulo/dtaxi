import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Filter, 
  X, 
  Archive, 
  Star,
  Download,
  BarChart2,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Estender a interface do jsPDF
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface Pesquisa {
  id: string;
  rating: number;
  comment: string;
  date: string;
  type: 'elogio' | 'reclamacao' | 'duvida' | 'neutro';
  name: string;
  contact: string;
  email: string;
  contactRequested: boolean;
  status: string;
  protocol?: string;
  prefixoPlaca?: string;
  observacoes?: string;
}

interface Metricas {
  totalPesquisas: number;
  mediaGeral: number;
  totalElogios: number;
  totalReclamacoes: number;
  totalDuvidas: number;
  satisfacaoGeral: number;
  tendenciaMensal: { mes: string; media: number }[];
  distribuicaoTipos: { name: string; value: number }[];
}

function PesquisaItem({ pesquisa }: { pesquisa: Pesquisa }) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-semibold">{pesquisa.name}</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Telefone: {pesquisa.contact}</p>
            <p>Prefixo/Placa: {pesquisa.prefixoPlaca || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="font-medium">{pesquisa.rating.toFixed(2)}</span>
          </div>
          <Badge variant={pesquisa.type === 'elogio' ? 'default' : 
                         pesquisa.type === 'reclamacao' ? 'destructive' : 
                         'secondary'}>
            {pesquisa.type}
          </Badge>
        </div>
      </div>
      
      {pesquisa.observacoes && (
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm font-medium mb-1">Observações:</p>
          <p className="text-sm text-muted-foreground">
            {pesquisa.observacoes}
          </p>
        </div>
      )}
      
      {pesquisa.comment && (
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm font-medium mb-1">Comentário:</p>
          <p className="text-sm text-muted-foreground italic">
            "{pesquisa.comment}"
          </p>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <p>Data: {format(new Date(pesquisa.date), 'dd/MM/yyyy HH:mm')}</p>
        {pesquisa.status && (
          <Badge variant="outline">{pesquisa.status}</Badge>
        )}
      </div>
    </div>
  );
}

export function PesquisasCard() {
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroData, setFiltroData] = useState('');
  const [filtroMelhoresNotas, setFiltroMelhoresNotas] = useState(false);
  const [filtroPioresNotas, setFiltroPioresNotas] = useState(false);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [trimestreAtual, setTrimestreAtual] = useState<number>(Math.ceil(new Date().getMonth() / 3));
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getDocs(collection(db, 'pesquisa_satisfacao'));
        const listaPesquisas: Pesquisa[] = [];
        let somaNotas = 0;
        let totalElogios = 0;
        let totalReclamacoes = 0;
        let totalDuvidas = 0;

        data.forEach((doc) => {
          const pesquisa = { id: doc.id, ...doc.data() } as Pesquisa;
          listaPesquisas.push(pesquisa);
          somaNotas += pesquisa.rating || 0;
          
          switch(pesquisa.type) {
            case 'elogio':
              totalElogios++;
              break;
            case 'reclamacao':
              totalReclamacoes++;
              break;
            case 'duvida':
              totalDuvidas++;
              break;
          }
        });

        // Calcular métricas
        const mediaGeral = listaPesquisas.length > 0 ? somaNotas / listaPesquisas.length : 0;
        const satisfacaoGeral = (totalElogios / listaPesquisas.length) * 100;

        // Agrupar por mês para tendência
        const pesquisasPorMes = listaPesquisas.reduce((acc, pesquisa) => {
          const mes = format(new Date(pesquisa.date), 'MMM/yy');
          if (!acc[mes]) {
            acc[mes] = { soma: 0, count: 0 };
          }
          acc[mes].soma += pesquisa.rating;
          acc[mes].count++;
          return acc;
        }, {} as Record<string, { soma: number; count: number }>);

        const tendenciaMensal = Object.entries(pesquisasPorMes).map(([mes, dados]) => ({
          mes,
          media: dados.soma / dados.count
        }));

        // Distribuição por tipo
        const distribuicaoTipos = [
          { name: 'Elogios', value: totalElogios },
          { name: 'Reclamações', value: totalReclamacoes },
          { name: 'Dúvidas', value: totalDuvidas }
        ];

        setPesquisas(listaPesquisas);
        setMetricas({
          totalPesquisas: listaPesquisas.length,
          mediaGeral,
          totalElogios,
          totalReclamacoes,
          totalDuvidas,
          satisfacaoGeral,
          tendenciaMensal,
          distribuicaoTipos
        });
      } catch (error) {
        console.error('Erro ao obter dados:', error);
        setError('Ocorreu um erro ao obter os dados. Por favor, tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const limparFiltros = () => {
    setFiltroData('');
    setFiltroMelhoresNotas(false);
    setFiltroPioresNotas(false);
  };

  const filtrarPesquisas = () => {
    let pesquisasFiltradas = pesquisas;

    if (filtroData) {
      const dataFiltro = format(new Date(filtroData), 'yyyy-MM-dd');
      pesquisasFiltradas = pesquisasFiltradas.filter(pesquisa => 
        pesquisa.date.startsWith(dataFiltro)
      );
    }

    if (filtroMelhoresNotas) {
      pesquisasFiltradas = pesquisasFiltradas.filter(pesquisa => pesquisa.rating >= 8);
    }

    if (filtroPioresNotas) {
      pesquisasFiltradas = pesquisasFiltradas.filter(pesquisa => pesquisa.rating <= 3);
    }

    return pesquisasFiltradas;
  };

  const getTrimestreInfo = (trimestre: number) => {
    const ano = new Date().getFullYear();
    const meses = {
      1: { inicio: '01/01', fim: '31/03', nome: '1º Trimestre' },
      2: { inicio: '01/04', fim: '30/06', nome: '2º Trimestre' },
      3: { inicio: '01/07', fim: '30/09', nome: '3º Trimestre' },
      4: { inicio: '01/10', fim: '31/12', nome: '4º Trimestre' }
    };
    return {
      ...meses[trimestre as keyof typeof meses],
      ano
    };
  };

  const getPesquisasTrimestre = (trimestre: number) => {
    const { inicio, fim, ano } = getTrimestreInfo(trimestre);
    const dataInicio = new Date(`${ano}/${inicio.split('/').reverse().join('/')}`);
    const dataFim = new Date(`${ano}/${fim.split('/').reverse().join('/')}`);

    return pesquisas.filter(pesquisa => {
      const dataPesquisa = new Date(pesquisa.date);
      return dataPesquisa >= dataInicio && dataPesquisa <= dataFim;
    });
  };

  const calcularMetricasTrimestre = (pesquisasTrimestre: Pesquisa[]) => {
    const total = pesquisasTrimestre.length;
    const media = total > 0 
      ? pesquisasTrimestre.reduce((acc, p) => acc + p.rating, 0) / total 
      : 0;
    
    const distribuicao = {
      elogios: pesquisasTrimestre.filter(p => p.type === 'elogio').length,
      reclamacoes: pesquisasTrimestre.filter(p => p.type === 'reclamacao').length,
      duvidas: pesquisasTrimestre.filter(p => p.type === 'duvida').length,
      neutros: pesquisasTrimestre.filter(p => p.type === 'neutro').length
    };

    return {
      total,
      media,
      distribuicao,
      satisfacao: (distribuicao.elogios / total) * 100
    };
  };

  const gerarRelatorioPDF = () => {
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyyMMdd_HHmmss');
    const { nome, inicio, fim, ano } = getTrimestreInfo(trimestreAtual);
    const pesquisasTrimestre = getPesquisasTrimestre(trimestreAtual);
    const metricas = calcularMetricasTrimestre(pesquisasTrimestre);

    // Criar novo documento PDF
    const doc = new jsPDF();
    let lastY = 50;

    // Configurar fonte e estilo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    
    // Título
    doc.text('Relatório Trimestral de Pesquisas de Satisfação', 14, 20);
    
    // Informações do período
    doc.setFontSize(12);
    doc.text(`${nome} ${ano}`, 14, 30);
    doc.text(`Período: ${inicio} a ${fim}`, 14, 40);
    doc.text(`Data de Geração: ${currentDate.toLocaleDateString('pt-BR')}`, 14, lastY);

    // Métricas Gerais
    doc.setFontSize(14);
    doc.text('Métricas Gerais', 14, lastY + 15);
    
    autoTable(doc, {
      startY: lastY + 20,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Pesquisas', metricas.total.toString()],
        ['Média Geral', metricas.media.toFixed(2)],
        ['Satisfação Geral', `${metricas.satisfacao.toFixed(1)}%`],
        ['Elogios', metricas.distribuicao.elogios.toString()],
        ['Reclamações', metricas.distribuicao.reclamacoes.toString()],
        ['Dúvidas', metricas.distribuicao.duvidas.toString()],
        ['Neutros', metricas.distribuicao.neutros.toString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 }
    });

    lastY = doc.lastAutoTable.finalY;

    // Detalhamento das Pesquisas
    doc.setFontSize(14);
    doc.text('Detalhamento das Pesquisas', 14, lastY + 15);

    autoTable(doc, {
      startY: lastY + 20,
      head: [['Cliente', 'Data', 'Avaliação', 'Tipo', 'Prefixo/Placa', 'Status']],
      body: pesquisasTrimestre.map(pesquisa => [
        pesquisa.name,
        format(new Date(pesquisa.date), 'dd/MM/yyyy HH:mm'),
        pesquisa.rating.toFixed(2),
        pesquisa.type,
        pesquisa.prefixoPlaca || 'N/A',
        pesquisa.status
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });

    lastY = doc.lastAutoTable.finalY;

    // Observações Relevantes
    const observacoes = pesquisasTrimestre
      .filter(p => p.observacoes || p.comment)
      .map(p => `${p.name} (${p.rating.toFixed(2)}): ${p.observacoes || p.comment}`);

    if (observacoes.length > 0) {
      doc.setFontSize(14);
      doc.text('Observações Relevantes', 14, lastY + 15);

      autoTable(doc, {
        startY: lastY + 20,
        body: observacoes.map(obs => [obs]),
        theme: 'grid',
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 170 } }
      });
    }

    // Salvar o PDF
    doc.save(`relatorio_trimestral_${nome}_${ano}_${formattedDate}.pdf`);
  };

  const arquivarPesquisas = async () => {
    try {
      const pesquisasParaArquivar = pesquisas.filter(pesquisa => new Date(pesquisa.date) < new Date());
      for (const pesquisa of pesquisasParaArquivar) {
        await addDoc(collection(db, 'pesquisa_arquivada'), pesquisa);
        await deleteDoc(doc(db, 'pesquisa_satisfacao', pesquisa.id));
      }
      setPesquisas([]);
      alert('Pesquisas arquivadas com sucesso!');
    } catch (error) {
      console.error('Erro ao arquivar pesquisas:', error);
      alert('Ocorreu um erro ao arquivar as pesquisas. Por favor, tente novamente mais tarde.');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Pesquisas de Satisfação
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarArquivadas(!mostrarArquivadas)}
          >
            {mostrarArquivadas ? 'Ocultar Arquivadas' : 'Mostrar Arquivadas'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={gerarRelatorioPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório Trimestral
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="details">Pesquisas Recentes</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Pesquisas
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas?.totalPesquisas}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Média Geral
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas?.mediaGeral.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Satisfação Geral
                  </CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas?.satisfacaoGeral.toFixed(1)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reclamações
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas?.totalReclamacoes}</div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricas?.tendenciaMensal}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="media" fill="#8884d8" name="Média" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metricas?.distribuicaoTipos}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {metricas?.distribuicaoTipos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Label htmlFor="filtroData">Filtrar por Data:</Label>
                <Input
                  type="date"
                  id="filtroData"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filtroMelhoresNotas"
                  checked={filtroMelhoresNotas}
                  onCheckedChange={(checked) => setFiltroMelhoresNotas(checked as boolean)}
                />
                <Label htmlFor="filtroMelhoresNotas">Filtrar Melhores Notas</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filtroPioresNotas"
                  checked={filtroPioresNotas}
                  onCheckedChange={(checked) => setFiltroPioresNotas(checked as boolean)}
                />
                <Label htmlFor="filtroPioresNotas">Filtrar Piores Notas</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={limparFiltros}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={arquivarPesquisas}
              >
                <Archive className="h-4 w-4 mr-2" />
                Arquivar Pesquisas
              </Button>
            </div>

            {/* Lista de Pesquisas */}
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : pesquisas.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Nenhuma pesquisa disponível no momento.
              </div>
            ) : (
              <div className="space-y-4">
                {filtrarPesquisas().map((pesquisa) => (
                  <PesquisaItem key={pesquisa.id} pesquisa={pesquisa} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Satisfação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pontos Fortes</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Alta taxa de satisfação geral: {metricas?.satisfacaoGeral.toFixed(1)}%</li>
                      <li>Total de elogios: {metricas?.totalElogios}</li>
                      <li>Média geral acima do esperado: {metricas?.mediaGeral.toFixed(2)}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pontos de Atenção</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Total de reclamações: {metricas?.totalReclamacoes}</li>
                      <li>Dúvidas pendentes: {metricas?.totalDuvidas}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Recomendações</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Investigar causas das reclamações</li>
                      <li>Melhorar tempo de resposta às dúvidas</li>
                      <li>Manter foco na qualidade do atendimento</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}