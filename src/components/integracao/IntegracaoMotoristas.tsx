import React, { useState, useEffect, useCallback } from "react";
import SelectTurma from "./SelectTurma";
import ModalAdicionarMotorista from "./ModalAdicionarMotorista";
import ListaMotoristas from "./ListaMotoristas";
import { Turma, Motorista } from "./types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const fetchMotoristas = async (turmaId: string): Promise<Motorista[]> => {
  const snap = await getDocs(collection(db, "turmas-integracao", turmaId, "motoristas"));
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data.nome,
      telefone: data.telefone,
      unidade: data.unidade,
      placa: data.placa,
      modelo: data.modelo,
      notificadoEm: data.notificadoEm,
      certificadoEmitidoEm: data.certificadoEmitidoEm,
    };
  });
};

const IntegracaoMotoristas: React.FC = () => {
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!turmaSelecionada) {
      setMotoristas([]);
      return;
    }

    setLoading(true);
    fetchMotoristas(turmaSelecionada.id)
      .then(setMotoristas)
      .finally(() => setLoading(false));
  }, [turmaSelecionada]);

  const handleAdicionarMotorista = useCallback(
    (motorista: Motorista) => setMotoristas(prev => [...prev, motorista]),
    []
  );

  const motoristasPorStatus = {
    convocados: motoristas.filter(m => !m.notificadoEm && !m.certificadoEmitidoEm),
    notificados: motoristas.filter(m => m.notificadoEm && !m.certificadoEmitidoEm),
    certificados: motoristas.filter(m => m.certificadoEmitidoEm),
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 w-full">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">Integração de Motoristas</h2>

      <SelectTurma
        turmaSelecionada={turmaSelecionada}
        setTurmaSelecionada={setTurmaSelecionada}
        setMotoristas={setMotoristas}
        setLoading={setLoading}
      />

      {turmaSelecionada && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              className="btn btn-success w-full sm:w-auto"
              onClick={() => setModalOpen(true)}
            >
              + Adicionar Motorista
            </button>
          </div>

          <ModalAdicionarMotorista
            turma={turmaSelecionada}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onAdicionado={handleAdicionarMotorista}
          />

          <Tabs defaultValue="convocados" className="w-full">
            <TabsList className="flex flex-wrap justify-center sm:justify-start gap-4 bg-gray-100 p-2 rounded-md mb-4">
              <TabsTrigger value="convocados" className="flex items-center gap-1">
                Convocados
                <span className="text-sm font-semibold text-yellow-600">({motoristasPorStatus.convocados.length})</span>
              </TabsTrigger>
              <TabsTrigger value="notificados" className="flex items-center gap-1">
                Notificados
                <span className="text-sm font-semibold text-blue-600">({motoristasPorStatus.notificados.length})</span>
              </TabsTrigger>
              <TabsTrigger value="certificados" className="flex items-center gap-1">
                Certificados
                <span className="text-sm font-semibold text-green-600">({motoristasPorStatus.certificados.length})</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="convocados">
              <ListaMotoristas
                motoristas={motoristasPorStatus.convocados}
                turma={turmaSelecionada}
                setMotoristas={setMotoristas}
                status="convocados"
              />
            </TabsContent>
            <TabsContent value="notificados">
              <ListaMotoristas
                motoristas={motoristasPorStatus.notificados}
                turma={turmaSelecionada}
                setMotoristas={setMotoristas}
                status="notificados"
              />
            </TabsContent>
            <TabsContent value="certificados">
              <ListaMotoristas
                motoristas={motoristasPorStatus.certificados}
                turma={turmaSelecionada}
                setMotoristas={setMotoristas}
                status="certificados"
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default IntegracaoMotoristas;
