
import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Calendar as CalendarIcon } from 'lucide-react';

interface ReportData {
  satisfactionData: any[];
  reclamationsData: any[];
}

interface SatisfactionReportProps {
  data: ReportData;
  isLoading: boolean;
}

const SatisfactionReport = ({ data, isLoading }: SatisfactionReportProps) => {
  const { toast } = useToast();
  const [reportType, setReportType] = React.useState('monthly');
  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [endDate, setEndDate] = React.useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [activeCalendar, setActiveCalendar] = React.useState<'start' | 'end'>('start');
  
  const getReportTitle = () => {
    switch(reportType) {
      case 'monthly':
        return `Relatório Mensal de Satisfação - ${format(startDate, 'MMMM yyyy', { locale: ptBR })}`;
      case 'quarterly':
        return `Relatório Trimestral de Satisfação - ${format(startDate, 'MMM', { locale: ptBR })} a ${format(endDate, 'MMM yyyy', { locale: ptBR })}`;
      case 'biannual':
        return `Relatório Semestral de Satisfação - ${format(startDate, 'MMM', { locale: ptBR })} a ${format(endDate, 'MMM yyyy', { locale: ptBR })}`;
      case 'annual':
        return `Relatório Anual de Satisfação - ${format(startDate, 'yyyy')}`;
      default:
        return 'Relatório de Satisfação';
    }
  };
  
  const generateReport = () => {
    if (isLoading || !data.satisfactionData.length) {
      toast({
        title: "Dados insuficientes",
        description: "Aguarde o carregamento dos dados ou verifique se existem dados para o período selecionado.",
        variant: "destructive",
      });
      return;
    }
    
    // Setup dates
    let reportStartDate = new Date(startDate);
    let reportEndDate = new Date(endDate);
    
    // Adjust dates based on report type
    if (reportType === 'monthly') {
      reportStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      reportEndDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    } else if (reportType === 'annual') {
      reportStartDate = new Date(startDate.getFullYear(), 0, 1);
      reportEndDate = new Date(startDate.getFullYear(), 11, 31);
    }
    
    // Filter data for the selected period
    const filteredSatisfactionData = data.satisfactionData.filter((item: any) => {
      if (!item.date) return false;
      const itemDate = item.date instanceof Date ? item.date : new Date(item.date);
      return itemDate >= reportStartDate && itemDate <= reportEndDate;
    });
    
    const filteredReclamationsData = data.reclamationsData.filter((item: any) => {
      if (!item.dataEnvio) return false;
      const itemDate = item.dataEnvio instanceof Date ? item.dataEnvio : new Date(item.dataEnvio);
      return itemDate >= reportStartDate && itemDate <= reportEndDate;
    });
    
    // Calculate summary stats
    const totalFeedback = filteredSatisfactionData.length;
    const totalReclamations = filteredReclamationsData.length;
    const averageRating = filteredSatisfactionData.reduce((acc, item) => acc + (item.media || 0), 0) / 
      (filteredSatisfactionData.length || 1);
    
    // Count ratings distribution
    const ratings = { "1★": 0, "2★": 0, "3★": 0, "4★": 0, "5★": 0 };
    filteredSatisfactionData.forEach((item: any) => {
      const media = item.media || 0;
      if (media < 2) ratings["1★"]++;
      else if (media < 3) ratings["2★"]++;
      else if (media < 4) ratings["3★"]++;
      else if (media < 4.5) ratings["4★"]++;
      else ratings["5★"]++;
    });
    
    // Count feedback types
    const feedbackTypes = {
      elogios: filteredReclamationsData.filter((item: any) => 
        item.tipo?.toLowerCase().includes('elogio')).length,
      reclamacoes: filteredReclamationsData.filter((item: any) => 
        item.tipo?.toLowerCase().includes('reclama')).length,
      duvidas: filteredReclamationsData.filter((item: any) => 
        item.tipo?.toLowerCase().includes('dúvida') || item.tipo?.toLowerCase().includes('duvida')).length,
      sugestoes: filteredReclamationsData.filter((item: any) => 
        item.tipo?.toLowerCase().includes('sugestão') || item.tipo?.toLowerCase().includes('sugestao')).length
    };
    
    // Generate PDF
    const doc = new jsPDF();
    
    // Add title
    const title = getReportTitle();
    doc.setFontSize(18);
    doc.text(title, 105, 15, { align: 'center' });
    
    // Add D-TAXI logo (you'd need to replace with actual logo)
    doc.setFontSize(10);
    doc.text("D-TAXI", 105, 10, { align: 'center' });
    
    // Add report period
    doc.setFontSize(12);
    doc.text(`Período: ${format(reportStartDate, 'dd/MM/yyyy')} a ${format(reportEndDate, 'dd/MM/yyyy')}`, 105, 25, { align: 'center' });
    
    // Add summary statistics
    doc.setFontSize(14);
    doc.text("Resumo", 14, 35);
    
    doc.setFontSize(10);
    doc.text(`Total de avaliações: ${totalFeedback}`, 14, 45);
    doc.text(`Avaliação média: ${averageRating.toFixed(2)}`, 14, 50);
    doc.text(`Total de feedback: ${totalReclamations}`, 14, 55);
    
    // Add ratings distribution table
    doc.setFontSize(14);
    doc.text("Distribuição de Avaliações", 14, 70);
    
    const ratingsData = Object.entries(ratings).map(([rating, count]) => [
      rating, count, `${((count / totalFeedback) * 100).toFixed(0)}%`
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['Classificação', 'Quantidade', 'Percentual']],
      body: ratingsData,
      theme: 'grid'
    });
    
    // Fix: Store the final Y position after the first table
    const firstTableEndY = (doc as any).lastAutoTable.finalY;
    
    // Add feedback types table
    doc.setFontSize(14);
    doc.text("Tipos de Feedback", 14, firstTableEndY + 15);
    
    const typesData = [
      ['Elogios', feedbackTypes.elogios, `${((feedbackTypes.elogios / totalReclamations) * 100).toFixed(0)}%`],
      ['Reclamações', feedbackTypes.reclamacoes, `${((feedbackTypes.reclamacoes / totalReclamations) * 100).toFixed(0)}%`],
      ['Dúvidas', feedbackTypes.duvidas, `${((feedbackTypes.duvidas / totalReclamations) * 100).toFixed(0)}%`],
      ['Sugestões', feedbackTypes.sugestoes, `${((feedbackTypes.sugestoes / totalReclamations) * 100).toFixed(0)}%`]
    ];
    
    autoTable(doc, {
      startY: firstTableEndY + 20,
      head: [['Tipo', 'Quantidade', 'Percentual']],
      body: typesData,
      theme: 'grid'
    });
    
    // Fix: Store the final Y position after the second table
    const secondTableEndY = (doc as any).lastAutoTable.finalY;
    
    // Add recent feedback
    doc.setFontSize(14);
    doc.text("Feedback Recentes", 14, secondTableEndY + 15);
    
    const recentFeedback = [...filteredReclamationsData]
      .sort((a, b) => {
        const dateA = a.dataEnvio instanceof Date ? a.dataEnvio : new Date(a.dataEnvio);
        const dateB = b.dataEnvio instanceof Date ? b.dataEnvio : new Date(b.dataEnvio);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5)
      .map(item => [
        format(item.dataEnvio instanceof Date ? item.dataEnvio : new Date(item.dataEnvio), 'dd/MM/yyyy'),
        item.nome,
        item.tipo,
        item.mensagem.substring(0, 50) + (item.mensagem.length > 50 ? '...' : '')
      ]);
    
    autoTable(doc, {
      startY: secondTableEndY + 20,
      head: [['Data', 'Cliente', 'Tipo', 'Mensagem']],
      body: recentFeedback,
      theme: 'grid',
      styles: { overflow: 'linebreak', cellWidth: 'auto' },
      columnStyles: { 3: { cellWidth: 80 } }
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount} - Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        105, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`${title.replace(/\s/g, '_')}.pdf`);
    
    toast({
      title: "Relatório gerado",
      description: "O relatório em PDF foi gerado com sucesso!",
    });
  };
  
  const handleReportTypeChange = (value: string) => {
    setReportType(value);
    
    const now = new Date();
    
    switch(value) {
      case 'monthly':
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        setStartDate(new Date(now.getFullYear(), quarter * 3, 1));
        setEndDate(new Date(now.getFullYear(), quarter * 3 + 3, 0));
        break;
      case 'biannual':
        const semester = Math.floor(now.getMonth() / 6);
        setStartDate(new Date(now.getFullYear(), semester * 6, 1));
        setEndDate(new Date(now.getFullYear(), semester * 6 + 6, 0));
        break;
      case 'annual':
        setStartDate(new Date(now.getFullYear(), 0, 1));
        setEndDate(new Date(now.getFullYear(), 11, 31));
        break;
    }
  };
  
  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (activeCalendar === 'start') {
      setStartDate(date);
      // If start date is after end date, update end date
      if (date > endDate) {
        setEndDate(date);
      }
      setActiveCalendar('end');
    } else {
      setEndDate(date);
      setDatePickerOpen(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Gerar Relatório
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerar Relatório de Satisfação</DialogTitle>
          <DialogDescription>
            Escolha o tipo de relatório e o período desejado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Relatório</label>
            <Select 
              value={reportType} 
              onValueChange={handleReportTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="biannual">Semestral</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <div className="flex gap-2">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={activeCalendar === 'start' ? startDate : endDate}
                    onSelect={handleCalendarSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-sm text-muted-foreground">
              {getReportTitle()}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={generateReport} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SatisfactionReport;
