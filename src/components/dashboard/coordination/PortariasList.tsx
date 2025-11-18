import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X, Eye, Pencil, Trash2, Printer, Download, Search, Plus } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PortariaModal from './PortariaModal';
import html2pdf from 'html2pdf.js'; // Agora com tipos adequados
import { Documento } from './types';

interface PortariasListProps {
  documentos: Documento[];
  onEdit: (doc: Documento) => void;
  onDelete: (id: string) => void;
  onVisualizar: (doc: Documento) => void;
  onImprimir: (doc: Documento) => void;
  onAdd?: (doc: Partial<Documento>) => Promise<void>;
  loading?: boolean;
}

const abntHtml = (doc: Documento) => `
  <div style="font-family: Times New Roman, serif; font-size: 14pt; margin: 3cm 2cm 2cm 3cm; line-height: 1.5; color: #222; text-align: justify;">
    <div style="text-align: center; font-weight: bold; font-size: 16pt; margin-bottom: 1.5em;">DTP - PORTARIA</div>
    <div style="text-align: center; font-weight: bold; font-size: 15pt; margin-bottom: 1.5em; text-transform: uppercase;">${doc.titulo}</div>
    <div style="text-align: center; font-size: 13pt; margin-bottom: 2em;">${doc.descricao}</div>
    <div style="margin-bottom: 2em;">${doc.conteudo.replace(/\n/g, '<br/>')}</div>
    <div style="margin-bottom: 2em;"><b>Link de Origem:</b> <a href='${doc.linkOrigem}' target='_blank' style='color: #1d4ed8; text-decoration: underline;'>${doc.linkOrigem}</a></div>
    <div style="margin-top: 3em; text-align: right;">${doc.data || ''}</div>
  </div>
`;

const PortariasList: React.FC<PortariasListProps> = ({ documentos, onEdit, onDelete, onVisualizar, onImprimir, onAdd, loading }) => {
  const [filtro, setFiltro] = useState('');

  const [visualizar, setVisualizar] = useState<Documento | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc] = useState<Documento | null>(null);

  const docsFiltrados = documentos.filter(d => {
    if (!filtro) return true;
    const termo = filtro.toLowerCase();
    return (
      (d.titulo && d.titulo.toLowerCase().includes(termo)) ||
      (d.descricao && d.descricao.toLowerCase().includes(termo)) ||
      (d.data && d.data.toLowerCase().includes(termo))
    );
  })
  .sort((a, b) => {
    const da = a.data ? new Date(a.data).getTime() : 0;
    const db = b.data ? new Date(b.data).getTime() : 0;
    return db - da; // mais recentes primeiro
  });

  const formatarData = (data?: string) => {
    if (!data) return '-';
    // se vier como ISO (yyyy-mm-dd), formatar em pt-BR
    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return data;
    return d.toLocaleDateString('pt-BR');
  };

  // Impressão ABNT
  const handlePrint = (doc: Documento) => {
    const html = abntHtml(doc);
    const printWindow = window.open('', '', 'width=900,height=1200');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Portaria DTP</title>
        <style>@media print { body { margin: 0; } }</style>
        </head><body>${html}</body></html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    }
  };

  // PDF ABNT
  const handleDownloadPDF = (doc: Documento) => {
    html2pdf().set({ margin: 0, filename: `Portaria_DTP_${doc.titulo}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
      .from({
        // @ts-ignore
        html: abntHtml(doc),
      }).save();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Portarias</CardTitle>
        </div>
        {onAdd && (
          <Button onClick={() => { setEditDoc(null); setShowModal(true); }} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" /> Nova Portaria
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título, descrição ou data..."
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </div>
        {docsFiltrados.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            Nenhuma portaria encontrada.
          </div>
        ) : (
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Link/Origem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docsFiltrados.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={doc.titulo}>{doc.titulo}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-gray-700">{formatarData(doc.data)}</TableCell>
                    <TableCell className="max-w-sm text-sm text-gray-700 truncate" title={doc.descricao}>{doc.descricao}</TableCell>
                    <TableCell className="max-w-sm text-sm">
                      {doc.linkOrigem ? (
                        <a
                          href={doc.linkOrigem}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {doc.linkOrigem}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => setVisualizar(doc)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Visualizar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => { setEditDoc(doc); setShowModal(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => handlePrint(doc)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Imprimir</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => handleDownloadPDF(doc)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Baixar PDF</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="destructive" onClick={() => onDelete(doc.id!)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        )}
      </CardContent>

      {/* Modal de visualização de portaria */}
      {visualizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-3xl lg:max-w-4xl relative animate-fadeIn overflow-y-auto max-h-[95vh] flex flex-col">

            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none" onClick={() => setVisualizar(null)} aria-label="Fechar modal">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold mb-1 text-center text-taxi-green">{visualizar.titulo}</h3>
            <div className="mb-1 text-center text-sm text-gray-500">
              {formatarData(visualizar.data)}
            </div>
            <div className="mb-2 text-center text-gray-600">{visualizar.descricao}</div>
            <div className="border rounded p-4 bg-gray-50 mb-2 font-serif text-justify text-base leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>{visualizar.conteudo}</div>
            <div className="mt-2 text-center">
              <a href={visualizar.linkOrigem} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">Conferir link de origem</a>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => handlePrint(visualizar)} className="flex items-center gap-2 w-full sm:w-auto"><Printer className="h-4 w-4" /> Imprimir</Button>
              <Button variant="secondary" onClick={() => handleDownloadPDF(visualizar)} className="flex items-center gap-2 w-full sm:w-auto"><Download className="h-4 w-4" /> Baixar PDF</Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de cadastro/edição */}
      {showModal && (
        <PortariaModal
          open={showModal}
          onCancel={() => { setShowModal(false); setEditDoc(null); }}
          onSave={async (portaria) => {
            await (editDoc ? onEdit({ ...editDoc, ...portaria }) : onAdd?.(portaria));
            setShowModal(false);
            setEditDoc(null);
          }}
          portaria={editDoc}
          loading={loading}
        />
      )}
    </Card>
  );
};

export default PortariasList;