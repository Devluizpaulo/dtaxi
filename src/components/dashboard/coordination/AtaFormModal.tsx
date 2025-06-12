import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer, Download } from 'lucide-react';
import { Coordenador, Documento } from './types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface AtaFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (doc: Partial<Documento>) => Promise<void>;
  coordenadores: Coordenador[];
  documento?: Documento | null;
  loading?: boolean;
}

const defaultPresidente = 'Mauricio Alonso';

const camposIniciais = (doc?: Documento | null) => ({
  data: doc?.data || '',
  local: doc?.local || '',
  presidente: doc?.presidente || defaultPresidente,
  unidades: doc?.unidades ? JSON.parse(doc.unidades) : [{ unidade: '', nome: '', cpf: '', prefixo: '' }],
  membrosPresentes: doc?.membrosPresentes ? doc.membrosPresentes.split(',').map((s: string) => s.trim()) : [],
  membrosManuais: [],
  abertura: doc?.abertura || '',
  relato: doc?.relato || '',
  discussao: doc?.discussao || '',
  medidaVotada: doc?.medidaVotada || '',
  votosSim: doc?.votosSim || '',
  votosNao: doc?.votosNao || '',
  votosAbstencao: doc?.votosAbstencao || '',
  resultadoVotacao: doc?.resultadoVotacao || '',
  resultadoFinal: doc?.resultadoFinal || '',
  encerramento: doc?.encerramento || '',
  dataAssinatura: doc?.dataAssinatura || '',
});

const AtaFormModal: React.FC<AtaFormModalProps> = ({ open, onCancel, onSave, coordenadores, documento, loading }) => {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [fields, setFields] = useState(camposIniciais(documento));

  React.useEffect(() => {
    setFields(camposIniciais(documento));
    setStep('form');
  }, [documento, open]);

  // Geração automática do texto da ata formal (ABNT)
  const membrosPresentes = [...fields.membrosPresentes];
  const membrosConvidados = fields.membrosManuais.filter(Boolean);
  const totalVotantes = membrosPresentes.length + membrosConvidados.length + 1; // +1 presidente

  // Garantir votos >= 0 e não maior que total de votantes
  const votosSim = Math.max(0, Math.min(Number(fields.votosSim) || 0, totalVotantes));
  const votosNao = Math.max(0, Math.min(Number(fields.votosNao) || 0, totalVotantes));
  const votosAbstencao = Math.max(0, Math.min(Number(fields.votosAbstencao) || 0, totalVotantes));

  const ataTexto = useMemo(() => {
    const unidades = fields.unidades.map((u: any, i: number) =>
      `Unidade ${i + 1}: Nome: ${u.nome}, CPF: ${u.cpf}, Prefixo: ${u.prefixo}`
    ).join('\n');
    let membrosLinha = membrosPresentes.join(', ');
    if (membrosConvidados.length > 0) {
      membrosLinha += membrosLinha ? ', ' : '';
      membrosLinha += membrosConvidados.map(n => `${n} (convidado)`).join(', ');
    }
    let agradecimento = '';
    if (membrosConvidados.length > 0) {
      agradecimento = `\nAgradecemos a presença dos convidados: ${membrosConvidados.join(', ')}.`;
    }
    return `D-TAXI SP\nATA DA REUNIÃO DA COMISSÃO DE ÉTICA\n\nAta da Reunião da Comissão de Ética da D-Taxi SP\n\nData: ${fields.data}\nLocal: ${fields.local}\nPresidente: ${fields.presidente}\n${unidades ? 'Unidades Envolvidas:\n' + unidades : ''}\nMembros Presentes da Comissão: ${membrosLinha}\n${agradecimento}\n\n1. Abertura da Reunião\n    ${fields.abertura}\n\n2. Relato dos Casos\n    ${fields.relato}\n\n3. Discussão das Medidas\n    ${fields.discussao}\n\n4. Votação da Medida\n    Medida votada: ${fields.medidaVotada}\n    Número de votos - Sim: ${votosSim}, Não: ${votosNao}, Abstenções: ${votosAbstencao}\n    Total de votantes: ${totalVotantes}\n    Resultado da Votação: ${fields.resultadoVotacao}\n\n5. Resultado Final\n    ${fields.resultadoFinal}\n\n6. Encerramento\n    ${fields.encerramento}\n\nSão Paulo, ${fields.dataAssinatura || fields.data}`;
  }, [fields, membrosPresentes, membrosConvidados, votosSim, votosNao, votosAbstencao, totalVotantes]);

  // Geração do HTML para PDF (ABNT, texto justificado)
  const ataHtmlForPdf = useMemo(() => {
    const unidades = fields.unidades.map((u: any, i: number) =>
      `Unidade ${i + 1}: Nome: ${u.nome}, CPF: ${u.cpf}, Prefixo: ${u.prefixo}`
    ).join('<br/>');
    let membrosLinha = membrosPresentes.join(', ');
    if (membrosConvidados.length > 0) {
      membrosLinha += membrosLinha ? ', ' : '';
      membrosLinha += membrosConvidados.map(n => `${n} (convidado)`).join(', ');
    }
    let agradecimento = '';
    if (membrosConvidados.length > 0) {
      agradecimento = `<br/><span style='font-style:italic;'>Agradecemos a presença dos convidados: ${membrosConvidados.join(', ')}.</span>`;
    }
    return `
      <div style="font-family: Times New Roman, serif; font-size: 14pt; margin: 3cm 2cm 2cm 3cm; line-height: 1.5; color: #222; text-align: justify;">
        <div style="text-align: center; font-weight: bold; font-size: 16pt; margin-bottom: 1.5em;">D-TAXI SP</div>
        <div style="text-align: center; font-weight: bold; font-size: 15pt; margin-bottom: 1.5em; text-transform: uppercase;">ATA DA REUNIÃO DA COMISSÃO DE ÉTICA</div>
        <div style="text-align: center; font-size: 13pt; margin-bottom: 2em;">Ata da Reunião da Comissão de Ética da D-Taxi SP</div>
        <div style="margin-bottom: 1em;"><b>Data:</b> ${fields.data}</div>
        <div style="margin-bottom: 1em;"><b>Local:</b> ${fields.local}</div>
        <div style="margin-bottom: 1em;"><b>Presidente:</b> ${fields.presidente}</div>
        ${fields.unidades.length > 0 ? `<div style="margin-bottom: 1em;"><b>Unidades Envolvidas:</b><br/>${unidades}</div>` : ''}
        <div style="margin-bottom: 1em;"><b>Membros Presentes da Comissão:</b> ${membrosLinha}</div>
        ${agradecimento}
        <div style="margin-bottom: 1em;"><b>1. Abertura da Reunião</b><br/><span style="margin-left:2em;">${fields.abertura}</span></div>
        <div style="margin-bottom: 1em;"><b>2. Relato dos Casos</b><br/><span style="margin-left:2em;">${fields.relato}</span></div>
        <div style="margin-bottom: 1em;"><b>3. Discussão das Medidas</b><br/><span style="margin-left:2em;">${fields.discussao}</span></div>
        <div style="margin-bottom: 1em;"><b>4. Votação da Medida</b><br/><span style="margin-left:2em;">Medida votada: ${fields.medidaVotada}<br/>Número de votos - Sim: ${votosSim}, Não: ${votosNao}, Abstenções: ${votosAbstencao}<br/>Total de votantes: ${totalVotantes}<br/>Resultado da Votação: ${fields.resultadoVotacao}</span></div>
        <div style="margin-bottom: 1em;"><b>5. Resultado Final</b><br/><span style="margin-left:2em;">${fields.resultadoFinal}</span></div>
        <div style="margin-bottom: 1em;"><b>6. Encerramento</b><br/><span style="margin-left:2em;">${fields.encerramento}</span></div>
        <div style="margin: 2em 0 1em 0;">São Paulo, ${fields.dataAssinatura || fields.data}</div>
        <div style="margin-top: 3em; text-align: center;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2em;">
            <div>
              <div style="border-top: 1px solid #222; width: 300px; margin: 0 auto 0.2em auto;"></div>
              <div>${fields.presidente}<br/>Presidente da D-Taxi SP</div>
            </div>
            ${membrosPresentes.map(nome => `
              <div>
                <div style="border-top: 1px solid #222; width: 300px; margin: 0 auto 0.2em auto;"></div>
                <div>${nome}<br/>Membro da Comissão de Ética</div>
              </div>
            `).join('')}
            ${membrosConvidados.map(nome => `
              <div>
                <div style="border-top: 1px solid #222; width: 300px; margin: 0 auto 0.2em auto;"></div>
                <div>${nome}<br/>Convidado</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }, [fields, membrosPresentes, membrosConvidados, votosSim, votosNao, votosAbstencao, totalVotantes]);

  // PDF download (ABNT)
  const handleDownloadPDF = () => {
    html2pdf().set({ margin: 0, filename: `Ata_Comissao_Etica_${fields.data}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
      .from({
        // @ts-ignore
        html: ataHtmlForPdf,
      }).save();
  };

  // Função para imprimir apenas a ata, com o mesmo layout do PDF
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=1200');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Ata da Comissão de Ética</title>
        <style>
          @media print {
            body { margin: 0; }
          }
        </style>
        </head><body>${ataHtmlForPdf}</body></html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    }
  };

  // Handlers para campos dinâmicos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
  };
  // Unidades
  const handleUnidadeChange = (idx: number, campo: string, value: string) => {
    setFields(f => {
      const arr = [...f.unidades];
      arr[idx][campo] = value;
      return { ...f, unidades: arr };
    });
  };
  const handleAddUnidade = () => {
    setFields(f => ({ ...f, unidades: [...f.unidades, { unidade: '', nome: '', cpf: '', prefixo: '' }] }));
  };
  const handleRemoveUnidade = (idx: number) => {
    setFields(f => {
      const arr = [...f.unidades];
      arr.splice(idx, 1);
      return { ...f, unidades: arr };
    });
  };
  // Membros presentes
  const handlePresenteToggle = (id: string, nome: string) => {
    setFields(f => f.membrosPresentes.includes(nome)
      ? { ...f, membrosPresentes: f.membrosPresentes.filter(n => n !== nome) }
      : { ...f, membrosPresentes: [...f.membrosPresentes, nome] }
    );
  };
  const handleAddMembroManual = () => {
    setFields(f => ({ ...f, membrosManuais: [...f.membrosManuais, ''] }));
  };
  const handleMembroManualChange = (idx: number, value: string) => {
    setFields(f => {
      const arr = [...f.membrosManuais];
      arr[idx] = value;
      return { ...f, membrosManuais: arr };
    });
  };
  const handleRemoveMembroManual = (idx: number) => {
    setFields(f => {
      const arr = [...f.membrosManuais];
      arr.splice(idx, 1);
      return { ...f, membrosManuais: arr };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleSave = async () => {
    await onSave({
      tipo: 'Ata de Comissão de Ética',
      titulo: `Ata de Comissão de Ética - ${fields.data}`,
      data: fields.data,
      local: fields.local,
      presidente: fields.presidente,
      unidades: JSON.stringify(fields.unidades),
      membrosPresentes: [...fields.membrosPresentes, ...fields.membrosManuais.filter(Boolean)].join(', '),
      abertura: fields.abertura,
      relato: fields.relato,
      discussao: fields.discussao,
      medidaVotada: fields.medidaVotada,
      votosSim: fields.votosSim,
      votosNao: fields.votosNao,
      votosAbstencao: fields.votosAbstencao,
      resultadoVotacao: fields.resultadoVotacao,
      resultadoFinal: fields.resultadoFinal,
      encerramento: fields.encerramento,
      dataAssinatura: fields.dataAssinatura || fields.data,
      texto: ataTexto,
    });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl relative animate-fadeIn overflow-y-auto max-h-[95vh]">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none"
          onClick={onCancel}
          aria-label="Fechar modal"
        >
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-taxi-green text-center">
          {documento ? 'Editar Ata de Comissão de Ética' : 'Nova Ata de Comissão de Ética'}
        </h3>
        {step === 'form' ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Data</span>
                <input name="data" type="date" value={fields.data} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Local</span>
                <input name="local" value={fields.local} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Presidente</span>
              <input name="presidente" value={fields.presidente} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
            </label>
            <div className="space-y-2">
              <span className="text-sm font-semibold text-taxi-green">Unidades Envolvidas</span>
              {fields.unidades.map((u: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center border rounded p-2 mb-1">
                  <input placeholder="Unidade" value={u.unidade} onChange={e => handleUnidadeChange(idx, 'unidade', e.target.value)} className="border rounded p-2 flex-1" />
                  <input placeholder="Nome" value={u.nome} onChange={e => handleUnidadeChange(idx, 'nome', e.target.value)} className="border rounded p-2 flex-1" />
                  <input placeholder="CPF" value={u.cpf} onChange={e => handleUnidadeChange(idx, 'cpf', e.target.value)} className="border rounded p-2 flex-1" />
                  <input placeholder="Prefixo" value={u.prefixo} onChange={e => handleUnidadeChange(idx, 'prefixo', e.target.value)} className="border rounded p-2 flex-1" />
                  <Button type="button" variant="ghost" onClick={() => handleRemoveUnidade(idx)} title="Remover">×</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddUnidade}>Adicionar Unidade</Button>
            </div>
            <div>
              <span className="text-sm font-semibold text-taxi-green">Membros Presentes (selecione e/ou adicione convidado)</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {coordenadores.map(coord => (
                  <label key={coord.id} className="flex items-center gap-1 border rounded px-2 py-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={fields.membrosPresentes.includes(coord.nome)}
                      onChange={() => handlePresenteToggle(coord.id, coord.nome)}
                    />
                    <span>{coord.nome}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 space-y-2">
                {fields.membrosManuais.map((nome, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={nome}
                      onChange={e => handleMembroManualChange(idx, e.target.value)}
                      className="border rounded p-2 flex-1"
                      placeholder="Nome do convidado"
                    />
                    <Button type="button" variant="ghost" onClick={() => handleRemoveMembroManual(idx)} title="Remover">×</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddMembroManual}>Adicionar membro convidado</Button>
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Abertura da Reunião</span>
              <textarea name="abertura" value={fields.abertura} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Relato dos Casos</span>
              <textarea name="relato" value={fields.relato} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Discussão das Medidas</span>
              <textarea name="discussao" value={fields.discussao} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Medida Votada</span>
                <input name="medidaVotada" value={fields.medidaVotada} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Votos Sim</span>
                <input name="votosSim" type="number" value={fields.votosSim} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Votos Não</span>
                <input name="votosNao" type="number" value={fields.votosNao} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Abstenções</span>
                <input name="votosAbstencao" type="number" value={fields.votosAbstencao} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-taxi-green">Resultado da Votação</span>
                <input name="resultadoVotacao" value={fields.resultadoVotacao} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Resultado Final</span>
              <textarea name="resultadoFinal" value={fields.resultadoFinal} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Encerramento</span>
              <textarea name="encerramento" value={fields.encerramento} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Data da Assinatura</span>
              <input name="dataAssinatura" type="date" value={fields.dataAssinatura || fields.data} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
            </label>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancelar</Button>
              <Button type="submit" className="w-full sm:w-auto">Revisar Ata</Button>
            </div>
          </form>
        ) : (
          <div>
            <h4 className="text-lg font-bold mb-2 text-taxi-green">Revisão da Ata</h4>
            <div id="ata-pdf-content" className="bg-white border rounded p-4 mb-4 shadow-md">
              <div dangerouslySetInnerHTML={{ __html: ataHtmlForPdf }} />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setStep('form')} className="w-full sm:w-auto">Editar</Button>
              <Button type="button" variant="secondary" onClick={handlePrint} className="w-full sm:w-auto flex items-center gap-2"><Printer className="h-4 w-4" /> Imprimir</Button>
              <Button type="button" variant="secondary" onClick={handleDownloadPDF} className="w-full sm:w-auto flex items-center gap-2"><Download className="h-4 w-4" /> Baixar PDF</Button>
              <Button type="button" onClick={handleSave} disabled={loading} className="w-full sm:w-auto">{loading ? 'Salvando...' : 'Salvar Ata'}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AtaFormModal; 