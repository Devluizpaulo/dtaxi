import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Send, Trash2, Plus, Copy, Search, CheckCircle, XCircle } from 'lucide-react';
import { Comunicado } from "./types";

interface ComunicadosListProps {
  comunicados: Comunicado[];
  loading: boolean;
  error?: string;
  onEdit: (com: Comunicado) => void;
  onDelete: (id: string) => void;
}

const isMobile = () => window.innerWidth < 640;

/**
 * Lista de comunicados com ações de envio, edição e exclusão.
 */
const ComunicadosList: React.FC<ComunicadosListProps> = ({ comunicados, loading, error, onEdit, onDelete }) => {
  const [filtro, setFiltro] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const comunicadosFiltrados = comunicados.filter(c =>
    (!filtro || (c.titulo && c.titulo.toLowerCase().includes(filtro.toLowerCase())))
  );

  const handleCopy = (mensagem: string, id: string) => {
    navigator.clipboard.writeText(mensagem);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Responsivo: cards para mobile
  if (typeof window !== 'undefined' && isMobile()) {
    return (
      <div className="space-y-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            className="pl-10 pr-4 py-2 w-full border rounded focus:ring-2 focus:ring-taxi-green"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </div>
        {loading && <div className="text-center text-muted-foreground py-8">Carregando comunicados...</div>}
        {error && <div className="text-center text-red-500 py-8">Erro ao carregar comunicados: {error}</div>}
        {comunicadosFiltrados.length === 0 && !loading && <div className="text-center text-muted-foreground py-8">Nenhum comunicado cadastrado.</div>}
        {comunicadosFiltrados.map(com => (
          <div key={com.id} className="rounded-lg shadow-md p-4 bg-white flex flex-col gap-2">
            <div className="font-bold text-lg text-taxi-green">{com.titulo}</div>
            <div className="text-gray-700 whitespace-pre-line">{com.mensagem}</div>
            <div className="text-xs text-gray-500">Data: {com.data}</div>
            <div className="text-xs text-gray-500">Enviado para: {com.enviadoPara || '-'}</div>
            <div className="flex gap-2 mt-2">
              <Button size="icon" variant="ghost" asChild title="Enviar WhatsApp">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(com.mensagem)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="h-4 w-4" />
                </a>
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onEdit(com)} title="Editar">
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleCopy(com.mensagem, com.id)} title="Copiar mensagem">
                {copiedId === com.id ? <CheckCircle className="h-4 w-4 text-taxi-green" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="destructive" onClick={() => setConfirmDelete(com.id)} title="Excluir">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {confirmDelete === com.id && (
              <div className="flex flex-col items-center bg-red-50 border border-red-200 rounded p-2 mt-2">
                <span className="text-red-700 text-sm mb-2">Tem certeza que deseja excluir?</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => { onDelete(com.id); setConfirmDelete(null); }}>Excluir</Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: tabela
  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por título..."
          className="pl-10 pr-4 py-2 w-full border rounded focus:ring-2 focus:ring-taxi-green"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Enviado para</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comunicadosFiltrados.map((com) => (
            <TableRow key={com.id}>
              <TableCell>{com.titulo}</TableCell>
              <TableCell className="max-w-xs truncate" title={com.mensagem}>{com.mensagem}</TableCell>
              <TableCell>{com.data}</TableCell>
              <TableCell>{com.enviadoPara || '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="icon" variant="ghost" asChild title="Enviar WhatsApp">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(com.mensagem)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onEdit(com)} title="Editar">
                  <Plus className="h-4 w-4 rotate-45" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleCopy(com.mensagem, com.id)} title="Copiar mensagem">
                  {copiedId === com.id ? <CheckCircle className="h-4 w-4 text-taxi-green" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="destructive" onClick={() => setConfirmDelete(com.id)} title="Excluir">
                  <Trash2 className="h-4 w-4" />
                </Button>
                {confirmDelete === com.id && (
                  <div className="absolute right-0 mt-2 bg-white border border-red-200 rounded shadow-lg p-4 z-50 flex flex-col items-center">
                    <span className="text-red-700 text-sm mb-2">Tem certeza que deseja excluir?</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive" onClick={() => { onDelete(com.id); setConfirmDelete(null); }}>Excluir</Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default ComunicadosList; 