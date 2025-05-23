import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Comunicado } from "./types";

interface ComunicadoModalProps {
  comunicado?: Comunicado | null;
  open: boolean;
  loading?: boolean;
  onSave: (com: Comunicado) => Promise<void>;
  onCancel: () => void;
}

/**
 * Modal de formulário para criação/edição de comunicados.
 */
const ComunicadoModal: React.FC<ComunicadoModalProps> = ({ comunicado, open, loading, onSave, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none"
          onClick={onCancel}
          aria-label="Fechar modal"
        >
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-taxi-green text-center">
          {comunicado ? 'Editar Comunicado' : 'Novo Comunicado'}
        </h3>
        <form
          className="space-y-4"
          onSubmit={async e => {
          e.preventDefault();
          const form = e.target as typeof e.target & { titulo: { value: string }, mensagem: { value: string }, data: { value: string }, enviadoPara: { value: string } };
          const novoCom: Comunicado = {
            id: comunicado?.id || Math.random().toString(36).slice(2),
            titulo: form.titulo.value,
            mensagem: form.mensagem.value,
            data: form.data.value,
            enviadoPara: form.enviadoPara.value,
          };
          await onSave(novoCom);
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Título</span>
              <input
                name="titulo"
                defaultValue={comunicado?.titulo}
                required
                className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-taxi-green">Mensagem</span>
              <textarea
                name="mensagem"
                defaultValue={comunicado?.mensagem}
                required
                rows={4}
                className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition resize-none"
              />
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex-1">
                <span className="text-sm font-semibold text-taxi-green">Data</span>
                <input
                  name="data"
                  type="date"
                  defaultValue={comunicado?.data}
                  required
                  className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition"
                />
            </label>
              <label className="flex-1">
                <span className="text-sm font-semibold text-taxi-green">Enviado para (opcional)</span>
                <input
                  name="enviadoPara"
                  defaultValue={comunicado?.enviadoPara}
                  className="mt-1 block w-full border-2 border-taxi-green/30 rounded-lg p-2 focus:ring-2 focus:ring-taxi-green focus:border-taxi-green transition"
                />
            </label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-taxi-yellow"></span> Salvando...</span>
              ) : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComunicadoModal; 