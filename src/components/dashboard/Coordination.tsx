import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Printer } from 'lucide-react';
import { useFirestore } from "@/hooks/useFirestore";
import { toast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PortariasList from './coordination/PortariasList';
import CoordenadoresList from './coordination/CoordenadoresList';
import DocumentosList from './coordination/DocumentosList';
import ComunicadosList from './coordination/ComunicadosList';
import DocumentoModal from './coordination/DocumentoModal';
import ComunicadoModal from './coordination/ComunicadoModal';
import ModelosDocumentosList from './coordination/ModelosDocumentosList';
import { Coordenador, Documento, Comunicado, ModeloDocumento } from './coordination/types';
import CoordenadorModal from './coordination/CoordenadorModal';
import AtaFormModal from './coordination/AtaFormModal';
import RelatorioOcorrenciaFormModal from './coordination/RelatorioOcorrenciaFormModal';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useAuth } from '@/hooks/useAuth';
import IntegracaoMotoristas from '@/components/integracao/IntegracaoMotoristas';

const tiposDocumento = [
  'Ata',
  'Relatório',
  'Comunicação Interna',
  'Comunicação Externa',
  'Suspensão',
  'Geral',
  'Portaria',
  'Outro',
];

const modelosProntos: ModeloDocumento[] = [
  {
    titulo: 'Portaria de Nomeação',
    corpo: `PORTARIA Nº ___/____\n\nO Presidente da Comissão de Ética da [Instituição], no uso de suas atribuições, resolve:\n\nArt. 1º Nomear [NOME COMPLETO], para exercer a função de [FUNÇÃO], a partir de [DATA].\n\nArt. 2º Esta portaria entra em vigor na data de sua publicação.\n\n[Local], [Data].\n\nSr. Mauricio Alonso\nPresidente da Comissão de Ética`,
  },
  {
    titulo: 'Portaria de Instauração de Processo',
    corpo: `PORTARIA Nº ___/____\n\nO Presidente da Comissão de Ética da [Instituição], no uso de suas atribuições, resolve:\n\nArt. 1º Instaurar processo ético-disciplinar para apuração dos fatos constantes no relatório nº [NÚMERO], referente a [DESCRIÇÃO].\n\nArt. 2º Designar [NOME COMPLETO] como relator do processo.\n\nArt. 3º Esta portaria entra em vigor na data de sua publicação.\n\n[Local], [Data].\n\nSr. Mauricio Alonso\nPresidente da Comissão de Ética`,
  },
  {
    titulo: 'Relatório de Ocorrência - D-Táxi',
    corpo: `RELATÓRIO DE OCORRÊNCIA - D-TÁXI\n\nInformações Gerais:\nData e Hora do Incidente: [DATA_HORA]\nLocal do Incidente: [LOCAL]\nNúmero do Táxi (se aplicável): [TAXI]\nNome do Motorista: [MOTORISTA]\nDescrição do Incidente: [DESCRICAO]\n\nDetalhes do Incidente:\n[DETALHES]\n\nTestemunhas (se houver):\nNome: [TESTEMUNHA_NOME]\nContato: [TESTEMUNHA_CONTATO]\n\nAções Tomadas:\n[ACOES]\n\nComentários Adicionais:\n[COMENTARIOS]\n\nAssinatura do Responsável:\nNome: [RESPONSAVEL]\nData: [DATA_ASSINATURA]`
  }
];

const Coordination = () => {
  const [activeTab, setActiveTab] = useState("coordenadores");
  const [showDocModal, setShowDocModal] = useState(false);
  const [showComModal, setShowComModal] = useState(false);
  const [docEdit, setDocEdit] = useState<Documento | null>(null);
  const [comEdit, setComEdit] = useState<Comunicado | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const [portariaVisualizar, setPortariaVisualizar] = useState<Documento | null>(null);
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [coordEdit, setCoordEdit] = useState<Coordenador | null>(null);
  const { user } = useAuth();
  const { temPermissao } = usePermissoes(user);

  // Firestore hooks
  const {
    data: documentos = [],
    add: addDocumento,
    update: updateDocumento,
    remove: removeDocumento,
    loading: documentosLoading,
    error: documentosError
  } = useFirestore<Documento>({ collectionName: 'documentos', orderByField: 'data' });

  const {
    data: comunicados = [],
    add: addComunicado,
    update: updateComunicado,
    remove: removeComunicado,
    loading: comunicadosLoading,
    error: comunicadosError
  } = useFirestore<Comunicado>({ collectionName: 'comunicados', orderByField: 'data' });

  const {
    data: coordenadores = [],
    add: addCoordenador,
    update: updateCoordenador,
    remove: removeCoordenador,
    loading: coordenadoresLoading,
    error: coordenadoresError
  } = useFirestore<Coordenador>({ collectionName: 'coordenadores', orderByField: 'nome' });

  const {
    data: portarias = [],
    add: addPortaria,
    update: updatePortaria,
    remove: removePortaria,
    loading: portariasLoading,
    error: portariasError
  } = useFirestore<Documento>({ collectionName: 'portarias', orderByField: 'titulo' });

  // Handlers
  function imprimirPortaria(doc: Documento) {
    if (doc.pdfUrl) {
      window.open(doc.pdfUrl, '_blank');
    } else if (doc.texto) {
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow!.document.write(`<pre style='font-family:monospace;font-size:16px;'>${doc.texto.replace(/\n/g, '<br>')}</pre>`);
      printWindow!.document.close();
      printWindow!.print();
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coordenação</h2>
          <p className="text-muted-foreground">Gerenciamento de coordenadores e suas regiões de atuação</p>
        </div>
      </div>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="mb-4 overflow-x-auto whitespace-nowrap flex gap-2 sm:grid sm:grid-cols-6 scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <TabsTrigger value="coordenadores">Coordenadores</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="comunicados">Comunicados</TabsTrigger>
          <TabsTrigger value="portarias">Portarias</TabsTrigger>
          <TabsTrigger value="modelos-documentos">Modelos de Documentos</TabsTrigger>
          <TabsTrigger value="integracao">Integração</TabsTrigger>
        </TabsList>
        {/* Coordenadores */}
        <TabsContent value="coordenadores" className="space-y-4 px-1 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Coordenadores</CardTitle>
              <CardDescription>Equipe responsável pela coordenação dos motoristas</CardDescription>
              <Button className="mt-2" onClick={() => {
                if (temPermissao('coordenadores:criar')) {
                  setCoordEdit(null); setShowCoordModal(true);
                } else {
                  toast({ title: 'Você não tem permissão para adicionar coordenador.' });
                }
              }}>
                Adicionar Coordenador
              </Button>
            </CardHeader>
            <CardContent>
              <CoordenadoresList
                coordenadores={coordenadores}
                loading={coordenadoresLoading}
                error={coordenadoresError}
                onEdit={coordenador => { if (temPermissao('coordenadores:editar')) { setCoordEdit(coordenador); setShowCoordModal(true); } }}
                onDelete={async (id) => {
                  await removeCoordenador(id);
                  toast({ title: 'Coordenador excluído com sucesso!' });
                }}
                podeEditar={temPermissao('coordenadores:editar')}
                podeExcluir={temPermissao('coordenadores:deletar')}
              />
            </CardContent>
          </Card>
          <CoordenadorModal
            coordenador={coordEdit}
            open={showCoordModal}
            loading={false}
            onSave={async novoCoord => {
              if (coordEdit) {
                await updateCoordenador(novoCoord.id, novoCoord);
                toast({ title: 'Coordenador atualizado com sucesso!' });
              } else {
                await addCoordenador(novoCoord);
                toast({ title: 'Coordenador adicionado com sucesso!' });
              }
              setShowCoordModal(false);
              setCoordEdit(null);
            }}
            onCancel={() => { setShowCoordModal(false); setCoordEdit(null); }}
          />
        </TabsContent>
        {/* Documentos */}
        <TabsContent value="documentos" className="space-y-4 px-1 sm:px-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documentos Oficiais</CardTitle>
                <CardDescription>Atas, relatórios, portarias e outros documentos</CardDescription>
              </div>
              <Button onClick={() => { setTipoSelecionado(null); setShowDocModal(true); }}>Novo Documento</Button>
            </CardHeader>
            <CardContent>
              <DocumentosList
                documentos={documentos}
                loading={documentosLoading}
                error={documentosError}
                onEdit={doc => {
                  if (temPermissao('documentos:editar')) {
                    setDocEdit(doc); setShowDocModal(true); setTipoSelecionado(doc.tipo);
                  } else {
                    toast({ title: 'Você não tem permissão para editar documentos.' });
                  }
                }}
                onDelete={id => {
                  if (temPermissao('documentos:deletar')) {
                    removeDocumento(id);
                  } else {
                    toast({ title: 'Você não tem permissão para excluir documentos.' });
                  }
                }}
                onImprimir={imprimirPortaria}
              />
            </CardContent>
          </Card>
          {/* Modal de seleção de tipo de documento */}
          {showDocModal && !tipoSelecionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button className="absolute top-2 right-2" onClick={() => setShowDocModal(false)}>
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-xl font-bold mb-4">Escolha o tipo de documento</h3>
                <div className="space-y-3">
                  {tiposDocumento.map(tipo => (
                    <Button key={tipo} className="w-full" onClick={() => setTipoSelecionado(tipo)}>{tipo}</Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Modal de formulário dinâmico para cada tipo */}
          {tipoSelecionado === 'Ata' && (
            <AtaFormModal
              open={showDocModal && tipoSelecionado === 'Ata'}
              onCancel={() => { setShowDocModal(false); setTipoSelecionado(null); setDocEdit(null); }}
              onSave={async novoDoc => {
                if (docEdit) {
                  await updateDocumento(docEdit.id, novoDoc);
                } else {
                  await addDocumento(novoDoc);
                }
                setShowDocModal(false);
                setTipoSelecionado(null);
                setDocEdit(null);
                toast({ title: 'Ata salva com sucesso!' });
              }}
              coordenadores={coordenadores}
              documento={docEdit}
              loading={documentosLoading}
            />
          )}
          {tipoSelecionado === 'Relatório' && (
            <RelatorioOcorrenciaFormModal
              open={showDocModal && tipoSelecionado === 'Relatório'}
              onCancel={() => { setShowDocModal(false); setTipoSelecionado(null); setDocEdit(null); }}
              onSave={async novoDoc => {
                if (docEdit) {
                  await updateDocumento(docEdit.id, novoDoc);
                } else {
                  await addDocumento(novoDoc);
                }
                setShowDocModal(false);
                setTipoSelecionado(null);
                setDocEdit(null);
                toast({ title: 'Relatório salvo com sucesso!' });
              }}
              documento={docEdit}
              loading={documentosLoading}
            />
          )}
          {tipoSelecionado && tipoSelecionado !== 'Ata' && tipoSelecionado !== 'Relatório' && (
            <DocumentoModal
              tipo={tipoSelecionado || ''}
              documento={docEdit}
              open={showDocModal && !!tipoSelecionado}
              onSave={async novoDoc => {
                if (docEdit) {
                  await updateDocumento(docEdit.id, { ...novoDoc, tipo: tipoSelecionado });
                } else {
                  await addDocumento({ ...novoDoc, tipo: tipoSelecionado });
                }
                setShowDocModal(false);
                setTipoSelecionado(null);
                setDocEdit(null);
                toast({ title: 'Documento salvo com sucesso!' });
              }}
              onCancel={() => { setShowDocModal(false); setTipoSelecionado(null); setDocEdit(null); }}
              loading={documentosLoading}
            />
          )}
        </TabsContent>
        <TabsContent value="comunicados" className="space-y-4 px-1 sm:px-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Comunicados</CardTitle>
                <CardDescription>Envie comunicados para grupos ou pessoas via WhatsApp</CardDescription>
              </div>
              <Button onClick={() => { setComEdit(null); setShowComModal(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Novo Comunicado
              </Button>
            </CardHeader>
            <CardContent>
              <ComunicadosList
                comunicados={comunicados}
                loading={comunicadosLoading}
                error={comunicadosError}
                onEdit={com => {
                  if (temPermissao('comunicados:editar')) {
                    setComEdit(com); setShowComModal(true);
                  } else {
                    toast({ title: 'Você não tem permissão para editar comunicados.' });
                  }
                }}
                onDelete={id => {
                  if (temPermissao('comunicados:deletar')) {
                    removeComunicado(id);
                  } else {
                    toast({ title: 'Você não tem permissão para excluir comunicados.' });
                  }
                }}
              />
            </CardContent>
          </Card>
          <ComunicadoModal
            comunicado={comEdit}
            open={showComModal}
            onSave={async novoCom => {
              if (comEdit) {
                await updateComunicado(novoCom.id, novoCom);
              } else {
                await addComunicado(novoCom);
              }
              setShowComModal(false);
              setComEdit(null);
              toast({ title: 'Comunicado salvo com sucesso!' });
            }}
            onCancel={() => { setShowComModal(false); setComEdit(null); }}
          />
        </TabsContent>
        <TabsContent value="portarias" className="space-y-4 px-1 sm:px-0">
          <PortariasList
            documentos={portarias}
            onAdd={async (portaria) => {
              if (temPermissao('portarias:criar')) {
                await addPortaria({ ...portaria, tipo: "Portaria" });
                toast({ title: 'Portaria salva com sucesso!' });
              } else {
                toast({ title: 'Você não tem permissão para criar portarias.' });
              }
            }}
            onEdit={async (doc) => {
              if (temPermissao('portarias:editar')) {
                await updatePortaria(doc.id, { ...doc, tipo: "Portaria" });
                toast({ title: 'Portaria atualizada com sucesso!' });
              } else {
                toast({ title: 'Você não tem permissão para editar portarias.' });
              }
            }}
            onDelete={id => {
              if (temPermissao('portarias:deletar')) {
                removePortaria(id);
              } else {
                toast({ title: 'Você não tem permissão para excluir portarias.' });
              }
            }}
            onVisualizar={doc => setPortariaVisualizar(doc)}
            onImprimir={imprimirPortaria}
            loading={portariasLoading}
          />
          {/* Modal de visualização de portaria */}
          {portariaVisualizar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
                <button className="absolute top-2 right-2" onClick={() => setPortariaVisualizar(null)}>
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-xl font-bold mb-4">{portariaVisualizar.titulo}</h3>
                {portariaVisualizar.pdfUrl ? (
                  <iframe src={portariaVisualizar.pdfUrl} className="w-full h-[70vh] border rounded" title="Visualizar PDF" />
                ) : (
                  <div className="whitespace-pre-wrap border rounded p-4 bg-gray-50 mb-2">{portariaVisualizar.texto}</div>
                )}
                {portariaVisualizar.linkOrigem && (
                  <div className="mt-2"><a href={portariaVisualizar.linkOrigem} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Origem</a></div>
                )}
                <Button className="mt-4" onClick={() => imprimirPortaria(portariaVisualizar)}>Imprimir</Button>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="modelos-documentos" className="space-y-4 px-1 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Documentos</CardTitle>
              <CardDescription>Selecione, edite e imprima modelos prontos de portaria ou relatório de ocorrência</CardDescription>
            </CardHeader>
            <CardContent>
              <ModelosDocumentosList modelos={modelosProntos} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nova aba de Integração */}
        <TabsContent value="integracao" className="space-y-4 px-1 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Integração de Motoristas</CardTitle>
              <CardDescription>Gerencie as integrações obrigatórias dos motoristas</CardDescription>
            </CardHeader>
            <CardContent>
              <IntegracaoMotoristas />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Coordination;
