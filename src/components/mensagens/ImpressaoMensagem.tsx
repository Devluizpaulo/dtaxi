import { Mensagem } from '@/services/firebaseService';
import { formatarData } from '@/utils/formatarData';
import { Calendar, Hash, CarTaxiFrontIcon, User, Mail, Phone } from 'lucide-react';

/**
 * Função para mascarar dados sensíveis conforme LGPD
 * @param valor O valor a ser mascarado
 * @param tipo O tipo de dado (nome, email, telefone)
 * @returns O valor mascarado
 */
function mascarar(valor: string | undefined, tipo: 'nome' | 'email' | 'telefone'): string {
  if (!valor) return '**';
  
  switch (tipo) {
    case 'nome':
      let partes = valor.split(' ');
      if (partes.length === 1) return partes[0][0] + '***';
      return `${partes[0][0]}*** ${partes[partes.length - 1][0]}***`;
      
    case 'email':
      const [user, domain] = valor.split('@');
      if (!domain) return user[0] + '***@***';
      const [domainName, tld] = domain.split('.');
      return `${user[0]}***@${domainName[0]}***.${tld || '***'}`;
      
    case 'telefone':
      // Preserva DDD e últimos 2 dígitos
      return valor.length > 5 
        ? `${valor.slice(0, 3)}****${valor.slice(-2)}` 
        : valor[0] + '****';
      
    default:
      return '***';
  }
}

type ImpressaoMensagemProps = {
  mensagem: Mensagem;
  ocultarDados: boolean;
  className?: string;
};

/**
 * Componente para impressão e geração de PDF de mensagens
 * Exibe todos os detalhes da mensagem em formato adequado para impressão
 * com opção de mascarar dados sensíveis conforme LGPD
 */
export default function ImpressaoMensagem({ mensagem, ocultarDados, className = '' }: ImpressaoMensagemProps) {
  // Determina se deve mascarar dados (sempre mascara na impressão física)
  const isPrint = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches;
  const mascararSempre = ocultarDados || isPrint;
  
  // Verifica se a mensagem tem status resolvido
  const isResolvido = mensagem.status === 'resolvido' || mensagem.resolvido;
  
  return (
    <div className={`p-6 print:bg-white print:text-black max-w-6xl mx-auto font-sans ${className}`} id="documento-impressao">
      {/* Cabeçalho */}
      <header className="mb-8 border-b-4 border-taxi-green pb-4 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-taxi-green tracking-tight">
          Protocolo: <span className="font-mono text-black">{mensagem.protocolo || 'N/A'}</span>
        </h1>
        <div className="flex flex-wrap gap-4 items-center text-base mt-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-taxi-green/10 text-taxi-green font-semibold text-sm">
            {mensagem.tipo}
          </span>
          {isResolvido && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
              Resolvido
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-gray-700">
            <CarTaxiFrontIcon className="w-4 h-4 text-taxi-green print:text-black" /> 
            Prefixo: <span className="font-mono">{mensagem.prefixo || 'N/A'}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-gray-700">
            <Calendar className="w-4 h-4 text-taxi-green print:text-black" /> 
            {formatarData(mensagem.dataCriacao)}
          </span>
        </div>
      </header>
      
      {/* Dados do cliente */}
      <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-taxi-green print:text-black" />
          <span className="font-semibold text-gray-700">Nome:</span> 
          {mascararSempre ? mascarar(mensagem.nome, 'nome') : mensagem.nome || 'N/A'}
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-taxi-green print:text-black" />
          <span className="font-semibold text-gray-700">E-mail:</span> 
          {mascararSempre ? mascarar(mensagem.email, 'email') : mensagem.email || 'N/A'}
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-taxi-green print:text-black" />
          <span className="font-semibold text-gray-700">Telefone:</span> 
          {mascararSempre ? mascarar(mensagem.telefone, 'telefone') : mensagem.telefone || 'N/A'}
        </div>
        {mensagem.assunto && (
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-taxi-green print:text-black" />
            <span className="font-semibold text-gray-700">Assunto:</span> {mensagem.assunto}
          </div>
        )}
      </section>
      
      {/* Mensagem */}
      <section className="mb-8">
        <div className="font-semibold text-gray-700 mb-1">Mensagem:</div>
        <div className="whitespace-pre-line break-words bg-gray-50 print:bg-white rounded-lg p-4 border text-justify shadow-sm print:shadow-none text-lg">
          {mensagem.mensagem || 'Sem conteúdo'}
        </div>
      </section>
      
      {/* Resolução (se existir) */}
      {mensagem.resolucao && (
        <section className="mb-8">
          <div className="font-semibold text-gray-700 mb-1">Resolução:</div>
          <div className="whitespace-pre-line break-words bg-green-50 print:bg-white rounded-lg p-4 border border-green-200 text-justify shadow-sm print:shadow-none">
            {mensagem.resolucao}
          </div>
        </section>
      )}
      
      {/* Histórico - Timeline visual */}
      <section className="mb-8">
        <div className="font-semibold text-gray-700 mb-2">Histórico de Movimentações:</div>
        <ul className="relative border-l-2 border-taxi-green/40 pl-6 space-y-4">
          {mensagem.historico && mensagem.historico.length > 0 ? (
            mensagem.historico.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-3 top-1 w-4 h-4 bg-taxi-green rounded-full border-2 border-white print:border-0"></span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-gray-500">{formatarData(h.data)}</span>
                  <span className="font-semibold text-gray-800">
                    {h.acao} 
                    <span className="text-gray-500 font-normal">
                      por {mascararSempre ? '***' : (h.usuario?.nome || 'Usuário')}
                    </span>
                  </span>
                  {h.observacao && <span className="text-gray-600 text-sm">{h.observacao}</span>}
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
        {mascararSempre && (
          <div className="mb-1">*Dados parcialmente ocultados por motivo de sigilo conforme LGPD.</div>
        )}
        <div>Este relatório é confidencial. Uso restrito conforme LGPD.</div>
        <div className="mt-1">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</div>
      </footer>
    </div>
  );
}