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
    const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#fff" });
    const nomeSanitizado = motorista.nome
      .replace(/\s+/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const link = document.createElement("a");
    link.download = `certificado-${nomeSanitizado}.png`;
    link.href = canvas.toDataURL();
    link.click();
    onEmitido();
  };

  return (
    <div className="overflow-x-auto w-full flex flex-col items-center">
      <div
        ref={ref}
        className="w-[900px] max-w-full h-[540px] bg-white flex flex-col items-center justify-between relative p-10 shadow-2xl"
        style={{
          fontFamily: "'Montserrat', Arial, sans-serif",
          border: "12px solid transparent",
          borderImage: "linear-gradient(120deg, #22c55e 10%, #fff 40%, #16a34a 60%, #4ade80 90%) 1",
          borderRadius: "2.5rem",
        }}
      >
        {/* Três linhas onduladas na lateral esquerda */}
        <svg
          className="absolute left-0 top-0 h-full w-[70px] z-10"
          viewBox="0 0 70 540"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10,0 Q35,130 10,260 Q-15,390 10,540 L30,540 Q5,390 30,260 Q55,130 30,0 Z" fill="#4ade80" />
          <path d="M30,0 Q55,130 30,260 Q5,390 30,540 L50,540 Q25,390 50,260 Q75,130 50,0 Z" fill="#22c55e" />
          <path d="M50,0 Q75,130 50,260 Q25,390 50,540 L70,540 Q45,390 70,260 Q95,130 70,0 Z" fill="#16a34a" />
        </svg>
        {/* Logo D-Taxi do lado direito */}
        <img
          src="/logo.png"
          alt="Logo D-Taxi"
          className="absolute top-6 right-0 w-32 h-auto object-contain"
          style={{ background: "transparent" }}
        />
        {/* Título */}
        <h2 className="text-4xl sm:text-4xl font-bold text-black uppercase tracking-wider mb-2 mt-2 text-center w-full">
          Certificado de Conclusão
        </h2>
        {/* Nome do motorista */}
        <div
          className="text-3xl sm:text-4xl text-green-700 font-semibold mb-2 text-center w-full"
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          {motorista.nome}
        </div>
        {/* Texto institucional */}
        <p className="text-gray-700 text-base sm:text-lg max-w-[80%] mx-auto mb-2 text-center">
          Parabenizamos motorista pela participação e conclusão da Integração, promovida pela D-Taxi, realizada em <span className="font-semibold">{turma.data}</span>.
        </p>
        <p className="text-gray-600 text-sm sm:text-base max-w-[80%] mx-auto mb-4 text-center">
          Este certificado reconhece o compromisso com a excelência, segurança e profissionalismo no transporte.
        </p>
       
        {/* Data e assinatura */}
        <div className="flex justify-between items-end w-[80%] mx-auto mt-4 text-sm text-gray-700">
          <div>
            <div className="border-t border-gray-400 w-40 text-center">Mauricio Alonso</div>
            <div className="text-xs mt-1 text-gray-500 text-center">Presidência D-Taxi</div>
          </div>
          <div className="flex flex-col items-end">
            {/* Assinatura real (opcional) */}
            {/* <img src="/assinatura.png" alt="Assinatura" className="w-28 sm:w-40 mb-1 opacity-80" style={{ background: 'transparent' }} /> */}
            <div className="border-t border-gray-400 w-40 text-center">Coordenação D-Taxi</div>
            
          </div>
        </div>
      </div>
      <button
        className="btn btn-primary mt-4 w-full sm:w-auto shadow-lg"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? "Emitindo..." : "Emitir Certificado"}
      </button>
    </div>
  );
};

export default CertificadoImagem;
