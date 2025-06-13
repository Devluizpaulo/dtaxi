"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, orderBy, where, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import html2pdf from "html2pdf.js";
import { FaEye, FaEyeSlash, FaStar } from "react-icons/fa";
import {
  mask,
  getPeriodo,
  formatarData,
  tipoAvaliacaoDaCampanha,
  notaParaEstrela,
  matrizEstrelas,
  matrizRespostas,
  dadosGraficoBarra,
  renderStars,
  calcularMedia,
  distribuicaoEstrelas
} from '../../lib/utils';
import SatisfactionFilters from './SatisfactionFilters';
import SatisfactionSummaryCards from './SatisfactionSummaryCards';
import SatisfactionCharts from './SatisfactionCharts';
import SatisfactionTable from './SatisfactionTable';

interface PesquisaSatisfacao {
  id: string;
  nome: string;
  telefone: string;
  prefixoVeiculo?: string;
  email?: string;
  media?: number;
  observacoes?: string;
  dataEnvio: any; // Timestamp do Firestore
  atendimentoMotorista?: number;
  limpezaCarro?: number;
  conservacaoCarro?: number;
  tempoEspera?: number;
  cordialidadeAtendimento?: number;
  politicaPrivacidade?: boolean;
}

type TipoRelatorio = 'mes' | 'semestre' | 'ano';

const COLORS = ["#1976d2", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#e57373", "#ba68c8", "#4db6ac", "#ffd54f", "#a1887f", "#90a4ae"];

// Perguntas alinhadas com o banco
const perguntas = [
  { label: "Atendimento do Motorista", campo: "atendimentoMotorista" },
  { label: "Limpeza do Carro", campo: "limpezaCarro" },
  { label: "Conservação do Carro", campo: "conservacaoCarro" },
  { label: "Tempo de Espera", campo: "tempoEspera" },
  { label: "Cordialidade do Atendimento", campo: "cordialidadeAtendimento" }
];

export default function SatisfactionResults() {
  const [pesquisas, setPesquisas] = useState<PesquisaSatisfacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [showSensitive, setShowSensitive] = useState(true);
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("mes");
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("");
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [archivedCampaigns, setArchivedCampaigns] = useState<{
    id: string;
    campanha?: string;
    total: number;
    primeiraData: string;
    ultimaData: string;
  }[]>([]);
  const [selectedArchived, setSelectedArchived] = useState<string | null>(null);
  const [pesquisasArquivadas, setPesquisasArquivadas] = useState<PesquisaSatisfacao[]>([]);
  const [viewingArchived, setViewingArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detalheAvaliacao, setDetalheAvaliacao] = useState<PesquisaSatisfacao | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroTelefone, setFiltroTelefone] = useState('');
  const [filtroPrefixo, setFiltroPrefixo] = useState('');
  const [filtroDataIni, setFiltroDataIni] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroMediaMin, setFiltroMediaMin] = useState('');
  const [filtroMediaMax, setFiltroMediaMax] = useState('');
  const [filtroObs, setFiltroObs] = useState<'todos' | 'com' | 'sem'>('todos');

  useEffect(() => {
    async function fetchPesquisas() {
      setLoading(true);
      setErro("");
      try {
        const q = query(collection(db, "pesquisa_satisfacao"));
        const snapshot = await getDocs(q);
        const lista: PesquisaSatisfacao[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PesquisaSatisfacao[];
        lista.sort((a, b) => {
          const da = new Date(a.dataEnvio).getTime();
          const db = new Date(b.dataEnvio).getTime();
          return db - da;
        });
        setPesquisas(lista);
      } catch (e) {
        setErro("Erro ao carregar pesquisas.");
      } finally {
        setLoading(false);
      }
    }
    fetchPesquisas();
  }, []);

  // Períodos disponíveis
  const periodos = Array.from(new Set(pesquisas.map(p => getPeriodo(p, tipoRelatorio)))).filter(Boolean);
  // Pesquisas filtradas pelo período
  const pesquisasPeriodo = viewingArchived ? pesquisasArquivadas : (periodoSelecionado
    ? pesquisas.filter(p => getPeriodo(p, tipoRelatorio) === periodoSelecionado)
    : pesquisas);

  // Média geral correta
  const mediasValidas = pesquisasPeriodo.map(calcularMedia).filter(m => m !== null);
  const mediaGeral = mediasValidas.length > 0
    ? (mediasValidas.reduce((acc, m) => acc + m, 0) / mediasValidas.length).toFixed(2)
    : '-';

  // Pontos a melhorar (top 3 observações mais frequentes)
  const pontosAte3 = Object.entries(
    pesquisasPeriodo
      .map(p => p.observacoes?.toLowerCase().trim())
      .filter(Boolean)
      .reduce((acc, obs) => {
        acc[obs!] = (acc[obs!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([obs, count]) => `- " ${obs} " (${count}x)`);

  // Gráficos
  const distribuicaoNotas = Array.from({ length: 11 }, (_, i) => i).map((nota) => ({
    name: `${nota}`,
    value: pesquisasPeriodo.filter((p) => Math.round(p.media) === nota).length,
  })).filter((d) => d.value > 0);

  // Gráfico de barras: distribuição de estrelas
  const distEstrelas = distribuicaoEstrelas(pesquisasPeriodo);

  // Gráfico de evolução da média por data
  const evolucaoMedia = pesquisasPeriodo.map(p => ({
    data: p.dataEnvio,
    media: calcularMedia(p)
  })).filter(e => e.media !== null).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  // Gráfico de média por período
  const mediasPorPeriodo = (() => {
    const periodos: Record<string, { total: number; soma: number }> = {};
    pesquisas.forEach((p) => {
      if (!p.dataEnvio) return;
      const periodo = getPeriodo(p, tipoRelatorio);
      const media = calcularMedia(p);
      if (media === null) return;
      if (!periodos[periodo]) periodos[periodo] = { total: 0, soma: 0 };
      periodos[periodo].total++;
      periodos[periodo].soma += media;
    });
    return Object.entries(periodos).map(([periodo, { total, soma }]) => ({
      periodo,
      media: total ? soma / total : 0,
    })).sort((a, b) => a.periodo.localeCompare(b.periodo));
  })();

  // Função para filtrar pesquisas
  const pesquisasFiltradas = pesquisasPeriodo.filter(p => {
    const nomeMatch = !busca || (p.nome && p.nome.toLowerCase().includes(busca.toLowerCase()));
    const telMatch = !filtroTelefone || (p.telefone && p.telefone.includes(filtroTelefone));
    const prefixoMatch = !filtroPrefixo || (p.prefixoVeiculo && p.prefixoVeiculo.toLowerCase().includes(filtroPrefixo.toLowerCase()));
    const data = p.dataEnvio ? new Date(p.dataEnvio) : null;
    const dataIni = filtroDataIni ? new Date(filtroDataIni) : null;
    const dataFim = filtroDataFim ? new Date(filtroDataFim) : null;
    const dataMatch = (!dataIni || (data && data >= dataIni)) && (!dataFim || (data && data <= dataFim));
    const media = calcularMedia(p) ?? 0;
    const mediaMinMatch = !filtroMediaMin || media >= Number(filtroMediaMin);
    const mediaMaxMatch = !filtroMediaMax || media <= Number(filtroMediaMax);
    const obsMatch = filtroObs === 'todos' || (filtroObs === 'com' && p.observacoes) || (filtroObs === 'sem' && !p.observacoes);
    return nomeMatch && telMatch && prefixoMatch && dataMatch && mediaMinMatch && mediaMaxMatch && obsMatch;
  });

  // Centralizar fonte de dados para exportação
  const pesquisasParaExportar = viewingArchived ? pesquisasArquivadas : pesquisasFiltradas;

  function exportarExcel() {
    const header = viewingArchived
      ? ['Data', 'Nome', 'Telefone', 'Prefixo', 'Média']
      : ['Data', 'Nome', 'Telefone', 'Prefixo', 'Média', 'Observação'];
    const rows = pesquisasParaExportar.map(p => [
      formatarData(p.dataEnvio),
      p.nome,
      p.telefone,
      p.prefixoVeiculo,
      calcularMedia(p)?.toFixed(2) ?? '-',
      ...(viewingArchived ? [] : [p.observacoes || ''])
    ]);
    const csv = header.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_satisfacao.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // PDF: gerar relatório profissional
  const gerarPDF = async () => {
    setShowSensitive(false);
    setTimeout(async () => {
      if (!pdfRef.current) return;
      const dist = distribuicaoEstrelas(pesquisasParaExportar);
      const totalRespostas = dist.reduce((acc, d) => acc + d.quantidade, 0) || 1;
      const cores = ['#e57373', '#ffb74d', '#fff176', '#81c784', '#1976d2'];
      const barra = document.createElement('div');
      barra.style.display = 'flex';
      barra.style.height = '28px';
      barra.style.margin = '18px 0 18px 0';
      barra.style.borderRadius = '8px';
      barra.style.overflow = 'hidden';
      dist.forEach((d, i) => {
        const pct = (d.quantidade / totalRespostas) * 100;
        const seg = document.createElement('div');
        seg.style.background = cores[i];
        seg.style.width = pct + '%';
        seg.style.display = 'flex';
        seg.style.alignItems = 'center';
        seg.style.justifyContent = 'center';
        seg.style.color = '#fff';
        seg.style.fontWeight = 'bold';
        seg.style.fontSize = '13px';
        seg.innerHTML = pct > 7 ? `${d.estrela}★ ${Math.round(pct)}%` : '';
        barra.appendChild(seg);
      });
      // 2. Tabela detalhada
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '13px';
      table.style.margin = '18px 0 0 0';
      table.innerHTML = `<thead><tr style='background:#f5f5f5;color:#1976d2;'>
        <th style='padding:6px 8px;border:1px solid #eee;'>Pergunta</th>
        <th style='padding:6px 8px;border:1px solid #eee;'>Status</th>
        <th style='padding:6px 8px;border:1px solid #eee;'>Prefixo</th>
        <th style='padding:6px 8px;border:1px solid #eee;'>Data</th>
        <th style='padding:6px 8px;border:1px solid #eee;'>Execução</th>
        <th style='padding:6px 8px;border:1px solid #eee;'>Aprovadas</th>
        ${!viewingArchived ? `<th style='padding:6px 8px;border:1px solid #eee;'>Obs.</th>` : ''}
      </tr></thead><tbody>
        ${pesquisasParaExportar.map((p, idx) => {
        const media = calcularMedia(p);
        const aprovadas = media !== null ? Math.round((media / 5) * 100) : '-';
        const temObs = p.observacoes && p.observacoes.trim().length > 0;
        return `<tr style='background:${idx % 2 === 0 ? '#f9f9f9' : '#fff'};'>
            <td style='padding:6px 8px;border:1px solid #eee;'>${perguntas.map(q => q.label).join('<br/>')}</td>
            <td style='padding:6px 8px;border:1px solid #eee;'>Respondido</td>
            <td style='padding:6px 8px;border:1px solid #eee;'>${mask(p.prefixoVeiculo)}</td>
            <td style='padding:6px 8px;border:1px solid #eee;'>${formatarData(p.dataEnvio)}</td>
            <td style='padding:6px 8px;border:1px solid #eee;'>5</td>
            <td style='padding:6px 8px;border:1px solid #eee;'>${aprovadas}%</td>
            ${!viewingArchived ? `<td style='padding:6px 8px;border:1px solid #eee;text-align:center;'>${temObs ? '<span title="Possui observação" style="font-size:16px;">💬</span>' : ''}</td>` : ''}
          </tr>`;
      }).join('')}
      </tbody>`;
      // 3. Painel lateral de insights
      const insightsDiv = document.createElement('div');
      insightsDiv.style.background = '#f5faff';
      insightsDiv.style.borderRadius = '8px';
      insightsDiv.style.padding = '14px 18px';
      insightsDiv.style.margin = '0 0 0 18px';
      insightsDiv.style.width = '260px';
      insightsDiv.style.float = 'right';
      insightsDiv.innerHTML = `<div style='font-weight:bold;font-size:15px;margin-bottom:8px;color:#1976d2;'>Principais Insights</div>
        <ul style='margin:0 0 8px 18px;padding:0;'>
          <li>Média geral: <b>${mediaGeral}</b></li>
          <li>Total de avaliações: <b>${pesquisasParaExportar.length}</b></li>
          <li>Observações registradas: <b>${pesquisasParaExportar.filter(p => p.observacoes).length}</b></li>
        </ul>
        <div style='font-size:13px;color:#555;'>
          ${pontosAte3.length ? pontosAte3.map(obs => `<div style='margin-bottom:4px;'>• ${obs.replace(/"/g, '')}</div>`).join('') : 'Nenhum ponto frequente.'}
        </div>`;
      // 4. Rodapé
      const footer = document.createElement('div');
      footer.style.textAlign = 'center';
      footer.style.fontSize = '12px';
      footer.style.marginTop = '24px';
      footer.style.paddingBottom = '18px';
      footer.innerHTML = `<hr style='margin:6px 0;border:none;border-top:1px solid #ccc;'/>Este relatório é confidencial. D-Taxi © ${new Date().getFullYear()} - Gerado em ${new Date().toLocaleString('pt-BR')}`;
      // 5. Container principal
      const container = document.createElement('div');
      // Título
      const titulo = document.createElement('div');
      titulo.style.textAlign = 'center';
      titulo.style.fontWeight = 'bold';
      titulo.style.fontSize = '22px';
      titulo.style.margin = '0 0 8px 0';
      titulo.innerText = 'Relatório de resultados da pesquisa de satisfação do cliente';
      container.appendChild(titulo);
      // Barra de progresso
      container.appendChild(barra);
      // Painel lateral e tabela (em flex)
      const flexDiv = document.createElement('div');
      flexDiv.style.display = 'flex';
      flexDiv.style.alignItems = 'flex-start';
      flexDiv.appendChild(table);
      flexDiv.appendChild(insightsDiv);
      container.appendChild(flexDiv);
      // Rodapé
      container.appendChild(footer);
      html2pdf().set({
        margin: [0.3, 0.3, 0.6, 0.3],
        filename: `relatorio-satisfacao.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      }).from(container).save().then(() => setShowSensitive(true));
    }, 400);
  };

  // Função para buscar campanhas arquivadas
  async function fetchArchivedCampaigns() {
    const q = query(collection(db, "pesquisa_satisfacao_arquivadas"));
    const snapshot = await getDocs(q);
    const byCampanha: Record<string, { id: string; campanha?: string; dataEnvio?: string; }[]> = {};
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const camp = data.campanha || "Sem nome";
      if (!byCampanha[camp]) byCampanha[camp] = [];
      byCampanha[camp].push({
        id: docSnap.id,
        campanha: camp,
        dataEnvio: data.dataEnvio,
      });
    });
    setArchivedCampaigns(
      Object.entries(byCampanha).map(([campanha, docs]) => ({
        id: campanha,
        campanha,
        total: docs.length,
        primeiraData: docs.map(d => d.dataEnvio).sort()[0],
        ultimaData: docs.map(d => d.dataEnvio).sort().reverse()[0]
      }))
    );
  }

  // Função para buscar pesquisas de uma campanha arquivada
  async function fetchPesquisasArquivadas(campanha: string) {
    const q = query(collection(db, "pesquisa_satisfacao_arquivadas"), where("campanha", "==", campanha));
    const snapshot = await getDocs(q);
    setPesquisasArquivadas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as PesquisaSatisfacao));
  }

  // Função para arquivar avaliações selecionadas
  async function archiveSelected() {
    if (selectedIds.length === 0) return;
    setArchiving(true);
    try {
      const snapshot = await getDocs(collection(db, "pesquisa_satisfacao"));
      const toArchive = snapshot.docs.filter(docSnap => selectedIds.includes(docSnap.id));
      for (const docSnap of toArchive) {
        const data = docSnap.data();
        await addDoc(collection(db, "pesquisa_satisfacao_arquivadas"), {
          ...data,
          campanha: campaignName || `Campanha ${new Date().toLocaleString()}`,
          dataEnvio: data.dataEnvio || new Date().toISOString()
        });
        await deleteDoc(doc(db, "pesquisa_satisfacao", docSnap.id));
      }
      setShowArchiveModal(false);
      setCampaignName("");
      setSelectedIds([]);
      // Atualiza pesquisas na tela
      const q = query(collection(db, "pesquisa_satisfacao"));
      const snapshot2 = await getDocs(q);
      const lista: PesquisaSatisfacao[] = snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as PesquisaSatisfacao[];
      setPesquisas(lista);
      alert("Avaliações arquivadas e nova campanha iniciada!");
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert("Erro ao arquivar: " + e.message);
      } else {
        alert("Erro ao arquivar as avaliações.");
      }
    }
    setArchiving(false);
  }

  const tipoAvaliacao = tipoAvaliacaoDaCampanha(pesquisasPeriodo);

  const gerarRelatorioDetalhadoPDF = async () => {
    setShowSensitive(false);
    setTimeout(async () => {
      // 1. Container principal
      const container = document.createElement('div');
      container.style.fontFamily = 'Inter, Arial, sans-serif';
      container.style.background = 'linear-gradient(135deg, #eaf6fb 60%, #dbeafe 100%)';
      container.style.padding = '18px 18px 0 18px';
      container.style.width = '900px';
      container.style.margin = '0 auto';

      // 2. Cabeçalho institucional
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.justifyContent = 'space-between';
      header.style.marginBottom = '18px';
      // Logo (opcional)
      const logo = document.createElement('img');
      logo.src = '/logo.png';
      logo.style.height = '38px';
      logo.style.marginRight = '12px';
      header.appendChild(logo);
      // Título e data
      const headerText = document.createElement('div');
      headerText.innerHTML = `
        <div style="font-size: 22px; font-weight: 900; color: #1976d2;">D-Taxi São Paulo</div>
        <div style="font-size: 15px; color: #222; font-weight: 700;">Relatório da pesquisa de satisfação do cliente</div>
        <div style="color: #607d8b; font-size: 12px; margin-top: 2px;">Av. Prestes Maia, 241 - Santa Ifigênia, São Paulo - SP, 01031-001</div>
        <div style="color: #607d8b; font-size: 12px; margin-top: 2px;">Telefone: 1194483.0851 | Email: contato@dtaxisp.com.br</div>
      `;
      header.appendChild(headerText);
      // QR code
      const qr = document.createElement('img');
      qr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=https://d-taxi.com.br';
      qr.style.height = '38px';
      qr.style.marginLeft = '10px';
      header.appendChild(qr);
      container.appendChild(header);

      // 3. Cards de resumo com ícones
      const cards = document.createElement('div');
      cards.style.display = 'flex';
      cards.style.gap = '12px';
      cards.style.marginBottom = '18px';
      const cardData = [
        { label: 'Total de Avaliações', value: pesquisasFiltradas.length, icon: '📝', color: '#1976d2' },
        { label: 'Média Geral', value: mediaGeral, icon: '⭐', color: '#fbbf24' },
        { label: '% Muito Satisfeitos', value: pesquisasFiltradas.length ? Math.round(100 * pesquisasFiltradas.filter(p => Number(calcularMedia(p)) === 5).length / pesquisasFiltradas.length) + '%' : '0%', icon: '😊', color: '#388e3c' },
        { label: '% Muito Insatisfeitos', value: pesquisasFiltradas.length ? Math.round(100 * pesquisasFiltradas.filter(p => Number(calcularMedia(p)) === 1).length / pesquisasFiltradas.length) + '%' : '0%', icon: '😞', color: '#d32f2f' },
      ];
      cardData.forEach(card => {
        const div = document.createElement('div');
        div.style.background = '#fff';
        div.style.borderRadius = '10px';
        div.style.padding = '10px 12px';
        div.style.boxShadow = '0 1px 4px #0001';
        div.style.flex = '1';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.innerHTML = `<span style="font-size:22px;margin-right:8px;">${card.icon}</span>
          <div>
            <div style="color:${card.color};font-weight:800;font-size:14px;">${card.value}</div>
            <div style="font-size:12px;color:#222;font-weight:600;">${card.label}</div>
          </div>`;
        cards.appendChild(div);
      });
      container.appendChild(cards);

      // 4. Linha principal: matriz + resumo
      const mainRow = document.createElement('div');
      mainRow.style.display = 'flex';
      mainRow.style.gap = '12px';
      mainRow.style.marginBottom = '18px';

      // 4.1 Matriz de satisfação
      const matrizDiv = document.createElement('div');
      matrizDiv.style.flex = '2';
      matrizDiv.style.background = '#fff';
      matrizDiv.style.borderRadius = '10px';
      matrizDiv.style.padding = '12px';
      matrizDiv.style.boxShadow = '0 1px 4px #0001';
      const matrizTitle = document.createElement('h2');
      matrizTitle.style.color = '#1976d2';
      matrizTitle.style.fontWeight = '800';
      matrizTitle.style.marginBottom = '8px';
      matrizTitle.style.fontSize = '14px';
      matrizTitle.innerText = 'Pesquisa de Satisfação';
      matrizDiv.appendChild(matrizTitle);
      // Montar matriz
      const matrizTable = document.createElement('table');
      matrizTable.style.width = '100%';
      matrizTable.style.borderCollapse = 'collapse';
      matrizTable.style.fontSize = '12px';
      matrizTable.style.marginBottom = '0';
      matrizTable.innerHTML = `
        <thead>
          <tr>
            <th></th>
            <th style="color:#d32f2f">Muito Insatisfeito</th>
            <th>Insatisfeito</th>
            <th>Neutro</th>
            <th>Satisfeito</th>
            <th style="color:#388e3c">Muito Satisfeito</th>
          </tr>
        </thead>
        <tbody>
          ${perguntas.map((q, idx) => `
            <tr style="background:${idx % 2 === 0 ? '#f5faff' : '#fff'};">
              <td style="font-weight:700;color:#1976d2;position:relative;">${q.label}</td>
              ${[1, 2, 3, 4, 5].map(nivel => {
        const count = pesquisasFiltradas.filter(p => Number(p[q.campo]) === nivel).length;
        return `<td style="text-align:center;">${count > 0 ? count : '<span style=\'font-size:14px;color:#bbb\'>○</span>'}</td>`;
      }).join('')}
            </tr>
          `).join('')}
        </tbody>
      `;
      matrizDiv.appendChild(matrizTable);
      mainRow.appendChild(matrizDiv);

      // 4.2 Quadro de resumo
      const resumoDiv = document.createElement('div');
      resumoDiv.style.flex = '1';
      resumoDiv.style.background = '#fff';
      resumoDiv.style.borderRadius = '10px';
      resumoDiv.style.padding = '12px';
      resumoDiv.style.boxShadow = '0 1px 4px #0001';
      resumoDiv.style.display = 'flex';
      resumoDiv.style.flexDirection = 'column';
      resumoDiv.style.justifyContent = 'center';
      const resumoTitle = document.createElement('h3');
      resumoTitle.style.color = '#1976d2';
      resumoTitle.style.fontWeight = '800';
      resumoTitle.style.marginBottom = '8px';
      resumoTitle.style.fontSize = '13px';
      resumoTitle.innerText = 'Resumo';
      resumoDiv.appendChild(resumoTitle);
      const totalRespostas = pesquisasFiltradas.length;
      const pctMuitoSatisfeitos = totalRespostas ? Math.round(100 * pesquisasFiltradas.filter(p => Number(calcularMedia(p)) === 5).length / totalRespostas) : 0;
      const pctMuitoInsatisfeitos = totalRespostas ? Math.round(100 * pesquisasFiltradas.filter(p => Number(calcularMedia(p)) === 1).length / totalRespostas) : 0;
      const resumoIndicadores = [
        { label: 'Total de respostas', value: totalRespostas },
        { label: '% Muito Satisfeitos', value: pctMuitoSatisfeitos + '%' },
        { label: '% Muito Insatisfeitos', value: pctMuitoInsatisfeitos + '%' },
      ];
      resumoIndicadores.forEach(ind => {
        const div = document.createElement('div');
        div.style.fontSize = '13px';
        div.style.marginBottom = '6px';
        div.innerHTML = `${ind.label}: <b>${ind.value}</b>`;
        resumoDiv.appendChild(div);
      });
      mainRow.appendChild(resumoDiv);
      container.appendChild(mainRow);

      // 5. Gráfico de barras horizontal
      const graficoDiv = document.createElement('div');
      graficoDiv.style.background = '#fff';
      graficoDiv.style.borderRadius = '10px';
      graficoDiv.style.padding = '12px';
      graficoDiv.style.boxShadow = '0 1px 4px #0001';
      graficoDiv.style.marginBottom = '18px';
      const graficoTitle = document.createElement('h2');
      graficoTitle.style.color = '#1976d2';
      graficoTitle.style.fontWeight = '800';
      graficoTitle.style.marginBottom = '8px';
      graficoTitle.style.fontSize = '14px';
      graficoTitle.innerText = 'Distribuição das Respostas';
      graficoDiv.appendChild(graficoTitle);
      const niveis = [
        { label: 'Muito Satisfeito', cor: '#388e3c', valor: 5 },
        { label: 'Satisfeito', cor: '#1976d2', valor: 4 },
        { label: 'Neutro', cor: '#fbc02d', valor: 3 },
        { label: 'Insatisfeito', cor: '#0288d1', valor: 2 },
        { label: 'Muito Insatisfeito', cor: '#d32f2f', valor: 1 },
      ];
      const total = pesquisasFiltradas.length;
      const percentuais = niveis.map(n => {
        const qtd = pesquisasFiltradas.filter(p => Number(calcularMedia(p)) === n.valor).length;
        return { ...n, pct: total ? Math.round(100 * qtd / total) : 0 };
      });
      percentuais.forEach(n => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.marginBottom = '6px';
        const label = document.createElement('div');
        label.style.width = '120px';
        label.style.fontWeight = '700';
        label.style.color = n.cor;
        label.style.fontSize = '12px';
        label.innerText = n.label;
        row.appendChild(label);
        const bar = document.createElement('div');
        bar.style.height = '14px';
        bar.style.background = n.cor;
        bar.style.width = n.pct + '%';
        bar.style.margin = '0 6px';
        bar.style.borderRadius = '6px';
        row.appendChild(bar);
        const pct = document.createElement('div');
        pct.style.width = '28px';
        pct.style.textAlign = 'right';
        pct.style.fontSize = '12px';
        pct.innerText = n.pct + '%';
        row.appendChild(pct);
        graficoDiv.appendChild(row);
      });
      container.appendChild(graficoDiv);

      // 6. Texto motivacional
      const motiv = document.createElement('div');
      motiv.style.textAlign = 'center';
      motiv.style.fontSize = '14px';
      motiv.style.fontWeight = '700';
      motiv.style.color = '#1976d2';
      motiv.style.margin = '12px 0 0 0';
      motiv.innerText = 'A satisfação do cliente é o nosso combustível!';
      container.appendChild(motiv);

      // 7. Rodapé da primeira página
      const footer = document.createElement('div');
      footer.style.textAlign = 'center';
      footer.style.fontSize = '11px';
      footer.style.marginTop = '12px';
      footer.innerHTML = `<hr style='margin:6px 0;border:none;border-top:1px solid #ccc;'/>Este relatório é confidencial. D-Taxi © ${new Date().getFullYear()} - Gerado em ${new Date().toLocaleString('pt-BR')}`;
      container.appendChild(footer);

      // 8. Páginas de tabelas de avaliações com paginação automática
      const itemsPorPagina = 25; // Máximo de registros por página
      const totalPaginas = Math.ceil(pesquisasFiltradas.length / itemsPorPagina);
      
      for (let pagina = 0; pagina < totalPaginas; pagina++) {
        const inicio = pagina * itemsPorPagina;
        const fim = Math.min(inicio + itemsPorPagina, pesquisasFiltradas.length);
        const dadosPagina = pesquisasFiltradas.slice(inicio, fim);
        
        // Quebra de página
        const pageBreak = document.createElement('div');
        pageBreak.style.pageBreakBefore = 'always';
        pageBreak.style.marginTop = '12px';
        pageBreak.style.position = 'relative';
        pageBreak.style.minHeight = '100vh';
        pageBreak.style.paddingBottom = '80px';
        container.appendChild(pageBreak);
        
        // Cabeçalho da página
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justifyContent = 'space-between';
        headerDiv.style.alignItems = 'center';
        headerDiv.style.marginBottom = '15px';
        headerDiv.style.borderBottom = '2px solid #1976d2';
        headerDiv.style.paddingBottom = '8px';
        
        const tabelaTitle = document.createElement('h2');
        tabelaTitle.style.color = '#1976d2';
        tabelaTitle.style.fontWeight = '800';
        tabelaTitle.style.fontSize = '18px';
        tabelaTitle.style.margin = '0';
        tabelaTitle.innerText = `Tabela de Avaliações ${totalPaginas > 1 ? `(Página ${pagina + 1} de ${totalPaginas})` : ''}`;
        
        const infoDiv = document.createElement('div');
        infoDiv.style.fontSize = '12px';
        infoDiv.style.color = '#666';
        infoDiv.innerHTML = `
          <div><strong>Registros:</strong> ${inicio + 1} - ${fim} de ${pesquisasFiltradas.length}</div>
          <div><strong>Dados:</strong> Sensíveis Ocultos</div>
        `;
        
        headerDiv.appendChild(tabelaTitle);
        headerDiv.appendChild(infoDiv);
        pageBreak.appendChild(headerDiv);
        
        // Estatísticas da página
        const estatsPagina = dadosPagina.reduce((acc, p) => {
          const media = calcularMedia(p);
          if (media !== null) {
            acc.total++;
            acc.soma += media;
            if (media >= 4.5) acc.alta++;
            else if (media <= 2) acc.baixa++;
            else acc.media++;
          }
          return acc;
        }, { total: 0, soma: 0, alta: 0, media: 0, baixa: 0 });
        
        const statsDiv = document.createElement('div');
        statsDiv.style.display = 'flex';
        statsDiv.style.gap = '15px';
        statsDiv.style.marginBottom = '12px';
        statsDiv.style.padding = '8px 12px';
        statsDiv.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
        statsDiv.style.borderRadius = '6px';
        statsDiv.style.fontSize = '11px';
        
        const mediaPagina = estatsPagina.total > 0 ? (estatsPagina.soma / estatsPagina.total).toFixed(2) : '0.00';
        
        statsDiv.innerHTML = `
          <div><strong>Média desta página:</strong> <span style="color:#1976d2;font-weight:bold;">${mediaPagina}</span></div>
          <div><strong>Alta satisfação:</strong> <span style="color:#388e3c;">${estatsPagina.alta}</span></div>
          <div><strong>Média satisfação:</strong> <span style="color:#f57c00;">${estatsPagina.media}</span></div>
          <div><strong>Baixa satisfação:</strong> <span style="color:#d32f2f;">${estatsPagina.baixa}</span></div>
        `;
        pageBreak.appendChild(statsDiv);
        
        // Tabela melhorada
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '11px';
        table.style.marginBottom = '15px';
        table.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        table.style.borderRadius = '6px';
        table.style.overflow = 'hidden';
        
        table.innerHTML = `
          <thead>
            <tr style="background:linear-gradient(135deg, #1976d2 0%, #1565c0 100%);color:#fff;">
              <th style="padding:10px 8px;font-weight:700;text-align:left;border-right:1px solid rgba(255,255,255,0.2);">#</th>
              <th style="padding:10px 8px;font-weight:700;text-align:left;border-right:1px solid rgba(255,255,255,0.2);">Nome</th>
              <th style="padding:10px 8px;font-weight:700;text-align:left;border-right:1px solid rgba(255,255,255,0.2);">Telefone</th>
              <th style="padding:10px 8px;font-weight:700;text-align:left;border-right:1px solid rgba(255,255,255,0.2);">Prefixo</th>
              <th style="padding:10px 8px;font-weight:700;text-align:center;border-right:1px solid rgba(255,255,255,0.2);">Data</th>
              <th style="padding:10px 8px;font-weight:700;text-align:center;border-right:1px solid rgba(255,255,255,0.2);">Média</th>
              <th style="padding:10px 8px;font-weight:700;text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${dadosPagina.map((p, idx) => {
              const media = calcularMedia(p);
              const globalIdx = inicio + idx + 1;
              const statusColor = media >= 4.5 ? '#e8f5e8' : media <= 2 ? '#ffebee' : '#fff3e0';
              const statusText = media >= 4.5 ? 'Excelente' : media >= 3.5 ? 'Bom' : media >= 2.5 ? 'Regular' : 'Ruim';
              const statusTextColor = media >= 4.5 ? '#2e7d32' : media >= 3.5 ? '#1976d2' : media >= 2.5 ? '#f57c00' : '#d32f2f';
              
              return `
                <tr style="background:${idx % 2 === 0 ? '#fafafa' : '#fff'};border-bottom:1px solid #e0e0e0;transition:background 0.2s;">
                  <td style="padding:8px;font-weight:600;color:#666;border-right:1px solid #e0e0e0;">${globalIdx}</td>
                  <td style="padding:8px;border-right:1px solid #e0e0e0;">${mask(p.nome)}</td>
                  <td style="padding:8px;border-right:1px solid #e0e0e0;font-family:monospace;">${mask(p.telefone)}</td>
                  <td style="padding:8px;border-right:1px solid #e0e0e0;text-align:center;font-weight:600;">${mask(p.prefixoVeiculo)}</td>
                  <td style="padding:8px;border-right:1px solid #e0e0e0;text-align:center;font-size:10px;">${formatarData(p.dataEnvio)}</td>
                  <td style="padding:8px;border-right:1px solid #e0e0e0;text-align:center;">
                    <div style="display:flex;align-items:center;justify-content:center;gap:4px;">
                      <span style="font-weight:700;font-size:13px;color:${statusTextColor};">${media?.toFixed(2) ?? '-'}</span>
                      ${media ? `<div style="display:flex;">${'★'.repeat(Math.round(media))}<span style="color:#ddd;">${'★'.repeat(5 - Math.round(media))}</span></div>` : ''}
                    </div>
                  </td>
                  <td style="padding:8px;text-align:center;">
                    <span style="background:${statusColor};color:${statusTextColor};padding:2px 6px;border-radius:12px;font-size:9px;font-weight:600;">${statusText}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        `;
        pageBreak.appendChild(table);
        
        // Rodapé da página - posicionado no final
        const footerPagina = document.createElement('div');
        footerPagina.style.position = 'absolute';
        footerPagina.style.bottom = '20px';
        footerPagina.style.left = '0';
        footerPagina.style.right = '0';
        footerPagina.style.textAlign = 'center';
        footerPagina.style.fontSize = '10px';
        footerPagina.style.color = '#666';
        footerPagina.innerHTML = `
          <hr style='margin:8px 0;border:none;border-top:1px solid #ddd;'/>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0 20px;">
            <span>Este relatório é confidencial. D-Taxi © ${new Date().getFullYear()}</span>
            <span>Página ${pagina + 1} de ${totalPaginas} | Gerado em ${new Date().toLocaleString('pt-BR')}</span>
          </div>
        `;
        pageBreak.appendChild(footerPagina);
      }

      // 10. Exportar PDF
      html2pdf().set({
        margin: [0.3, 0.3, 0.6, 0.3],
        filename: `relatorio-detalhado-satisfacao.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      }).from(container).save().then(() => setShowSensitive(true));
    }, 400);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24, fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="report-header" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1976d2', margin: 0 }}>Relatório Gerencial de Satisfação</h1>
            <span style={{ color: '#607d8b', fontSize: 16 }}>Análise completa das campanhas arquivadas</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <select value={tipoRelatorio} onChange={e => { setTipoRelatorio(e.target.value as TipoRelatorio); setPeriodoSelecionado(""); }} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontWeight: 600, color: '#1976d2', minWidth: 120 }}>
              <option value="mes">Por mês</option>
              <option value="semestre">Por semestre</option>
              <option value="ano">Por ano</option>
            </select>
            <select value={periodoSelecionado} onChange={e => setPeriodoSelecionado(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2', fontWeight: 600, color: '#1976d2', minWidth: 120 }}>
              <option value="">Todos os períodos</option>
              {periodos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="text" placeholder="Buscar por nome ou prefixo" style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2', minWidth: 180 }} onChange={e => {/* implementar filtro futuramente */ }} />
          </div>
        </div>
        <SatisfactionSummaryCards
          total={pesquisasPeriodo.length}
          mediaGeral={mediaGeral}
          percentualObs={pesquisasPeriodo.length ? Math.round(100 * pesquisasPeriodo.filter(p => p.observacoes).length / pesquisasPeriodo.length) : 0}
          periodo={pesquisasPeriodo.length ? `${formatarData(pesquisasPeriodo[pesquisasPeriodo.length - 1].dataEnvio)} a ${formatarData(pesquisasPeriodo[0].dataEnvio)}` : '-'}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>

        <button
          onClick={gerarRelatorioDetalhadoPDF}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 16,
            marginLeft: 8
          }}
        >
          Gerar Relatório Detalhado (PDF)
        </button>
        <button
          onClick={() => setShowSensitive((v) => !v)}
          style={{ background: showSensitive ? '#eee' : '#1976d2', color: showSensitive ? '#1976d2' : '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
        >
          {showSensitive ? <FaEyeSlash style={{ marginRight: 8, verticalAlign: -2 }} /> : <FaEye style={{ marginRight: 8, verticalAlign: -2 }} />}
          {showSensitive ? 'Ocultar dados sensíveis' : 'Mostrar dados sensíveis'}
        </button>
        <button
          onClick={async () => { setShowArchivedModal(true); await fetchArchivedCampaigns(); }}
          style={{ background: "#607d8b", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 16, marginLeft: 8 }}
        >
          Relatórios de Campanhas Arquivadas
        </button>
        <button
          onClick={() => setShowArchiveModal(true)}
          disabled={selectedIds.length === 0}
          style={{ background: selectedIds.length ? "#ff9800" : "#ccc", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", fontWeight: 600, cursor: selectedIds.length ? "pointer" : "not-allowed", fontSize: 16 }}
        >
          Arquivar Selecionadas / Nova Campanha
        </button>
      </div>
      <SatisfactionFilters
        busca={busca}
        setBusca={setBusca}
        filtroTelefone={filtroTelefone}
        setFiltroTelefone={setFiltroTelefone}
        filtroPrefixo={filtroPrefixo}
        setFiltroPrefixo={setFiltroPrefixo}
        filtroDataIni={filtroDataIni}
        setFiltroDataIni={setFiltroDataIni}
        filtroDataFim={filtroDataFim}
        setFiltroDataFim={setFiltroDataFim}
        filtroMediaMin={filtroMediaMin}
        setFiltroMediaMin={setFiltroMediaMin}
        filtroMediaMax={filtroMediaMax}
        setFiltroMediaMax={setFiltroMediaMax}
        filtroObs={filtroObs}
        setFiltroObs={setFiltroObs}
      />
      <SatisfactionCharts
        distEstrelas={distEstrelas}
        evolucaoMedia={evolucaoMedia}
        pesquisasPeriodo={pesquisasPeriodo}
      />
      <SatisfactionTable
        pesquisas={pesquisasFiltradas}
        loading={loading}
        erro={erro}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        expanded={expanded}
        setExpanded={setExpanded}
        showSensitive={showSensitive}
        setDetalheAvaliacao={(p) => setDetalheAvaliacao(p)}
        formatarData={formatarData}
        mask={mask}
        calcularMedia={calcularMedia}
      />
      {showArchivedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, maxWidth: 600, boxShadow: '0 2px 12px #0003', position: 'relative' }}>
            <button onClick={() => setShowArchivedModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#1976d2', cursor: 'pointer' }}>×</button>
            <h2 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 18 }}>Campanhas Arquivadas</h2>
            {archivedCampaigns.length === 0 && (
              <div style={{ color: '#888', textAlign: 'center', padding: 24 }}>Nenhuma campanha arquivada encontrada.</div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {archivedCampaigns.map((camp) => (
                <li key={camp.id} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                  <div style={{ fontWeight: 600, color: '#1976d2' }}>{camp.campanha}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>
                    {camp.total} pesquisas | {camp.primeiraData} - {camp.ultimaData}
                  </div>
                  <button
                    style={{ marginTop: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                    onClick={async () => {
                      setSelectedArchived(camp.campanha);
                      setViewingArchived(true);
                      await fetchPesquisasArquivadas(camp.campanha);
                      setShowArchivedModal(false);
                    }}
                  >
                    Ver pesquisas e emitir relatório
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {viewingArchived && (
        <div style={{ margin: '24px 0' }}>
          <button onClick={() => { setViewingArchived(false); setPesquisasArquivadas([]); setSelectedArchived(null); }} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 16, marginBottom: 16 }}>
            Voltar para Campanhas Arquivadas
          </button>
          <h3 style={{ color: '#1976d2', marginBottom: 12 }}>Pesquisas da campanha: {selectedArchived}</h3>
          <div style={{ marginBottom: 16 }}>
            <button onClick={gerarPDF} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 16, marginRight: 8 }}>Exportar PDF</button>
            <button onClick={exportarExcel} style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Exportar Excel</button>
          </div>
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px #0001', padding: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#f5f5f5', color: '#1976d2' }}>
                  <th style={{ padding: 10, border: '1px solid #eee' }}>Data</th>
                  <th style={{ padding: 10, border: '1px solid #eee' }}>Nome</th>
                  <th style={{ padding: 10, border: '1px solid #eee' }}>Telefone</th>
                  <th style={{ padding: 10, border: '1px solid #eee' }}>Prefixo</th>
                  <th style={{ padding: 10, border: '1px solid #eee' }}>Média (★)</th>
                  <th style={{ padding: 10, border: '1px solid #eee' }}>OBS</th>
                </tr>
              </thead>
              <tbody>
                {pesquisasArquivadas.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>Nenhuma pesquisa nesta campanha.</td></tr>
                )}
                {pesquisasArquivadas.map((p, idx) => (
                  <tr key={p.id} style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                    <td style={{ padding: 10, border: '1px solid #eee' }}>{formatarData(p.dataEnvio)}</td>
                    <td style={{ padding: 10, border: '1px solid #eee' }}>{mask(p.nome)}</td>
                    <td style={{ padding: 10, border: '1px solid #eee' }}>{mask(p.telefone)}</td>
                    <td style={{ padding: 10, border: '1px solid #eee' }}>{mask(p.prefixoVeiculo)}</td>
                    <td style={{ padding: 10, border: '1px solid #eee', textAlign: 'center' }}>{calcularMedia(p) !== null ? calcularMedia(p)!.toFixed(2) : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #eee', textAlign: 'center' }}>{p.observacoes ? p.observacoes : <span style={{ color: '#888' }}>-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {detalheAvaliacao && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, maxWidth: 480, boxShadow: '0 2px 12px #0003', position: 'relative' }}>
            <button onClick={() => setDetalheAvaliacao(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#1976d2', cursor: 'pointer' }}>×</button>
            <h2 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12 }}>Detalhes da Avaliação</h2>
            <div><b>Data:</b> {formatarData(detalheAvaliacao.dataEnvio)}</div>
            <div><b>Nome:</b> {detalheAvaliacao.nome}</div>
            <div><b>Telefone:</b> {detalheAvaliacao.telefone}</div>
            <div><b>Prefixo:</b> {detalheAvaliacao.prefixoVeiculo}</div>
            <div><b>Média:</b> {calcularMedia(detalheAvaliacao)?.toFixed(2)}</div>
            <div style={{ margin: '12px 0' }}><b>Observação:</b><br />{detalheAvaliacao.observacoes || <span style={{ color: '#888' }}>Nenhuma</span>}</div>
            <div style={{ marginTop: 10 }}>
              <b>Notas:</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Atendimento do Motorista: {detalheAvaliacao.atendimentoMotorista ?? '-'}</li>
                <li>Limpeza do Carro: {detalheAvaliacao.limpezaCarro ?? '-'}</li>
                <li>Conservação do Carro: {detalheAvaliacao.conservacaoCarro ?? '-'}</li>
                <li>Tempo de Espera: {detalheAvaliacao.tempoEspera ?? '-'}</li>
                <li>Cordialidade do Atendimento: {detalheAvaliacao.cordialidadeAtendimento ?? '-'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 900px) {
          table, thead, tbody, th, td, tr {
            display: block;
          }
          thead tr {
            display: none;
          }
          td {
            border: none;
            position: relative;
            padding-left: 50%;
            min-width: 100px;
            word-break: break-word;
          }
          td:before {
            position: absolute;
            left: 10px;
            width: 45%;
            white-space: nowrap;
            font-weight: bold;
            color: #1976d2;
          }
          td:nth-of-type(1):before { content: "Data"; }
          td:nth-of-type(2):before { content: "Nome"; }
          td:nth-of-type(3):before { content: "Telefone"; }
          td:nth-of-type(4):before { content: "Prefixo"; }
          td:nth-of-type(5):before { content: "Média (★)"; }
        }
      `}</style>
    </div>
  );
}