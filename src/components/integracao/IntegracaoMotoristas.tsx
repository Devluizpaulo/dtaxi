import React, { useState } from "react";
import SelectTurma from "./SelectTurma";
import UploadExcel from "./UploadExcel";
import ListaMotoristas from "./ListaMotoristas";
import ResumoTurma from "./ResumoTurma";
import { Turma, Motorista } from "./types";

const IntegracaoMotoristas: React.FC = () => {
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Integração de Motoristas</h2>
      <SelectTurma
        turmaSelecionada={turmaSelecionada}
        setTurmaSelecionada={setTurmaSelecionada}
        setMotoristas={setMotoristas}
        setLoading={setLoading}
      />
      {turmaSelecionada && (
        <>
          <UploadExcel
            turma={turmaSelecionada}
            setMotoristas={setMotoristas}
            setLoading={setLoading}
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