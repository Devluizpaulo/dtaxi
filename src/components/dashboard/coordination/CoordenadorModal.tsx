import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Coordenador } from "./types";

interface CoordenadorModalProps {
  coordenador?: Coordenador | null;
  open: boolean;
  loading?: boolean;
  onSave: (coordenador: Coordenador) => Promise<void>;
  onCancel: () => void;
}

/**
 * Modal para cadastro/edição de coordenador.
 */
const CoordenadorModal: React.FC<CoordenadorModalProps> = ({ coordenador, open, loading, onSave, onCancel }) => {
  const nomeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open && nomeRef.current) nomeRef.current.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2" onClick={onCancel} aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-bold mb-4">{coordenador ? 'Editar Coordenador' : 'Novo Coordenador'}</h3>
        <form onSubmit={async e => {
          e.preventDefault();
          const form = e.target as typeof e.target & Record<string, any>;
          const novoCoord: Coordenador = {
            id: coordenador?.id || Math.random().toString(36).slice(2),
            nome: form.nome.value,
            email: form.email.value,
            telefone: form.telefone.value,
            status: form.status.value,
            regiao: ''
          };
          await onSave(novoCoord);
        }}>
          <div className="grid grid-cols-1 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Nome</span>
              <input name="nome" ref={nomeRef} defaultValue={coordenador?.nome} required className="mt-1 block w-full border rounded p-2" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input name="email" type="email" defaultValue={coordenador?.email} required className="mt-1 block w-full border rounded p-2" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Telefone</span>
              <input name="telefone" defaultValue={coordenador?.telefone} required className="mt-1 block w-full border rounded p-2" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Status</span>
              <select name="status" defaultValue={coordenador?.status || 'ativo'} className="mt-1 block w-full border rounded p-2">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoordenadorModal; 