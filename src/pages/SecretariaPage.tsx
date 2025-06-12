import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { Documento, Comunicado, ModeloDocumento } from '@/components/dashboard/coordination/types';
import DocumentosList from '@/components/dashboard/coordination/DocumentosList';
import ComunicadosList from '@/components/dashboard/coordination/ComunicadosList';
import PortariasList from '@/components/dashboard/coordination/PortariasList';
import ModelosDocumentosList from '@/components/dashboard/coordination/ModelosDocumentosList';
import IntegracaoMotoristas from '@/components/integracao/IntegracaoMotoristas';
// import { db } from '@/lib/firebase';
// import { collection, query, where, getDocs } from 'firebase/firestore';

// Placeholder para documentos publicados
const mockDocs = [
  { id: '1', titulo: 'Ata de Comissão de Ética', tipo: 'Ata', publicadoEm: '2024-06-01', url: '#' },
  { id: '2', titulo: 'Relatório de Ocorrência', tipo: 'Relatório', publicadoEm: '2024-05-20', url: '#' },
  { id: '3', titulo: 'Comunicação Interna', tipo: 'Comunicação', publicadoEm: '2024-05-10', url: '#' },
];

const SecretariaPage = () => {
  // const [docs, setDocs] = useState([]);
  // useEffect(() => {
  //   const fetchDocs = async () => {
  //     const q = query(collection(db, 'secretaria-documentos'), where('publicadoNaSecretaria', '==', true));
  //     const snap = await getDocs(q);
  //     setDocs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  //   };
  //   fetchDocs();
  // }, []);
  const docs = mockDocs;

  const [tab, setTab] = useState('agendar');

  // Dados Firestore
  const { data: documentos, loading: documentosLoading, error: documentosError } = useFirestore<Documento>({ collectionName: 'documentos', orderByField: 'data', orderDirection: 'desc' });
  const { data: comunicados, loading: comunicadosLoading, error: comunicadosError } = useFirestore<Comunicado>({ collectionName: 'comunicados', orderByField: 'data', orderDirection: 'desc' });
  const { data: portarias, loading: portariasLoading, error: portariasError } = useFirestore<Documento>({ collectionName: 'portarias', orderByField: 'data', orderDirection: 'desc' });
  // Modelos mock (pode ser Firestore depois)
  const modelos: ModeloDocumento[] = [
    {
      titulo: 'Portaria de Nomeação',
      corpo: `PORTARIA Nº ___/____\n\nO Presidente da Comissão de Ética da [Instituição], no uso de suas atribuições, resolve:\n\nArt. 1º Nomear [NOME COMPLETO], para exercer a função de [FUNÇÃO], a partir de [DATA].\n\nArt. 2º Esta portaria entra em vigor na data de sua publicação.\n\n[Local], [Data].\n\nSr. Mauricio Alonso\nPresidente da Comissão de Ética`,
    },
    {
      titulo: 'Relatório de Ocorrência - D-Táxi',
      corpo: `RELATÓRIO DE OCORRÊNCIA - D-TÁXI\n\nInformações Gerais:\nData e Hora do Incidente: [DATA_HORA]\nLocal do Incidente: [LOCAL]\nNúmero do Táxi (se aplicável): [TAXI]\nNome do Motorista: [MOTORISTA]\nDescrição do Incidente: [DESCRICAO]\n\nDetalhes do Incidente:\n[DETALHES]\n\nTestemunhas (se houver):\nNome: [TESTEMUNHA_NOME]\nContato: [TESTEMUNHA_CONTATO]\n\nAções Tomadas:\n[ACOES]\n\nComentários Adicionais:\n[COMENTARIOS]\n\nAssinatura do Responsável:\nNome: [RESPONSAVEL]\nData: [DATA_ASSINATURA]`
    }
  ];

  // Hooks para dados filtrados
  const comunicacoesInternas = documentos.filter(doc => doc.tipo?.toLowerCase().includes('comunicação interna'));
  const comunicacoesExternas = documentos.filter(doc => doc.tipo?.toLowerCase().includes('comunicação externa'));
  const atas = documentos.filter(doc => doc.tipo?.toLowerCase().includes('ata'));
  const relatorios = documentos.filter(doc => doc.tipo?.toLowerCase().includes('relatório'));
  const suspensoes = documentos.filter(doc => doc.tipo?.toLowerCase().includes('suspensão'));
  const gerais = documentos.filter(doc => doc.tipo?.toLowerCase().includes('geral'));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="w-full bg-white shadow flex items-center justify-between px-6 py-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-xl text-taxi-green">Secretaria D-TAXI</span>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <a href="/">
            <Home className="h-5 w-5" />
            Ir para o site principal
          </a>
        </Button>
      </nav>
      <div className="container mx-auto py-8 flex flex-col md:flex-row gap-8">
        {/* Abas verticais */}
        <Tabs value={tab} onValueChange={setTab} orientation="vertical" className="flex w-full">
          <TabsList className="flex flex-row md:flex-col gap-2 md:gap-4 bg-white shadow rounded-lg p-2 md:min-w-[220px] md:max-w-[240px] h-fit sticky top-24">
            <TabsTrigger value="agendar">Agendar Reunião</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="atos">Solicitar Atos</TabsTrigger>
            <TabsTrigger value="comunicacoes-internas">Com. Internas</TabsTrigger>
            <TabsTrigger value="comunicacoes-externas">Com. Externas</TabsTrigger>
            <TabsTrigger value="atas">Atas</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="modelos">Modelos</TabsTrigger>
            <TabsTrigger value="suspensao">Com. Suspensão</TabsTrigger>
            <TabsTrigger value="geral">Com. Gerais</TabsTrigger>
            <TabsTrigger value="comunicados">Comunicados</TabsTrigger>
            <TabsTrigger value="portarias">Portarias</TabsTrigger>
            <TabsTrigger value="integracao">Integração</TabsTrigger>
          </TabsList>
          <div className="flex-1 md:ml-8 mt-8 md:mt-0">
            <TabsContent value="agendar">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Agendar Reunião</h2>
                <p className="text-gray-600 mb-2">Solicite o agendamento de uma reunião institucional. <b>Em breve</b>, formulário e calendário integrado.</p>
                <Button variant="outline" disabled>Agendar (em breve)</Button>
              </div>
            </TabsContent>
            <TabsContent value="documentos">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Documentos Oficiais</h2>
                <DocumentosList
                  documentos={documentos}
                  loading={documentosLoading}
                  error={documentosError}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onImprimir={() => {}}
                />
              </div>
            </TabsContent>
            <TabsContent value="atos">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Solicitar Atos</h2>
                <p className="text-gray-600 mb-2">Solicite atos administrativos, certidões ou outros documentos oficiais. <b>Em breve</b>.</p>
                <Button variant="outline" disabled>Solicitar (em breve)</Button>
              </div>
            </TabsContent>
            <TabsContent value="comunicacoes-internas">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Comunicações Internas</h2>
                {documentosLoading ? (
                  <div>Carregando...</div>
                ) : comunicacoesInternas.length === 0 ? (
                  <div className="text-gray-500">Nenhuma comunicação interna encontrada.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Título</th>
                          <th className="px-3 py-2 text-left">Data</th>
                          <th className="px-3 py-2 text-left">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comunicacoesInternas.map(doc => (
                          <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{doc.titulo}</td>
                            <td className="px-3 py-2">{doc.data}</td>
                            <td className="px-3 py-2">
                              {doc.arquivoUrl ? (
                                <Button asChild size="sm" variant="outline">
                                  <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">Visualizar</a>
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="comunicacoes-externas">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Comunicações Externas</h2>
                {documentosLoading ? (
                  <div>Carregando...</div>
                ) : comunicacoesExternas.length === 0 ? (
                  <div className="text-gray-500">Nenhuma comunicação externa encontrada.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Título</th>
                          <th className="px-3 py-2 text-left">Data</th>
                          <th className="px-3 py-2 text-left">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comunicacoesExternas.map(doc => (
                          <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{doc.titulo}</td>
                            <td className="px-3 py-2">{doc.data}</td>
                            <td className="px-3 py-2">
                              {doc.arquivoUrl ? (
                                <Button asChild size="sm" variant="outline">
                                  <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">Visualizar</a>
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="atas">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Atas</h2>
                {documentosLoading ? (
                  <div>Carregando...</div>
                ) : atas.length === 0 ? (
                  <div className="text-gray-500">Nenhuma ata encontrada.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Título</th>
                          <th className="px-3 py-2 text-left">Data</th>
                          <th className="px-3 py-2 text-left">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {atas.map(doc => (
                          <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{doc.titulo}</td>
                            <td className="px-3 py-2">{doc.data}</td>
                            <td className="px-3 py-2">
                              {doc.arquivoUrl ? (
                                <Button asChild size="sm" variant="outline">
                                  <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">Visualizar</a>
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="relatorios">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Relatórios</h2>
                {documentosLoading ? (
                  <div>Carregando...</div>
                ) : relatorios.length === 0 ? (
                  <div className="text-gray-500">Nenhum relatório encontrado.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Título</th>
                          <th className="px-3 py-2 text-left">Data</th>
                          <th className="px-3 py-2 text-left">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatorios.map(doc => (
                          <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{doc.titulo}</td>
                            <td className="px-3 py-2">{doc.data}</td>
                            <td className="px-3 py-2">
                              {doc.arquivoUrl ? (
                                <Button asChild size="sm" variant="outline">
                                  <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">Visualizar</a>
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="modelos">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Modelos</h2>
                <ModelosDocumentosList modelos={modelos} />
              </div>
            </TabsContent>
            <TabsContent value="suspensao">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Comunicações de Suspensão</h2>
                {documentosLoading ? (
                  <div>Carregando...</div>
                ) : suspensoes.length === 0 ? (
                  <div className="text-gray-500">Nenhuma comunicação de suspensão encontrada.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Título</th>
                          <th className="px-3 py-2 text-left">Data</th>
                          <th className="px-3 py-2 text-left">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suspensoes.map(doc => (
                          <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{doc.titulo}</td>
                            <td className="px-3 py-2">{doc.data}</td>
                            <td className="px-3 py-2">
                              {doc.arquivoUrl ? (
                                <Button asChild size="sm" variant="outline">
                                  <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">Visualizar</a>
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="geral">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Comunicações Gerais</h2>
                {documentosLoading ? (
                  <div>Carregando...</div>
                ) : gerais.length === 0 ? (
                  <div className="text-gray-500">Nenhuma comunicação geral encontrada.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Título</th>
                          <th className="px-3 py-2 text-left">Data</th>
                          <th className="px-3 py-2 text-left">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gerais.map(doc => (
                          <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{doc.titulo}</td>
                            <td className="px-3 py-2">{doc.data}</td>
                            <td className="px-3 py-2">
                              {doc.arquivoUrl ? (
                                <Button asChild size="sm" variant="outline">
                                  <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer">Visualizar</a>
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="comunicados">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Comunicados</h2>
                <ComunicadosList
                  comunicados={comunicados}
                  loading={comunicadosLoading}
                  error={comunicadosError}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            </TabsContent>
            <TabsContent value="portarias">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Portarias</h2>
                <PortariasList
                  documentos={portarias}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onVisualizar={() => {}}
                  onImprimir={() => {}}
                  loading={portariasLoading}
                />
              </div>
            </TabsContent>
            <TabsContent value="integracao">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-taxi-green">Integração de Motoristas</h2>
                <IntegracaoMotoristas />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      {/* Rodapé institucional */}
      <footer className="w-full bg-white border-t mt-12 py-4 text-center text-xs text-gray-500">
        Secretaria D-TAXI &copy; {new Date().getFullYear()} &middot; Todos os direitos reservados
      </footer>
    </div>
  );
};

export default SecretariaPage; 