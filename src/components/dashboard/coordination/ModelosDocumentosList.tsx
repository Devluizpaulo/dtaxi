import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModeloDocumento } from "./types";

interface ModelosDocumentosListProps {
  modelos: ModeloDocumento[];
}

/**
 * Lista de modelos prontos de documentos para visualização e impressão.
 */
const ModelosDocumentosList: React.FC<ModelosDocumentosListProps> = ({ modelos }) => {
  return (
    <>
      {modelos.map((modelo, idx) => (
        <Card key={idx} className="mb-6">
          <CardHeader>
            <CardTitle>{modelo.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full border rounded p-2 font-mono text-sm min-h-[200px] mb-2"
              defaultValue={modelo.corpo}
              onChange={e => modelo.corpo = e.target.value}
            />
            <Button onClick={() => {
              const printWindow = window.open('', '', 'width=800,height=600');
              printWindow!.document.write(`<pre style='font-family:monospace;font-size:16px;'>${modelo.corpo.replace(/\n/g, '<br>')}</pre>`);
              printWindow!.document.close();
              printWindow!.print();
            }}>
              Imprimir Modelo
            </Button>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default ModelosDocumentosList; 