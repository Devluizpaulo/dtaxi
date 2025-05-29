import React, { useEffect, useState } from "react";
import { Turma, Motorista } from "./types";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, Timestamp, orderBy, query } from "firebase/firestore";
import { toast } from "react-toastify";

interface Props {
  turmaSelecionada: Turma | null;
  setTurmaSelecionada: (t: Turma | null) => void;
  setMotoristas: (m: Motorista[]) => void;
  setLoading: (b: boolean) => void;
}

const SelectTurma: React.FC<Props> = ({
  turmaSelecionada, setTurmaSelecionada, setMotoristas, setLoading
}) => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [novaData, setNovaData] = useState("");

  useEffect(() => {
    const fetchTurmas = async () => {
      setLoading(true);
      const q = query(collection(db, "turmas-integracao"), orderBy("data", "desc"));
      const snap = await getDocs(q);
      setTurmas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Turma)));
      setLoading(false);
    };
    fetchTurmas();
  }, [setLoading]);

  const handleCriarTurma = async () => {
    if (!novaData) return toast.error("Selecione uma data!");
    setLoading(true);
    const novaTurma = {
      data: novaData,
      nome: `Turma ${novaData}`,
      criadaEm: Timestamp.now(),
      totalMotoristas: 0,
      totalNotificados: 0,
      totalCertificados: 0,
    };
    const docRef = await addDoc(collection(db, "turmas-integracao"), novaTurma);
    const turmaComId = { ...novaTurma, id: docRef.id };
    setTurmas(prev => [turmaComId, ...prev]);
    setTurmaSelecionada(turmaComId);
    setNovaData("");
    setLoading(false);
    toast.success("Turma criada!");
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Nova Turma</label>
          <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)}
            className="border rounded p-2" />
        </div>
        <button onClick={handleCriarTurma} className="btn btn-primary" disabled={!novaData}>
          Criar Turma
        </button>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Selecionar Turma Existente</label>
        <select
          value={turmaSelecionada?.id || ""}
          onChange={e => {
            const turma = turmas.find(t => t.id === e.target.value);
            setTurmaSelecionada(turma || null);
            setMotoristas([]);
          }}
          className="border rounded p-2 w-full"
        >
          <option value="">Selecione uma turma...</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>
              {turma.nome} - {turma.data}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelectTurma; 