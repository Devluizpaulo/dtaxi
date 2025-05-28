import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { collection, getDocs, addDoc, Timestamp, query, orderBy, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Turma {
  id: string;
  data: string;
  nome: string;
  criadaEm: Timestamp;
  totalMotoristas: number;
  totalNotificados: number;
}

interface Motorista {
  id: string;
  nome: string;
  prefixo: string;
  placa?: string;
  modelo?: string;
  telefone?: string;
  unidade?: string;
  turmaId?: string;
  notificadoEm?: Timestamp;
  [key: string]: any;
}

const formatDate = (date: string | Date): string => {
  if (typeof date === 'string') return date;
  return date.toLocaleDateString();
};

const formatTelefone = (telefone: string): string => {
  // Remove tudo que não é número
  const numbers = telefone?.replace(/\D/g, '');
  
  // Se não tiver 11 dígitos, retorna vazio
  if (!numbers || numbers.length !== 11) return '';
  
  // Formata como (XX)XXXXX-XXXX
  return `(${numbers.slice(0,2)})${numbers.slice(2,7)}-${numbers.slice(7)}`;
};

const formatTelefoneParaWhatsApp = (telefone: string): string => {
  return telefone?.replace(/\D/g, '');
};

const mensagemBase = (nome: string, data: string) => `Olá ${nome}, tudo bem?

Você está convocado para a *Integração Obrigatória* da empresa.

📅 *Data:* ${data}
🕒 *Horário:* 13h30
📍 *Local:* Rua Gauchescos, 165 - Vila Santa Catarina, São Paulo
👉 https://www.google.com/maps/search/?api=1&query=Rua+Gauchescos,+165,+Vila+Santa+Catarina,+São+Paulo

⚠️ *Importante:* O PDA da sua unidade será suspenso a partir das 13h. O restabelecimento ocorrerá somente após a sua participação na integração. A ausência resultará em suspensão administrativa.

Contamos com sua presença!
Abraços da equipe Dtáxi! ✨`;

export default function IntegracaoMotoristas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [novaData, setNovaData] = useState<string>('');
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isImporting, setIsImporting] = useState(false);
  const [busca, setBusca] = useState<string>('');
  const [tabAtiva, setTabAtiva] = useState<'pendentes' | 'notificados'>('pendentes');

  // Separar motoristas em notificados e pendentes
  const { motoristasPendentes, motoristasNotificados } = useMemo(() => {
    const pendentes = motoristas.filter(m => !m.notificadoEm);
    const notificados = motoristas.filter(m => m.notificadoEm);
    
    // Ordenar por nome
    pendentes.sort((a, b) => a.nome.localeCompare(b.nome));
    notificados.sort((a, b) => 
      // Primeiro por data de notificação (mais recente primeiro)
      b.notificadoEm!.toDate().getTime() - a.notificadoEm!.toDate().getTime()
    );
    
    return { motoristasPendentes: pendentes, motoristasNotificados: notificados };
  }, [motoristas]);

  // Carregar turmas
  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        setLoading(true);
        const turmasQuery = query(
          collection(db, 'turmas-integracao'),
          orderBy('data', 'desc')
        );
        const snap = await getDocs(turmasQuery);
        setTurmas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Turma)));
      } catch (error) {
        toast({
          title: "Erro ao carregar turmas",
          description: (error as Error).message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTurmas();
  }, []);

  // Carregar motoristas da turma selecionada
  useEffect(() => {
    const fetchMotoristasTurma = async () => {
      if (!turmaSelecionada) {
        setMotoristas([]);
        return;
      }

      try {
        setLoading(true);
        const motoristasQuery = query(
          collection(db, 'motoristas-integracao'),
          where('turmaId', '==', turmaSelecionada.id)
        );
        const snap = await getDocs(motoristasQuery);
        setMotoristas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Motorista)));
      } catch (error) {
        toast({
          title: "Erro ao carregar motoristas",
          description: (error as Error).message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMotoristasTurma();
  }, [turmaSelecionada]);

  const handleCriarTurma = async () => {
    if (!novaData) {
      toast({
        title: "Data não selecionada",
        description: "Selecione uma data para a nova turma",
        variant: "destructive"
      });
      return;
    }

    try {
      const novaTurma = {
        data: novaData,
        nome: `Turma ${formatDate(novaData)}`,
        criadaEm: Timestamp.now(),
        totalMotoristas: 0,
        totalNotificados: 0
      };

      const docRef = await addDoc(collection(db, 'turmas-integracao'), novaTurma);
      const turmaComId = { ...novaTurma, id: docRef.id };
      
      setTurmas(prev => [turmaComId, ...prev]);
      setTurmaSelecionada(turmaComId);
      setNovaData('');
      
      toast({
        title: "Turma criada com sucesso!",
        description: `Turma ${formatDate(novaData)} criada. Agora você pode importar a lista de motoristas.`
      });
    } catch (error) {
      toast({
        title: "Erro ao criar turma",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!turmaSelecionada) {
      toast({
        title: "Nenhuma turma selecionada",
        description: "Selecione ou crie uma turma antes de importar a lista",
        variant: "destructive"
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Verificar duplicatas antes de importar
      const existingPlacas = new Set(motoristas.map(m => m.placa));
      const newMotoristas = [];
      const duplicados = [];

      for (const row of jsonData) {
        const placa = row['PLACA']?.trim();
        if (existingPlacas.has(placa)) {
          duplicados.push(placa);
          continue;
        }

        const telefone = formatTelefone(row['Telefone']?.toString() || '');
        if (!telefone) {
          toast({
            title: "Telefone inválido",
            description: `O motorista ${row['NOME']} possui um telefone inválido: ${row['Telefone']}`,
            variant: "destructive"
          });
          continue;
        }

        newMotoristas.push({
          id: `${turmaSelecionada.id}-${placa || Date.now()}`,
          nome: row['NOME']?.trim() || '',
          unidade: row['UN']?.toString() || '',
          placa,
          modelo: row['MODELO']?.trim() || '',
          telefone,
          turmaId: turmaSelecionada.id,
          prefixo: row['UN']?.toString() || ''
        } as Motorista);
      }

      if (duplicados.length > 0) {
        toast({
          title: "Motoristas duplicados ignorados",
          description: `As seguintes placas já existem: ${duplicados.join(', ')}`,
          variant: "destructive"
        });
      }

      // Salvar novos motoristas no banco
      const motoristasComIdFirestore: Motorista[] = [];
      for (const motorista of newMotoristas) {
        const docRef = await addDoc(collection(db, 'motoristas-integracao'), motorista);
        motoristasComIdFirestore.push({ ...motorista, id: docRef.id });
      }

      // Atualizar contadores da turma
      const turmaRef = doc(db, 'turmas-integracao', turmaSelecionada.id);
      await updateDoc(turmaRef, {
        totalMotoristas: motoristas.length + motoristasComIdFirestore.length
      });

      setMotoristas(prev => [...prev, ...motoristasComIdFirestore]);
      toast({
        title: "Lista importada com sucesso!",
        description: `${motoristasComIdFirestore.length} motoristas importados para a turma.`
      });
    } catch (error) {
      toast({
        title: "Erro ao importar arquivo",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleNotificar = async (motorista: Motorista) => {
    if (!turmaSelecionada) return;

    try {
      const motoristaRef = doc(db, 'motoristas-integracao', motorista.id);
      const notificadoEm = Timestamp.now();

      // Atualizar status do motorista
      await updateDoc(motoristaRef, { notificadoEm });

      // Atualizar lista local
      setMotoristas(prev => 
        prev.map(m => 
          m.id === motorista.id 
            ? { ...m, notificadoEm } 
            : m
        )
      );

      // Atualizar contador da turma
      const turmaRef = doc(db, 'turmas-integracao', turmaSelecionada.id);
      const novoTotal = motoristasNotificados.length + 1;
      await updateDoc(turmaRef, { totalNotificados: novoTotal });
      
      setTurmaSelecionada(prev => prev ? {
        ...prev,
        totalNotificados: novoTotal
      } : null);

      // Abrir WhatsApp
      const telefone = formatTelefoneParaWhatsApp(motorista.telefone || '');
      const mensagem = mensagemBase(motorista.nome, turmaSelecionada.data);
      window.open(
        `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`,
        '_blank'
      );

      toast({
        title: "Motorista notificado",
        description: `${motorista.nome} foi marcado como notificado.`
      });
    } catch (error) {
      toast({
        title: "Erro ao notificar motorista",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const TabelaMotoristas = ({ motoristas }: { motoristas: Motorista[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">UN</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">PLACA</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">MODELO</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">NOME</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Telefone</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {motoristas
            .filter(m => 
              m.nome.toLowerCase().includes(busca.toLowerCase()) ||
              m.placa?.toLowerCase().includes(busca.toLowerCase()) ||
              m.unidade?.toString().includes(busca)
            )
            .map((motorista) => (
              <tr key={motorista.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {motorista.notificadoEm ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {new Date(motorista.notificadoEm.toDate()).toLocaleTimeString()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm">{motorista.unidade}</td>
                <td className="px-4 py-2 text-sm">{motorista.placa}</td>
                <td className="px-4 py-2 text-sm">{motorista.modelo}</td>
                <td className="px-4 py-2 text-sm font-medium">{motorista.nome}</td>
                <td className="px-4 py-2 text-sm">{motorista.telefone}</td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant={motorista.notificadoEm ? "outline" : "default"}
                    onClick={() => handleNotificar(motorista)}
                    className={motorista.notificadoEm ? "text-green-600 hover:text-green-700" : ""}
                  >
                    {motorista.notificadoEm ? "Reenviar" : "Notificar"}
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-6">Integração de Motoristas</h2>

      {/* Criar/Selecionar Turma */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Gerenciar Turmas</h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Nova Turma</label>
              <input 
                type="date" 
                value={novaData} 
                onChange={e => setNovaData(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
            <Button 
              onClick={handleCriarTurma}
              disabled={!novaData}
            >
              Criar Turma
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Selecionar Turma Existente</label>
            <select
              value={turmaSelecionada?.id || ''}
              onChange={e => {
                const turma = turmas.find(t => t.id === e.target.value);
                setTurmaSelecionada(turma || null);
              }}
              className="border rounded p-2 w-full"
            >
              <option value="">Selecione uma turma...</option>
              {turmas.map(turma => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} - {formatDate(turma.data)} 
                  ({turma.totalNotificados || 0}/{turma.totalMotoristas || 0} notificados)
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Importar Lista */}
      {turmaSelecionada && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Importar Lista de Motoristas</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {isImporting && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <p>O arquivo Excel deve conter as colunas:</p>
              <ul className="list-disc list-inside">
                <li>UN (Unidade)</li>
                <li>PLACA</li>
                <li>MODELO</li>
                <li>NOME</li>
                <li>Telefone (formato: (XX)XXXXX-XXXX)</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Motoristas */}
      {turmaSelecionada && motoristas.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">
              Motoristas da Turma {formatDate(turmaSelecionada.data)}
            </h3>
            <div className="text-sm text-gray-500">
              {motoristasNotificados.length} de {motoristas.length} notificados
            </div>
          </div>

          <input
            type="text"
            placeholder="Buscar por nome, placa ou unidade..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full border rounded p-2 mb-4"
          />

          <Tabs value={tabAtiva} onValueChange={(value) => setTabAtiva(value as 'pendentes' | 'notificados')}>
            <TabsList className="mb-4">
              <TabsTrigger value="pendentes" className="flex gap-2">
                Pendentes
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                  {motoristasPendentes.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="notificados" className="flex gap-2">
                Notificados
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                  {motoristasNotificados.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes">
              {motoristasPendentes.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Não há motoristas pendentes de notificação
                </p>
              ) : (
                <TabelaMotoristas motoristas={motoristasPendentes} />
              )}
            </TabsContent>

            <TabsContent value="notificados">
              {motoristasNotificados.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nenhum motorista foi notificado ainda
                </p>
              ) : (
                <TabelaMotoristas motoristas={motoristasNotificados} />
              )}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}