import { Mensagem } from '@/services/firebaseService';
import { formatarData } from '@/utils/formatarData';
import { Calendar, Hash, CarTaxiFrontIcon } from 'lucide-react';

function mascarar(valor: string | undefined, tipo: 'nome' | 'email' | 'telefone') {
  if (!valor) return '**';
  if (tipo === 'nome') {
    const partes = valor.split(' ');
    return partes[0][0] + '***';
  }
  if (tipo === 'email') {
    const [user, domain] = valor.split('@');
    return user[0] + '***@' + (domain ? domain[0] + '***' : '***');
  }
  if (tipo === 'telefone') {
    return valor.slice(0, 3) + '****' + valor.slice(-2);
  }
  return '***';
}

export default function ImpressaoMensagem({ mensagem, ocultarDados, className = '' }: { mensagem: Mensagem, ocultarDados: boolean, className?: string }) {
  // Sempre mascarar na impressão
  const isPrint = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches;
  const mascararSempre = ocultarDados || isPrint;
  return (
    <div className={`p-6 print:bg-white print:text-black max-w-6x1 mx-auto font-sans ${className}`}>
      {/* Cabeçalho */}
      <header className="mb-8 border-b-4 border-taxi-green pb-4 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-taxi-green tracking-tight">Protocolo: <span className="font-mono text-black">{mensagem.protocolo}</span></h1>
        <div className="flex flex-wrap gap-4 items-center text-base mt-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-taxi-green/10 text-taxi-green font-semibold text-sm">
            {mensagem.tipo}
          </span>
          <span className="inline-flex items-center gap-1 text-gray-700">
            <CarTaxiFrontIcon className="w-4 h-4 text-taxi-green" /> Prefixo: <span className="font-mono">{mensagem.prefixo}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-gray-700">
            <Calendar className="w-4 h-4 text-taxi-green" /> {formatarData(mensagem.dataCriacao)}
          </span>
        </div>
      </header>
      {/* Dados do cliente */}
      <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div><span className="font-semibold text-gray-700">Nome:</span> {mascararSempre ? mascarar(mensagem.nome, 'nome') : mensagem.nome}</div>
        <div><span className="font-semibold text-gray-700">E-mail:</span> {mascararSempre ? mascarar(mensagem.email, 'email') : mensagem.email}</div>
        <div><span className="font-semibold text-gray-700">Telefone:</span> {mascararSempre ? mascarar(mensagem.telefone, 'telefone') : mensagem.telefone}</div>
      </section>
      {/* Mensagem */}
      <section className="mb-8">
        <div className="font-semibold text-gray-700 mb-1">Mensagem:</div>
        <div className="whitespace-pre-line break-words bg-gray-50 rounded-lg p-4 border text-justify shadow-sm text-lg">
          {mensagem.mensagem}
        </div>
      </section>
      {/* Histórico - Timeline visual */}
      <section className="mb-8">
        <div className="font-semibold text-gray-700 mb-2">Histórico de Movimentações:</div>
        <ul className="relative border-l-2 border-taxi-green/40 pl-6 space-y-4">
          {mensagem.historico && mensagem.historico.length > 0 ? (
            mensagem.historico.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-3 top-1 w-4 h-4 bg-taxi-green rounded-full border-2 border-white"></span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-gray-500">{formatarData(h.data)}</span>
                  <span className="font-semibold text-gray-800">{h.acao} <span className="text-gray-500 font-normal">por {mascararSempre ? '***' : (h.usuario?.nome || 'Usuário')}</span></span>
                  {h.observacao && <span className="text-gray-600 text-xs">{h.observacao}</span>}
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-400">Nenhum histórico registrado.</li>
          )}
        </ul>
      </section>
      {/* Rodapé LGPD */}
      <footer className="mt-8 text-xs text-gray-500 border-t pt-4 text-center">
        {mascararSempre && <div className="mb-1">*Dados parcialmente ocultados por motivo de sigilo conforme LGPD.</div>}
        <div>Este relatório é confidencial. Uso restrito conforme LGPD.</div>
      </footer>
    </div>
  );
} 