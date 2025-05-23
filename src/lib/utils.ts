import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para mascarar string
export function mask(str: string, visible = 2) {
  if (!str) return "-";
  if (str.length <= visible) return "*".repeat(str.length);
  return str[0] + "*".repeat(str.length - visible - 1) + str.slice(-visible);
}

// Função para obter o período
export function getPeriodo(p: any, tipo: 'mes' | 'ano' | 'semestre') {
  if (!p.dataResposta) return "";
  const [dia, mes, ano] = p.dataResposta.split(/[-/]/);
  if (tipo === "mes") return `${mes}/${ano}`;
  if (tipo === "ano") return ano;
  if (tipo === "semestre") return `${ano}-S${parseInt(mes) <= 6 ? 1 : 2}`;
  return "";
}

// Função para formatar data
export function formatarData(data: string | Date | undefined): string {
  if (!data) return '-';
  if (typeof data === 'string') {
    const d = new Date(data);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
    return data;
  }
  if (data instanceof Date) return data.toLocaleDateString('pt-BR');
  // @ts-expect-error: Suporte a objetos Timestamp do Firestore que possuem o método toDate
  if (data.toDate) return data.toDate().toLocaleDateString('pt-BR');
  return '-';
}

// Função para detectar se a campanha é por estrelas ou notas
export function tipoAvaliacaoDaCampanha(pesquisas: any[]): 'estrelas' | 'notas' {
  const respostas = pesquisas.flatMap(p => [p.pergunta1, p.pergunta2, p.pergunta3, p.pergunta4, p.pergunta5]);
  if (respostas.every(n => n === undefined || (Number(n) >= 1 && Number(n) <= 5))) return 'estrelas';
  return 'notas';
}

// Função para converter nota 0-10 para estrelas (1-5)
export function notaParaEstrela(nota: number | string | undefined): number {
  const n = Number(nota);
  if (isNaN(n)) return 0;
  if (n <= 1.9) return 1;
  if (n <= 3.9) return 2;
  if (n <= 5.9) return 3;
  if (n <= 7.9) return 4;
  return 5;
}

// Matriz de respostas por estrela
export function matrizEstrelas(pesquisas: any[]) {
  const perguntas = [
    { campo: "atendimentoMotorista" },
    { campo: "limpezaCarro" },
    { campo: "conservacaoCarro" },
    { campo: "tempoEspera" },
    { campo: "cordialidadeAtendimento" }
  ];
  return perguntas.map(q =>
    [1, 2, 3, 4, 5].map(estrela =>
      pesquisas.filter(p => Number(p[q.campo as keyof typeof p]) === estrela).length
    )
  );
}

// Calcula matriz de respostas: [pergunta][nota] = quantidade
export function matrizRespostas(pesquisas: any[]) {
  const matriz = Array(5).fill(null).map(() => Array(11).fill(0));
  pesquisas.forEach(p => {
    [p.pergunta1, p.pergunta2, p.pergunta3, p.pergunta4, p.pergunta5].forEach((nota, idx) => {
      const n = Number(nota);
      if (!isNaN(n) && n >= 0 && n <= 10) matriz[idx][n]++;
    });
  });
  return matriz;
}

// Dados para gráfico de barras de cada pergunta
export function dadosGraficoBarra(pesquisas: any[], idxPergunta: number) {
  const data = Array.from({ length: 11 }, (_, n) => ({
    nota: n,
    quantidade: pesquisas.filter(p => Number([p.pergunta1, p.pergunta2, p.pergunta3, p.pergunta4, p.pergunta5][idxPergunta]) === n).length
  }));
  return data;
}

// Função utilitária para renderizar estrelas
export function renderStars(media: number, size = 14) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span style='color:${i < Math.round(media) ? '#fbbf24' : '#ccc'};font-size:${size}px;'>&#9733;</span>`
  ).join('');
}

// Função para calcular a média das avaliações
export function calcularMedia(p: any): number | null {
  const notas = [
    p.atendimentoMotorista,
    p.limpezaCarro,
    p.conservacaoCarro,
    p.tempoEspera,
    p.cordialidadeAtendimento
  ].map(Number).filter(n => !isNaN(n));
  return notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
}

// Função para calcular a distribuição de estrelas (1 a 5)
export function distribuicaoEstrelas(pesquisas: any[]) {
  const dist = [0, 0, 0, 0, 0];
  pesquisas.forEach(p => {
    [p.atendimentoMotorista, p.limpezaCarro, p.conservacaoCarro, p.tempoEspera, p.cordialidadeAtendimento].forEach(nota => {
      const n = Number(nota);
      if (n >= 1 && n <= 5) dist[n - 1]++;
    });
  });
  return dist.map((qtd, i) => ({ estrela: i + 1, quantidade: qtd }));
}
