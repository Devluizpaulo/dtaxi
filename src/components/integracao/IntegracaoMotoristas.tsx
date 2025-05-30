import React, { useState, useEffect } from "react";
import SelectTurma from "./SelectTurma";
import ModalAdicionarMotorista from "./ModalAdicionarMotorista";
import ListaMotoristas from "./ListaMotoristas";
import ResumoTurma from "./ResumoTurma";
import { Turma, Motorista } from "./types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const IntegracaoMotoristas: React.FC = () => {
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchMotoristas = async () => {
      if (!turmaSelecionada) {
        setMotoristas([]);
        return;
      }
      setLoading(true);
      const snap = await getDocs(collection(db, "turmas-integracao", turmaSelecionada.id, "motoristas"));
      setMotoristas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Motorista)));
      setLoading(false);
    };
    fetchMotoristas();
  }, [turmaSelecionada]);

  return (
    <div className="p-2 sm:p-4 max-w-6xl mx-auto space-y-6 w-full">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Integração de Motoristas</h2>
      <SelectTurma
        turmaSelecionada={turmaSelecionada}
        setTurmaSelecionada={setTurmaSelecionada}
        setMotoristas={setMotoristas}
        setLoading={setLoading}
      />
      {turmaSelecionada && (
        <>
          <button
            className="btn btn-success mb-2 w-full sm:w-auto"
            onClick={() => setModalOpen(true)}
          >
            + Adicionar Motorista
          </button>
          <ModalAdicionarMotorista
            turma={turmaSelecionada}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onAdicionado={motorista => setMotoristas(prev => [...prev, motorista])}
          />
          <ResumoTurma motoristas={motoristas} />
          <ListaMotoristas
            motoristas={motoristas}
            turma={turmaSelecionada}
            setMotoristas={setMotoristas}
          />
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