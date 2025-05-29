import React, { useState } from "react";
import BotaoNotificar from "./BotaoNotificar";
import CertificadoImagem from "./CertificadoImagem";
import { Motorista, Turma } from "./types";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";

interface Props {
  motoristas: Motorista[];
  turma: Turma;
  setMotoristas: (m: Motorista[]) => void;
}

const ListaMotoristas: React.FC<Props> = ({ motoristas, turma, setMotoristas }) => {
  const [certificando, setCertificando] = useState<string | null>(null);

  const handleCertificar = async (motorista: Motorista) => {
    setCertificando(motorista.id);
    // Aqui você pode salvar no Firestore que o certificado foi emitido
    await updateDoc(doc(db, "turmas-integracao", turma.id, "motoristas", motorista.id), {
      certificadoEmitidoEm: Timestamp.now(),
    });
    setMotoristas(prev =>
      prev.map(m => m.id === motorista.id ? { ...m, certificadoEmitidoEm: Timestamp.now() } : m)
    );
    setCertificando(null);
    toast.success("Certificado emitido!");
  };

  return (
    <div className="bg-white rounded shadow p-4 overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr>
            <th>Status</th>
            <th>UN</th>
            <th>Placa</th>
            <th>Modelo</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {motoristas.map(motorista => (
            <tr key={motorista.id}>
              <td>
                {motorista.certificadoEmitidoEm ? (
                  <span className="text-green-600 font-bold">Certificado</span>
                ) : motorista.notificadoEm ? (
                  <span className="text-blue-600">Notificado</span>
                ) : (
                  <span className="text-yellow-600">Convocado</span>
                )}
              </td>
              <td>{motorista.unidade}</td>
              <td>{motorista.placa}</td>
              <td>{motorista.modelo}</td>
              <td>{motorista.nome}</td>
              <td>{motorista.telefone}</td>
              <td className="flex gap-2">
                <BotaoNotificar motorista={motorista} turma={turma} setMotoristas={setMotoristas} />
                <CertificadoImagem
                  motorista={motorista}
                  turma={turma}
                  onEmitido={() => handleCertificar(motorista)}
                  loading={certificando === motorista.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaMotoristas; 