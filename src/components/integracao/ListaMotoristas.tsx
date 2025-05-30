import React, { useState } from "react";
import BotaoNotificar from "./BotaoNotificar";
import CertificadoImagem from "./CertificadoImagem";
import { Motorista, Turma } from "./types";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

interface Props {
  motoristas: Motorista[];
  turma: Turma;
  setMotoristas: (m: Motorista[]) => void;
}

const ListaMotoristas: React.FC<Props> = React.memo(({ motoristas, turma, setMotoristas }) => {
  const [certificando, setCertificando] = useState<string | null>(null);
  const [motoristaPreview, setMotoristaPreview] = useState<Motorista | null>(null);

  const handleCertificar = async (motorista: Motorista) => {
    setCertificando(motorista.id);
    await updateDoc(doc(db, "turmas-integracao", turma.id, "motoristas", motorista.id), {
      certificadoEmitidoEm: Timestamp.now(),
    });
    setMotoristas(prev =>
      prev.map(m => m.id === motorista.id ? { ...m, certificadoEmitidoEm: Timestamp.now() } : m)
    );
    setCertificando(null);
    toast.success("Certificado emitido!");
  };

  const motoristasConvocados = motoristas.filter(m => !m.notificadoEm && !m.certificadoEmitidoEm);
  const motoristasNotificados = motoristas.filter(m => m.notificadoEm && !m.certificadoEmitidoEm);
  const motoristasCertificados = motoristas.filter(m => m.certificadoEmitidoEm);

  return (
    <Tabs defaultValue="convocados" className="w-full">
      <TabsList className="mb-4 flex flex-wrap gap-2">
        <TabsTrigger value="convocados">Convocados</TabsTrigger>
        <TabsTrigger value="notificados">Notificados</TabsTrigger>
        <TabsTrigger value="certificados">Certificados</TabsTrigger>
      </TabsList>
      <TabsContent value="convocados">
        <div className="space-y-3">
          {motoristasConvocados.length === 0 && <div className="text-center text-gray-400">Nenhum motorista convocado</div>}
          {motoristasConvocados.map(motorista => (
            <div key={motorista.id} className="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow p-4 gap-4">
              <div className="flex-1 w-full">
                <div className="font-bold text-lg">{motorista.nome}</div>
                <div className="text-sm text-gray-600">{motorista.telefone}</div>
                <div className="text-xs text-gray-400">UN: {motorista.unidade} | Placa: {motorista.placa} | Modelo: {motorista.modelo}</div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <BotaoNotificar motorista={motorista} turma={turma} setMotoristas={setMotoristas} />
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="notificados">
        <div className="space-y-3">
          {motoristasNotificados.length === 0 && <div className="text-center text-gray-400">Nenhum motorista notificado</div>}
          {motoristasNotificados.map(motorista => (
            <div key={motorista.id} className="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow p-4 gap-4">
              <div className="flex-1 w-full">
                <div className="font-bold text-lg">{motorista.nome}</div>
                <div className="text-sm text-gray-600">{motorista.telefone}</div>
                <div className="text-xs text-gray-400">UN: {motorista.unidade} | Placa: {motorista.placa} | Modelo: {motorista.modelo}</div>
                <div className="text-xs text-blue-600 mt-1">Notificado</div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <BotaoNotificar motorista={motorista} turma={turma} setMotoristas={setMotoristas} />
                <button
                  className="btn btn-primary"
                  onClick={() => handleCertificar(motorista)}
                  disabled={certificando === motorista.id}
                >
                  {certificando === motorista.id ? "Emitindo..." : "Emitir Certificado"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="certificados">
        <div className="space-y-3">
          {motoristasCertificados.length === 0 && <div className="text-center text-gray-400">Nenhum certificado emitido</div>}
          {motoristasCertificados.map(motorista => (
            <div key={motorista.id} className="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow p-4 gap-4">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mr-4" />
              <div className="flex-1 w-full">
                <div className="font-bold text-lg">{motorista.nome}</div>
                <div className="text-sm text-gray-600">{motorista.telefone}</div>
                <div className="text-xs text-gray-400">UN: {motorista.unidade} | Placa: {motorista.placa} | Modelo: {motorista.modelo}</div>
                <div className="text-xs text-green-600 mt-1">Certificado emitido</div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
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
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
});

export default ListaMotoristas;
