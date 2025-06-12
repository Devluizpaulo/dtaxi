import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Printer, Plus } from 'lucide-react';
import { Documento } from "./types";

interface DocumentosListProps {
  documentos: Documento[];
  loading: boolean;
  error?: string;
  onEdit: (doc: Documento) => void;
  onDelete: (id: string) => void;
  onImprimir: (doc: Documento) => void;
}

/**
 * Lista de documentos oficiais (atas, relatórios, portarias, etc).
 */
const DocumentosList: React.FC<DocumentosListProps> = ({ documentos, loading, error, onEdit, onDelete, onImprimir }) => {
  const [filtro, setFiltro] = useState('');
  const docsFiltrados = documentos.filter(d =>
    (!filtro || (d.titulo && d.titulo.toLowerCase().includes(filtro.toLowerCase())))
  );
  if (loading) return <div className="text-center text-muted-foreground py-8">Carregando documentos...</div>;
  if (error) return <div className="text-center text-red-500 py-8">Erro ao carregar documentos: {error}</div>;
  if (documentos.length === 0) return <div className="text-center text-muted-foreground py-8">Nenhum documento cadastrado.</div>;
  return (
    <>
      <input type="text" placeholder="Buscar por título, tipo..." className="mb-4 w-full border rounded p-2" value={filtro} onChange={e => setFiltro(e.target.value)} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docsFiltrados.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.tipo}</TableCell>
              <TableCell>{doc.titulo}</TableCell>
              <TableCell>{doc.data}</TableCell>
              <TableCell>{doc.observacoes || '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                {doc.arquivoUrl && (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={doc.arquivoUrl} download target="_blank" rel="noopener noreferrer" title="Baixar">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => onImprimir(doc)} title="Imprimir Modelo">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onEdit(doc)} title="Editar">
                  <Plus className="h-4 w-4 rotate-45" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => onDelete(doc.id)} title="Excluir">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default DocumentosList; 