import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X, Eye, Plus, Trash2, Printer, Download } from 'lucide-react';
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

  const docsFiltrados = documentos.filter(d =>
    (!filtro || (d.titulo && d.titulo.toLowerCase().includes(filtro.toLowerCase())))
  );

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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Portarias</CardTitle>
        </div>
        {onAdd && (
          <Button onClick={() => { setEditDoc(null); setShowModal(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Portaria
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <input type="text" placeholder="Buscar por título, data, responsável..." className="mb-4 w-full border rounded p-2" value={filtro} onChange={e => setFiltro(e.target.value)} />
        {docsFiltrados.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Nenhuma portaria cadastrada.</div>
        ) : (
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
                  <TableCell>{doc.titulo}</TableCell>
                  <TableCell>{doc.data || '-'}</TableCell>
                  <TableCell>{doc.descricao}</TableCell>
                  <TableCell>
                      <a href={doc.linkOrigem} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{doc.linkOrigem}</a>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => setVisualizar(doc)} title="Visualizar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditDoc(doc); setShowModal(true); }} title="Editar">
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => onDelete(doc.id!)} title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handlePrint(doc)} title="Imprimir">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDownloadPDF(doc)} title="Baixar PDF">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {/* Modal de visualização de portaria */}
      {visualizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl relative animate-fadeIn overflow-y-auto max-h-[95vh] flex flex-col">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none" onClick={() => setVisualizar(null)} aria-label="Fechar modal">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold mb-2 text-center text-taxi-green">{visualizar.titulo}</h3>
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