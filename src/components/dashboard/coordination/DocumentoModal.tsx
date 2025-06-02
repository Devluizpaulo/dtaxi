import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Documento } from "./types";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DocumentoModalProps {
  tipo: string;
  documento?: Documento | null;
  open: boolean;
  loading?: boolean;
  onSave: (doc: any) => Promise<void>;
  onCancel: () => void;
}

const camposIniciais = (tipo: string, doc?: Documento | null) => {
  if (tipo === 'Portaria') {
    return {
      titulo: doc?.titulo || '',
      descricao: doc?.descricao || '',
      conteudo: doc?.conteudo || '',
      linkOrigem: doc?.linkOrigem || '',
    };
  } else if (tipo === 'Relatório de Ocorrência') {
    return {
      titulo: doc?.titulo || '',
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
    };
  } else if (tipo === 'Ata de Comissão de Ética') {
    return {
      titulo: doc?.titulo || '',
      data: doc?.data || '',
      local: doc?.local || '',
      presidente: doc?.presidente || '',
      membrosPresentes: doc?.membrosPresentes || '',
      membrosConvidados: doc?.membrosConvidados || '',
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
    };
  } else {
    return {
      titulo: doc?.titulo || '',
      data: doc?.data || '',
      descricao: doc?.descricao || '',
    };
  }
};

const modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const DocumentoModal: React.FC<DocumentoModalProps> = ({ tipo, documento, open, loading, onSave, onCancel }) => {
  const [fields, setFields] = useState<any>(camposIniciais(tipo, documento));

  useEffect(() => {
    setFields(camposIniciais(tipo, documento));
  }, [tipo, documento, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((f: any) => ({ ...f, [name]: value }));
  };

  // Testemunhas para Relatório de Ocorrência
  const handleTestemunhaChange = (idx: number, campo: 'nome' | 'contato', value: string) => {
    setFields((f: any) => {
      const arr = [...f.testemunhas];
      arr[idx] = { ...arr[idx], [campo]: value };
      return { ...f, testemunhas: arr };
    });
  };
  const handleAddTestemunha = () => {
    setFields((f: any) => ({ ...f, testemunhas: [...(f.testemunhas || []), { nome: '', contato: '' }] }));
  };
  const handleRemoveTestemunha = (idx: number) => {
    setFields((f: any) => {
      const arr = [...f.testemunhas];
      arr.splice(idx, 1);
      return { ...f, testemunhas: arr };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let doc = { ...fields, tipo };
    if (tipo === 'Relatório de Ocorrência') {
      doc = { ...doc, testemunhas: JSON.stringify(fields.testemunhas) };
    }
    await onSave(doc);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl relative animate-fadeIn overflow-y-auto max-h-[95vh]">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none" onClick={onCancel} aria-label="Fechar modal">
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-taxi-green text-center">{documento ? `Editar ${tipo}` : `Novo ${tipo}`}</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
            {tipo === 'Portaria' && (
              <>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Título</span>
                <input name="titulo" value={fields.titulo} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
                </label>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Descrição</span>
                <textarea name="descricao" value={fields.descricao} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
                </label>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Conteúdo da Portaria</span>
                <ReactQuill value={fields.conteudo} onChange={(value) => setFields((f: any) => ({ ...f, conteudo: value }))} modules={modules} />
                </label>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Link de Origem</span>
                <input name="linkOrigem" value={fields.linkOrigem} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
                </label>
              </>
            )}
            {tipo === 'Relatório de Ocorrência' && (
              <>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Título</span>
                <input name="titulo" value={fields.titulo} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
                </label>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Data e Hora do Incidente</span>
                <input name="dataHora" type="datetime-local" value={fields.dataHora} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
                </label>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Local do Incidente</span>
                <input name="local" value={fields.local} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
                </label>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Número do Táxi</span>
                <input name="taxi" value={fields.taxi} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
                </label>
                <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Nome do Motorista</span>
                <input name="motorista" value={fields.motorista} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
                </label>
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
            </>
          )}
          {tipo === 'Ata de Comissão de Ética' && (
            <>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Título</span>
                <input name="titulo" value={fields.titulo} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Data</span>
                <input name="data" type="date" value={fields.data} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Local</span>
                <input name="local" value={fields.local} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Presidente</span>
                <input name="presidente" value={fields.presidente} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Membros Presentes</span>
                <input name="membrosPresentes" value={fields.membrosPresentes} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" placeholder="Separe por vírgula" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Membros Convidados</span>
                <input name="membrosConvidados" value={fields.membrosConvidados} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" placeholder="Separe por vírgula" />
              </label>
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
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Medida Votada</span>
                <input name="medidaVotada" value={fields.medidaVotada} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              </div>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Resultado da Votação</span>
                <input name="resultadoVotacao" value={fields.resultadoVotacao} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
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
                <input name="dataAssinatura" type="date" value={fields.dataAssinatura} onChange={handleChange} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
            </>
          )}
          {tipo !== 'Portaria' && tipo !== 'Relatório de Ocorrência' && tipo !== 'Ata de Comissão de Ética' && (
            <>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Título</span>
                <input name="titulo" value={fields.titulo} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Data</span>
                <input name="data" type="date" value={fields.data} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-taxi-green">Descrição</span>
                <textarea name="descricao" value={fields.descricao} onChange={handleChange} required rows={2} className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none" />
                </label>
              </>
            )}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentoModal; 