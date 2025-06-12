import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer, Download } from 'lucide-react';
import { Documento } from './types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface RelatorioOcorrenciaFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (doc: Partial<Documento>) => Promise<void>;
  documento?: Documento | null;
  loading?: boolean;
}

const camposIniciais = (doc?: Documento | null) => ({
  dataHora: doc?.data || '',
  local: doc?.local || '',
  taxi: doc?.numero || '',
  motorista: doc?.motorista || '',
  descricao: doc?.descricao || '',
  detalhes: doc?.detalhes || '',
  testemunhas: doc?.testemunhas ? JSON.parse(doc.testemunhas) : [],
  acoes: doc?.acoes || '',
  comentarios: doc?.comentarios || '',
  responsavel: doc?.responsavel || '',
  dataAssinatura: doc?.dataAssinatura || '',
});

const RelatorioOcorrenciaFormModal: React.FC<RelatorioOcorrenciaFormModalProps> = ({ open, onCancel, onSave, documento, loading }) => {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [fields, setFields] = useState(camposIniciais(documento));

  React.useEffect(() => {
    setFields(camposIniciais(documento));
    setStep('form');
  }, [documento, open]);

  // Texto formal ABNT
  const relatorioTexto = useMemo(() => {
    const testemunhas = fields.testemunhas.map((t: any, i: number) => `  - ${t.nome} (${t.contato})`).join('\n');
    let agradecimento = '';
    if (fields.testemunhas.length > 0) {
      agradecimento = `\nAgradecemos a colaboração das testemunhas: ${fields.testemunhas.map((t: any) => t.nome).join(', ')}.`;
    }
    return `D-TAXI SP\nRELATÓRIO DE OCORRÊNCIA\n\nRelatório de Ocorrência - D-Taxi SP\n\nData e Hora do Incidente: ${fields.dataHora}\nLocal do Incidente: ${fields.local}\nNúmero do Táxi: ${fields.taxi}\nNome do Motorista: ${fields.motorista}\n\n1. Descrição do Incidente\n    ${fields.descricao}\n\n2. Detalhes do Incidente\n    ${fields.detalhes}\n\n3. Testemunhas\n${testemunhas || '    Nenhuma'}${agradecimento}\n\n4. Ações Tomadas\n    ${fields.acoes}\n\n5. Comentários Adicionais\n    ${fields.comentarios}\n\nAssinatura do Responsável:\nNome: ${fields.responsavel}\nData: ${fields.dataAssinatura}`;
  }, [fields]);

  // HTML para PDF/Impressão (ABNT)
  const relatorioHtmlForPdf = useMemo(() => {
    const testemunhas = fields.testemunhas.map((t: any, i: number) => `<div style='margin-left:2em;'>- ${t.nome} (${t.contato})</div>`).join('');
    let agradecimento = '';
    if (fields.testemunhas.length > 0) {
      agradecimento = `<br/><span style='font-style:italic;'>Agradecemos a colaboração das testemunhas: ${fields.testemunhas.map((t: any) => t.nome).join(', ')}.</span>`;
    }
    return `
      <div style="font-family: Times New Roman, serif; font-size: 14pt; margin: 3cm 2cm 2cm 3cm; line-height: 1.5; color: #222; text-align: justify;">
        <div style="text-align: center; font-weight: bold; font-size: 16pt; margin-bottom: 1.5em;">D-TAXI SP</div>
        <div style="text-align: center; font-weight: bold; font-size: 15pt; margin-bottom: 1.5em; text-transform: uppercase;">RELATÓRIO DE OCORRÊNCIA</div>
        <div style="text-align: center; font-size: 13pt; margin-bottom: 2em;">Relatório de Ocorrência - D-Taxi SP</div>
        <div style="margin-bottom: 1em;"><b>Data e Hora do Incidente:</b> ${fields.dataHora}</div>
        <div style="margin-bottom: 1em;"><b>Local do Incidente:</b> ${fields.local}</div>
        <div style="margin-bottom: 1em;"><b>Número do Táxi:</b> ${fields.taxi}</div>
        <div style="margin-bottom: 1em;"><b>Nome do Motorista:</b> ${fields.motorista}</div>
        <div style="margin-bottom: 1em;"><b>1. Descrição do Incidente</b><br/><span style="margin-left:2em;">${fields.descricao}</span></div>
        <div style="margin-bottom: 1em;"><b>2. Detalhes do Incidente</b><br/><span style="margin-left:2em;">${fields.detalhes}</span></div>
        <div style="margin-bottom: 1em;"><b>3. Testemunhas</b>${testemunhas || '<span style=\'margin-left:2em;\'>Nenhuma</span>'}${agradecimento}</div>
        <div style="margin-bottom: 1em;"><b>4. Ações Tomadas</b><br/><span style="margin-left:2em;">${fields.acoes}</span></div>
        <div style="margin-bottom: 1em;"><b>5. Comentários Adicionais</b><br/><span style="margin-left:2em;">${fields.comentarios}</span></div>
        <div style="margin: 2em 0 1em 0;">Assinatura do Responsável:</div>
        <div style="margin-bottom: 1em;"><b>Nome:</b> ${fields.responsavel}</div>
        <div style="margin-bottom: 3em;"><b>Data:</b> ${fields.dataAssinatura}</div>
        <div style="margin-top: 3em; text-align: center;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2em;">
            <div>
              <div style="border-top: 1px solid #222; width: 300px; margin: 0 auto 0.2em auto;"></div>
              <div>${fields.responsavel}<br/>Responsável pelo Relatório</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }, [fields]);

  // PDF download (ABNT)
  const handleDownloadPDF = () => {
    html2pdf().set({ margin: 0, filename: `Relatorio_Ocorrencia_${fields.dataHora}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
      .from({
        // @ts-ignore
        html: relatorioHtmlForPdf,
      }).save();
  };

  // Impressão formal
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=1200');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Relatório de Ocorrência</title>
        <style>@media print { body { margin: 0; } }</style>
        </head><body>${relatorioHtmlForPdf}</body></html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
  };

  const handleTestemunhaChange = (idx: number, campo: 'nome' | 'contato', value: string) => {
    setFields(f => {
      const arr = [...f.testemunhas];
      arr[idx] = { ...arr[idx], [campo]: value };
      return { ...f, testemunhas: arr };
    });
  };
  const handleAddTestemunha = () => {
    setFields(f => ({ ...f, testemunhas: [...f.testemunhas, { nome: '', contato: '' }] }));
  };
  const handleRemoveTestemunha = (idx: number) => {
    setFields(f => {
      const arr = [...f.testemunhas];
      arr.splice(idx, 1);
      return { ...f, testemunhas: arr };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleSave = async () => {
    await onSave({
      tipo: 'Relatório de Ocorrência',
      titulo: `Relatório de Ocorrência - ${fields.dataHora}`,
      data: fields.dataHora,
      local: fields.local,
      numero: fields.taxi,
      motorista: fields.motorista,
      descricao: fields.descricao,
      detalhes: fields.detalhes,
      testemunhas: JSON.stringify(fields.testemunhas),
      acoes: fields.acoes,
      comentarios: fields.comentarios,
      responsavel: fields.responsavel,
      dataAssinatura: fields.dataAssinatura,
      texto: relatorioTexto,
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
          {documento ? 'Editar Relatório de Ocorrência' : 'Novo Relatório de Ocorrência'}
        </h3>
        {step === 'form' ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Data e Hora do Incidente</span>
                <input name="dataHora" type="datetime-local" value={fields.dataHora} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Local do Incidente</span>
                <input name="local" value={fields.local} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Número do Táxi</span>
                <input name="taxi" value={fields.taxi} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Nome do Motorista</span>
                <input name="motorista" value={fields.motorista} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Descrição do Incidente</span>
              <textarea name="descricao" value={fields.descricao} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Detalhes do Incidente</span>
              <textarea name="detalhes" value={fields.detalhes} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <div>
              <span className="text-sm font-semibold text-taxi-green">Testemunhas</span>
              <div className="space-y-2 mt-2">
                {fields.testemunhas.map((t: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={t.nome}
                      onChange={e => handleTestemunhaChange(idx, 'nome', e.target.value)}
                      className="border rounded p-2 flex-1"
                      placeholder="Nome"
                    />
                    <input
                      type="text"
                      value={t.contato}
                      onChange={e => handleTestemunhaChange(idx, 'contato', e.target.value)}
                      className="border rounded p-2 flex-1"
                      placeholder="Contato"
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveTestemunha(idx)} title="Remover">×</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddTestemunha}>Adicionar testemunha</Button>
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Ações Tomadas</span>
              <textarea name="acoes" value={fields.acoes} onChange={handleChange} rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Comentários Adicionais</span>
              <textarea name="comentarios" value={fields.comentarios} onChange={handleChange} rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Responsável</span>
                <input name="responsavel" value={fields.responsavel} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Data da Assinatura</span>
                <input name="dataAssinatura" type="date" value={fields.dataAssinatura} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancelar</Button>
              <Button type="submit" className="w-full sm:w-auto">Revisar Relatório</Button>
            </div>
          </form>
        ) : (
          <div>
            <h4 className="text-lg font-bold mb-2 text-taxi-green">Revisão do Relatório</h4>
            <div id="relatorio-pdf-content" className="bg-white border rounded p-4 mb-4 shadow-md">
              <div dangerouslySetInnerHTML={{ __html: relatorioHtmlForPdf }} />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setStep('form')} className="w-full sm:w-auto">Editar</Button>
              <Button type="button" variant="secondary" onClick={handlePrint} className="w-full sm:w-auto flex items-center gap-2"><Printer className="h-4 w-4" /> Imprimir</Button>
              <Button type="button" variant="secondary" onClick={handleDownloadPDF} className="w-full sm:w-auto flex items-center gap-2"><Download className="h-4 w-4" /> Baixar PDF</Button>
              <Button type="button" onClick={handleSave} disabled={loading} className="w-full sm:w-auto">{loading ? 'Salvando...' : 'Salvar Relatório'}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatorioOcorrenciaFormModal; 