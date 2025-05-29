import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Turma, Motorista } from "./types";
import { toast } from "react-toastify";

interface Props {
  turma: Turma;
  onAdicionado: (motorista: Motorista) => void;
  onClose: () => void;
  open: boolean;
}

const ModalAdicionarMotorista: React.FC<Props> = ({ turma, onAdicionado, onClose, open }) => {
  const [form, setForm] = useState({
    unidade: "",
    placa: "",
    modelo: "",
    nome: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSalvar = async () => {
    if (!form.nome || !form.telefone) {
      toast.error("Nome e telefone são obrigatórios!");
      return;
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "turmas-integracao", turma.id, "motoristas"), {
        ...form,
        turmaId: turma.id,
        importadoEm: Timestamp.now(),
      });
      onAdicionado({ id: docRef.id, ...form });
      toast.success("Motorista adicionado!");
      onClose();
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fadeIn">
        <button className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Fechar">×</button>
        <h3 className="text-xl font-bold mb-4 text-center">Adicionar Motorista</h3>
        <div className="space-y-3">
          <input name="unidade" placeholder="UN" className="border p-2 w-full rounded focus:outline-none focus:ring" value={form.unidade} onChange={handleChange} />
          <input name="placa" placeholder="Placa" className="border p-2 w-full rounded focus:outline-none focus:ring" value={form.placa} onChange={handleChange} />
          <input name="modelo" placeholder="Modelo" className="border p-2 w-full rounded focus:outline-none focus:ring" value={form.modelo} onChange={handleChange} />
          <input name="nome" placeholder="Nome" className="border p-2 w-full rounded focus:outline-none focus:ring" value={form.nome} onChange={handleChange} required />
          <input name="telefone" placeholder="Telefone" className="border p-2 w-full rounded focus:outline-none focus:ring" value={form.telefone} onChange={handleChange} required />
        </div>
        <button className="btn btn-primary mt-4 w-full" onClick={handleSalvar} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
};

export default ModalAdicionarMotorista; 