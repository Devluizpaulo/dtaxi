import React from "react";
import * as XLSX from "xlsx";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { Turma, Motorista } from "./types";

interface Props {
  turma: Turma;
  setMotoristas: (m: Motorista[]) => void;
  setLoading: (b: boolean) => void;
}

const UploadExcel: React.FC<Props> = ({ turma, setMotoristas, setLoading }) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      // Upload do arquivo para Storage (auditoria)
      const fileRef = ref(storage, `uploads/${turma.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // Ler e importar linhas do Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const motoristas: Motorista[] = [];
      for (const row of jsonData) {
        const unidade = row["UN"]?.toString().trim() || "";
        const placa = row["Placa"]?.toString().trim() || "";
        const modelo = row["Modelo"]?.toString().trim() || "";
        const nome = row["Nome"]?.toString().trim() || "";
        const telefone = row["Telefone"]?.toString().replace(/\D/g, "");
        if (!nome || !telefone) continue;
        // Salva cada motorista na subcoleção da turma
        const docRef = await addDoc(collection(db, "turmas-integracao", turma.id, "motoristas"), {
          unidade,
          placa,
          modelo,
          nome,
          telefone,
          turmaId: turma.id,
          importadoEm: Timestamp.now(),
          fileUrl, // opcional: referência ao arquivo original
        });
        motoristas.push({ id: docRef.id, unidade, placa, modelo, nome, telefone });
      }
      setMotoristas(motoristas);
      toast.success("Motoristas importados com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao importar: " + err.message);
    }
    setLoading(false);
    e.target.value = "";
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <label className="block text-sm font-medium mb-1">Importar Lista de Motoristas (.xlsx)</label>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500" />
    </div>
  );
};

export default UploadExcel; 