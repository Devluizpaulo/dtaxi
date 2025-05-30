import React from "react";
import { Motorista, Turma } from "./types";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";

interface Props {
  motorista: Motorista;
  turma: Turma;
  setMotoristas: (m: any) => void;
}

const BotaoNotificar: React.FC<Props> = ({ motorista, turma, setMotoristas }) => {
  const handleNotificar = async () => {
    const telefone = motorista.telefone.replace(/\D/g, "");
    const mensagem = `Prezado(a) ${motorista.nome},\n\nVocê está convocado(a) a comparecer à sede da D-Taxi para uma integração obrigatória.\n\nData: ${turma.data}\nHorário: 13h30\nLocal: Rua Contos Guachescos, 165 - Vila Santa Catarina, São Paulo  \nhttps://www.google.com/maps/search/?api=1&query=Rua+Contos+Guachescos,+165,+São+Paulo\n\nImportante: Seu PDA será suspenso às 13h00 e somente liberado após sua participação na integração.\n\nA ausência poderá resultar em restrições administrativas.\n\nAtenciosamente,  \nAdministração D-Taxi`;
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`, "_blank");
    await updateDoc(doc(db, "turmas-integracao", turma.id, "motoristas", motorista.id), {
      notificadoEm: Timestamp.now(),
    });
    setMotoristas((prev: any) =>
      prev.map((m: any) => m.id === motorista.id ? { ...m, notificadoEm: Timestamp.now() } : m)
    );
    toast.success("Motorista notificado!");
  };

  return (
    <button className="btn btn-success w-full sm:w-auto" onClick={handleNotificar}>
      Notificar
    </button>
  );
};

export default BotaoNotificar; 