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
    const mensagem = `Olá ${motorista.nome}, você foi convocado para a integração da turma ${turma.nome} em ${turma.data}.`;
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`, "_blank");
    await updateDoc(doc(db, "uploads", turma.id, "linhas", motorista.id), {
      notificadoEm: Timestamp.now(),
    });
    setMotoristas((prev: any) =>
      prev.map((m: any) => m.id === motorista.id ? { ...m, notificadoEm: Timestamp.now() } : m)
    );
    toast.success("Motorista notificado!");
  };

  return (
    <button className="btn btn-success" onClick={handleNotificar}>
      Notificar
    </button>
  );
};

export default BotaoNotificar; 