import React, { useState } from "react";
import BotaoNotificar from "./BotaoNotificar";
import CertificadoImagem from "./CertificadoImagem";
import { Motorista, Turma } from "./types";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

interface Props {
  motoristas: Motorista[];
  turma: Turma;
  setMotoristas: (m: Motorista[]) => void;
  status: 'convocados' | 'notificados' | 'certificados';
}

const ListaMotoristas: React.FC<Props> = React.memo(({ motoristas, turma, setMotoristas, status }) => {
  const [certificando, setCertificando] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [excluindo, setExcluindo] = useState(false);

  const handleCertificar = async (motorista: Motorista) => {
    setCertificando(motorista.id);
    await updateDoc(doc(db, "turmas-integracao", turma.id, "motoristas", motorista.id), {
      certificadoEmitidoEm: Timestamp.now(),
    });
    setMotoristas((prev: Motorista[]) =>
      prev.map(m => m.id === motorista.id ? { ...m, certificadoEmitidoEm: Timestamp.now() } : m)
    );
    setCertificando(null);
    toast.success("Certificado emitido!");
  };

  const handleSelecionar = (id: string) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleSelecionarTodos = () => {
    if (selecionados.length === motoristas.length) {
      setSelecionados([]);
    } else {
      setSelecionados(motoristas.map(m => m.id));
    }
  };

  const handleExcluirSelecionados = async () => {
    if (selecionados.length === 0) return;
    setExcluindo(true);
    try {
      await Promise.all(
        selecionados.map(id => deleteDoc(doc(db, "turmas-integracao", turma.id, "motoristas", id)))
      );
      setMotoristas(prev => prev.filter(m => !selecionados.includes(m.id)));
      setSelecionados([]);
      toast.success("Motoristas excluídos com sucesso!");
    } catch (e) {
      toast.error("Erro ao excluir motoristas.");
    }
    setExcluindo(false);
  };

  if (motoristas.length === 0) {
    if (status === 'convocados') return <div className="text-center text-gray-400">Nenhum motorista convocado</div>;
    if (status === 'notificados') return <div className="text-center text-gray-400">Nenhum motorista notificado</div>;
    if (status === 'certificados') return <div className="text-center text-gray-400">Nenhum certificado emitido</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 mb-2">
        <input
          type="checkbox"
          checked={selecionados.length === motoristas.length && motoristas.length > 0}
          onChange={handleSelecionarTodos}
        />
        <span className="text-sm">Selecionar todos</span>
        {selecionados.length > 0 && (
          <button
            className="btn btn-danger ml-4"
            onClick={handleExcluirSelecionados}
            disabled={excluindo}
          >
            {excluindo ? "Excluindo..." : `Excluir selecionados (${selecionados.length})`}
          </button>
        )}
      </div>
      {motoristas.map(motorista => (
        <div key={motorista.id} className="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow p-4 gap-4">
          <input
            type="checkbox"
            className="mr-2 self-start mt-1"
            checked={selecionados.includes(motorista.id)}
            onChange={() => handleSelecionar(motorista.id)}
          />
          {status === 'certificados' && (
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mr-4" />
          )}
          <div className="flex-1 w-full">
            <div className="font-bold text-lg">{motorista.nome}</div>
            <div className="text-sm text-gray-600">{motorista.telefone}</div>
            <div className="text-xs text-gray-400">UN: {motorista.unidade} | Placa: {motorista.placa} | Modelo: {motorista.modelo}</div>
            {status === 'notificados' && <div className="text-xs text-blue-600 mt-1">Notificado</div>}
            {status === 'certificados' && <div className="text-xs text-green-600 mt-1">Certificado emitido</div>}
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {status === 'convocados' && (
              <BotaoNotificar motorista={motorista} turma={turma} setMotoristas={setMotoristas} />
            )}
            {status === 'notificados' && (
              <>
                <BotaoNotificar motorista={motorista} turma={turma} setMotoristas={setMotoristas} />
                <button
                  className="btn btn-primary"
                  onClick={() => handleCertificar(motorista)}
                  disabled={certificando === motorista.id}
                >
                  {certificando === motorista.id ? "Emitindo..." : "Emitir Certificado"}
                </button>
              </>
            )}
            {status === 'certificados' && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="btn btn-outline w-full">Visualizar Certificado</button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <CertificadoImagem
                    motorista={motorista}
                    turma={turma}
                    onEmitido={() => {}}
                    loading={false}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default ListaMotoristas;
 