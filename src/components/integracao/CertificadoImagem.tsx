import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Motorista, Turma } from "./types";

interface Props {
  motorista: Motorista;
  turma: Turma;
  onEmitido: () => void;
  loading: boolean;
}

const CertificadoImagem: React.FC<Props> = ({ motorista, turma, onEmitido, loading }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current);
    const link = document.createElement("a");
    link.download = `certificado-${motorista.nome}.png`;
    link.href = canvas.toDataURL();
    link.click();
    onEmitido();
  };

  return (
    <div>
      <div ref={ref} className="w-[500px] h-[350px] bg-white border relative flex flex-col items-center justify-center p-8 shadow-lg">
        {/* Fundo personalizado, logo, selo, assinatura, etc */}
        <img src="/logo.png" alt="Logo" className="absolute top-4 left-4 w-20" />
        <h2 className="text-2xl font-bold mt-12">Certificado de Participação</h2>
        <p className="mt-6 text-lg">Parabenizamos <span className="font-bold">{motorista.nome}</span> pela participação no Curso de Treinamento Aprimorado realizado em <span className="font-bold">{turma.data}</span>.</p>
        <div className="absolute bottom-4 right-4 text-right">
          <div className="font-bold">Dtáxi</div>
          <div className="text-xs">Assinatura Digital</div>
        </div>
      </div>
      <button className="btn btn-primary mt-2" onClick={handleDownload} disabled={loading}>
        {loading ? "Emitindo..." : "Emitir Certificado"}
      </button>
    </div>
  );
};

export default CertificadoImagem; 