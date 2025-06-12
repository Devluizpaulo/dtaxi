import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, Printer, MessageSquare, Mail } from 'lucide-react';
import { Reclamacao } from '@/hooks/useFirebaseData';

interface ReclamacoesCardProps {
  reclamacoes: Reclamacao[];
  reclamacoesArquivadas: Reclamacao[];
  onArquivar: (id: string) => Promise<void>;
}

export function ReclamacoesCard({ reclamacoes, reclamacoesArquivadas, onArquivar }: ReclamacoesCardProps) {
  const [exibirArquivo, setExibirArquivo] = useState(false);

  const handleImprimirReclamacao = (reclamacao: Reclamacao) => {
    const janelaImprimir = window.open('', '_blank');
    janelaImprimir?.document.write(`
      <html>
        <head>
          <title>Detalhes da Reclamação</title>
          <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            .modal-content { padding: 20px; }
            h2 { color: #333; }
            p { margin: 10px 0; }
            strong { color: #666; }
          </style>
        </head>
        <body>
          <div class="modal-content">
            <h2>Detalhes da Reclamação</h2>
            <p><strong>Nome:</strong> ${reclamacao.nome}</p>
            <p><strong>Email:</strong> ${reclamacao.email}</p>
            <p><strong>Telefone:</strong> ${reclamacao.telefone}</p>
            <p><strong>Tipo:</strong> ${reclamacao.tipo}</p>
            ${reclamacao.prefixo ? `<p><strong>Prefixo:</strong> ${reclamacao.prefixo}</p>` : ''}
            <p><strong>Mensagem:</strong> ${reclamacao.mensagem}</p>
            <p><strong>Data de Envio:</strong> ${reclamacao.dataEnvio.toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `);
    janelaImprimir?.document.close();
    janelaImprimir?.print();
    if (janelaImprimir) {
      janelaImprimir.onafterprint = () => {
        janelaImprimir?.close();
      };
    }
  };

  const handleWhatsAppResponse = (telefone: string, nome: string) => {
    const whatsappUrl = `https://wa.me/55${telefone}?text=${encodeURIComponent(`Olá ${nome}, recebemos sua reclamação:`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailResponse = (email: string, nome: string, mensagem: string) => {
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent('Resposta à sua reclamação')}&body=${encodeURIComponent(`Olá ${nome},\n\nRecebemos sua reclamação: ${mensagem}\n\nAtenciosamente,\nEquipe de Suporte`)}`;
    window.location.href = emailUrl;
  };

  const reclamacoesParaExibir = exibirArquivo ? reclamacoesArquivadas : reclamacoes;

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {exibirArquivo ? 'Reclamações Arquivadas' : 'Novas Reclamações'}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExibirArquivo(!exibirArquivo)}
        >
          {exibirArquivo ? 'Ver Novas' : 'Ver Arquivadas'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reclamacoesParaExibir.length > 0 ? (
            reclamacoesParaExibir.map((reclamacao) => (
              <div
                key={reclamacao.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{reclamacao.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {reclamacao.email} | {reclamacao.telefone}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reclamacao.dataEnvio.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Tipo: {reclamacao.tipo}</p>
                  {reclamacao.prefixo && (
                    <p className="text-sm font-medium">Prefixo: {reclamacao.prefixo}</p>
                  )}
                  <p className="text-sm mt-2">{reclamacao.mensagem}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImprimirReclamacao(reclamacao)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  {!reclamacao.arquivada && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onArquivar(reclamacao.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsAppResponse(reclamacao.telefone, reclamacao.nome)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmailResponse(reclamacao.email, reclamacao.nome, reclamacao.mensagem)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              {exibirArquivo
                ? 'Não há reclamações arquivadas.'
                : 'Não há novas reclamações.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 