import React from "react";
import { Motorista } from "./types";

interface Props {
  motoristas: Motorista[];
}

const ResumoTurma: React.FC<Props> = ({ motoristas }) => {
  const total = motoristas.length;
  const notificados = motoristas.filter(m => m.notificadoEm).length;
  const certificados = motoristas.filter(m => m.certificadoEmitidoEm).length;

  return (
    <div className="flex gap-4 mb-4">
      <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">Convocados: {total - notificados}</div>
      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded">Notificados: {notificados}</div>
      <div className="bg-green-100 text-green-800 px-4 py-2 rounded">Certificados: {certificados}</div>
    </div>
  );
};

export default ResumoTurma; 