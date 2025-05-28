import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Documento } from './types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';

interface Portaria {
  id?: string;
  titulo: string;
  descricao: string;
  conteudo: string;
  linkOrigem: string;
}

interface PortariaModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (portaria: Partial<Portaria>) => Promise<void>;
  portaria?: Portaria | null;
  loading?: boolean;
}

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
    ['emoji'],
    ['clean'],
  ],
  'emoji-toolbar': true,
  'emoji-textarea': false,
  'emoji-shortname': true,
};

const PortariaModal: React.FC<PortariaModalProps> = ({ open, onCancel, onSave, portaria, loading }) => {
  const [fields, setFields] = useState<Portaria>({
    titulo: '',
    descricao: '',
    conteudo: '',
    linkOrigem: '',
  });
  const [conteudo, setConteudo] = useState('');

  useEffect(() => {
    setFields({
      titulo: portaria?.titulo || '',
      descricao: portaria?.descricao || '',
      conteudo: portaria?.conteudo || '',
      linkOrigem: portaria?.linkOrigem || '',
    });
    setConteudo(portaria?.conteudo || '');
  }, [portaria, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...fields, conteudo });
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
          {portaria ? 'Editar Portaria DTP' : 'Nova Portaria DTP'}
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <ReactQuill value={conteudo} onChange={setConteudo} modules={modules} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-taxi-green">Link de Origem</span>
            <input name="linkOrigem" value={fields.linkOrigem} onChange={handleChange} required className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition" />
          </label>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancelar</Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? 'Salvando...' : 'Salvar Portaria'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortariaModal; 