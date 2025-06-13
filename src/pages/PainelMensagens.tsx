import React, { useState, useRef, useEffect } from 'react';
import TabsMensagens, { categorias } from '@/components/mensagens/TabsMensagens';
import TabelaMensagens from '@/components/mensagens/TabelaMensagens';
import ModalMensagem from '@/components/mensagens/ModalMensagem';
import ImpressaoMensagem from '@/components/mensagens/ImpressaoMensagem';
import { useMensagens } from '@/hooks/useMensagens';
import { useAuth } from '@/hooks/useAuth';
import { Mensagem } from '@/services/firebaseService';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, Timestamp, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';

// Corrigido para corresponder ao mapeamento em useMensagens.ts
const colecaoPorTipo: Record<string, string> = {
  reclamacao: 'reclamacoes',
  sugestao: 'sugestoes',
  informacao: 'informacoes',
  elogio: 'elogios',
  duvida: 'duvidas', // Adicionado duvida que estava faltando
  outro: 'outras-mensagens',
  arquivadas: 'arquivadas', // Corrigido para corresponder ao useMensagens.ts
};

export default function PainelMensagens() {
  const [categoria, setCategoria] = useState('reclamacao');
  // Corrigido para desestruturar o objeto retornado pelo hook
  const { mensagens, loading, error, refresh } = useMensagens(categoria);
  const [mensagemSelecionada, setMensagemSelecionada] = useState<Mensagem | null>(null);
  const [imprimir, setImprimir] = useState<{ mensagem: Mensagem, ocultar: boolean } | null>(null);
  const { user } = useAuth();

  // Contagem de mensagens por categoria para badges
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let ativo = true;
    async function fetchCounts() {
      const results: Record<string, number> = {};
      try {
        for (const cat of categorias) {
          const col = colecaoPorTipo[cat.value];
          if (!col) continue; // Pular se não houver mapeamento
          
          const q = collection(db, col);
          const snap = await getDocs(q);
          
          if (cat.value === 'arquivadas') {
            results[cat.value] = snap.size;
          } else {
            // Only count non-archived
            results[cat.value] = snap.docs.filter(doc => !doc.data().dataArquivamento).length;
          }
        }
        if (ativo) setCounts(results);
      } catch (err) {
        console.error('Erro ao buscar contagens:', err);
      }
    }
    fetchCounts();
    return () => { ativo = false; };
  }, [mensagemSelecionada]);

  // Arquivar
  async function handleArquivar(msg: Mensagem) {
    if (!user) return;
    try {
      const refOrigem = doc(db, colecaoPorTipo[categoria], msg.id!);
      const refDestino = doc(db, colecaoPorTipo['arquivadas'], msg.id!);
      
      // Garantir que todos os campos obrigatórios estejam presentes
      const mensagemCompleta = {
        ...msg,
        // Campos obrigatórios com valores padrão se estiverem undefined
        protocolo: msg.protocolo || null,
        nome: msg.nome || '',
        email: msg.email || '',
        telefone: msg.telefone || '',
        mensagem: msg.mensagem || '',
        prefixo: msg.prefixo || '',
        tipo: msg.tipo || categoria, // Usar categoria atual se tipo for undefined
        assunto: msg.assunto || 'Sem assunto', // Corrigir campo undefined
        status: msg.status || 'pendente',
        politicaPrivacidade: msg.politicaPrivacidade || false,
        dataCriacao: msg.dataCriacao || Timestamp.now(),
        dataArquivamento: Timestamp.now(),
        resolvido: msg.resolvido || false,
        ...(msg.resolucao !== undefined && { resolucao: msg.resolucao }),
        historico: [
          ...(msg.historico || []),
          {
            acao: 'arquivado',
            usuario: { uid: user.uid, nome: user.displayName || 'Usuário' },
            data: Timestamp.now(),
          }
        ]
      };
      
      await setDoc(refDestino, mensagemCompleta);
      await deleteDoc(refOrigem);
      setMensagemSelecionada(null);
      // Atualizar a lista após arquivar
      await refresh();
    } catch (err) {
      console.error('Erro ao arquivar mensagem:', err);
      alert('Erro ao arquivar mensagem. Verifique o console para mais detalhes.');
    }
  }

  // Migrar
  async function handleMigrar(msg: Mensagem, novoTipo: string) {
    if (!user) return;
    try {
      const refOrigem = doc(db, colecaoPorTipo[categoria], msg.id!);
      const refDestino = doc(db, colecaoPorTipo[novoTipo], msg.id!);
      
      // Garantir que todos os campos obrigatórios estejam presentes
      const mensagemCompleta = {
        ...msg,
        // Campos obrigatórios com valores padrão se estiverem undefined
        protocolo: msg.protocolo || null,
        nome: msg.nome || '',
        email: msg.email || '',
        telefone: msg.telefone || '',
        mensagem: msg.mensagem || '',
        prefixo: msg.prefixo || '',
        tipo: novoTipo as keyof typeof colecaoPorTipo,
        assunto: msg.assunto || 'Sem assunto', // Corrigir campo undefined
        status: msg.status || 'pendente',
        politicaPrivacidade: msg.politicaPrivacidade || false,
        dataCriacao: msg.dataCriacao || Timestamp.now(),
        resolvido: msg.resolvido || false,
        ...(msg.resolucao !== undefined && { resolucao: msg.resolucao }),
        historico: [
          ...(msg.historico || []),
          {
            acao: 'migrado',
            usuario: { uid: user.uid, nome: user.displayName || 'Usuário' },
            data: Timestamp.now(),
            observacao: `Migrado de ${categoria} para ${novoTipo}`
          }
        ]
      };
      
      await setDoc(refDestino, mensagemCompleta);
      await deleteDoc(refOrigem);
      setMensagemSelecionada(null);
      // Atualizar a lista após arquivar
      await refresh();
    } catch (err) {
      console.error('Erro ao migrar mensagem:', err);
      alert('Erro ao migrar mensagem. Verifique o console para mais detalhes.');
    }
  }

  // Desarquivar
  async function handleDesarquivar(msg: Mensagem) {
    if (!user) return;
    try {
      const refOrigem = doc(db, colecaoPorTipo['arquivadas'], msg.id!);
      const refDestino = doc(db, colecaoPorTipo[msg.tipo], msg.id!);
      
      // Garantir que todos os campos obrigatórios estejam presentes
      const mensagemCompleta = {
        ...msg,
        // Campos obrigatórios com valores padrão se estiverem undefined
        protocolo: msg.protocolo || null,
        nome: msg.nome || '',
        email: msg.email || '',
        telefone: msg.telefone || '',
        mensagem: msg.mensagem || '',
        prefixo: msg.prefixo || '',
        tipo: msg.tipo || categoria, // Usar categoria atual se tipo for undefined
        assunto: msg.assunto || 'Sem assunto', // Corrigir campo undefined
        status: msg.status || 'pendente',
        politicaPrivacidade: msg.politicaPrivacidade || false,
        dataCriacao: msg.dataCriacao || Timestamp.now(),
        dataArquivamento: null,
        resolvido: msg.resolvido || false,
        ...(msg.resolucao !== undefined && { resolucao: msg.resolucao }),
        historico: [
          ...(msg.historico || []),
          {
            acao: 'desarquivado',
            usuario: { uid: user.uid, nome: user.displayName || 'Usuário' },
            data: Timestamp.now(),
          }
        ]
      };
      
      await setDoc(refDestino, mensagemCompleta);
      await deleteDoc(refOrigem);
      setMensagemSelecionada(null);
      // Atualizar a lista após arquivar
      await refresh();
    } catch (err) {
      console.error('Erro ao desarquivar mensagem:', err);
      alert('Erro ao desarquivar mensagem. Verifique o console para mais detalhes.');
    }
  }

  // Imprimir
  function handleImprimir(msg: Mensagem) {
    setImprimir({ mensagem: msg, ocultar: false });
  }

  // Migração com seleção de destino amigável
  function handleMigrarPrompt(msg: Mensagem) {
    const opcoes = categorias.filter(c => c.value !== categoria && c.value !== 'arquivadas');
    const novoTipo = window.prompt(
      'Migrar para qual categoria?\n' + opcoes.map(c => `${c.value} - ${c.label}`).join('\n'),
      opcoes[0].value
    );
    if (novoTipo && colecaoPorTipo[novoTipo]) {
      handleMigrar(msg, novoTipo);
    }
  }

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
    return '**';
  }

  // Adicione esta importação no topo do arquivo se ainda não existir
// Helper function to format dates
const formatarData = (date: Date | { toDate: () => Date } | null | undefined): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

  function gerarPdf(mensagem: Mensagem, ocultar: boolean) {
    const doc = new jsPDF();
    let y = 0;
    
    // Cabeçalho
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Painel de Mensagens - D-TAXI', 105, 12, { align: 'center' });

    // Protocolo destacado
    y = 26;
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text(`Protocolo: ${mensagem.protocolo}`, 10, y);

    // Linha divisória
    y += 4;
    doc.setDrawColor(22, 163, 74);
    doc.line(10, y, 200, y);

    // Dados principais
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0,0,0);
    doc.text(`Tipo: ${mensagem.tipo}`, 10, y);
    doc.text(`Prefixo: ${mensagem.prefixo}`, 70, y);
    doc.text(`Data: ${formatarData(mensagem.dataCriacao)}`, 130, y);

    y += 8;
    doc.text(`Nome: ${ocultar ? mascarar(mensagem.nome, 'nome') : mensagem.nome}`, 10, y);
    doc.text(`E-mail: ${ocultar ? mascarar(mensagem.email, 'email') : mensagem.email}`, 70, y);
    doc.text(`Telefone: ${ocultar ? mascarar(mensagem.telefone, 'telefone') : mensagem.telefone}`, 130, y);

    // Mensagem
    y += 12;
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74);
    doc.text('Mensagem:', 10, y);
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(0,0,0);
    doc.setDrawColor(200);
    doc.rect(10, y-3, 190, 18, 'S');
    doc.text(doc.splitTextToSize(mensagem.mensagem || '',180), 12, y+4);

    // Histórico
    y += 48;
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74);
    doc.text('Histórico de Movimentações:', 10, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(0,0,0);
    if (mensagem.historico && mensagem.historico.length > 0) {
      mensagem.historico.forEach(h => {
        const data = h.data instanceof Timestamp ? h.data.toDate() : h.data;
        const linha = `[${data.toLocaleDateString('pt-BR')}] ${h.acao} por ${ocultar ? '***' : (h.usuario?.nome || 'Usuário')}${h.observacao ? ' - ' + h.observacao : ''}`;
        doc.text(doc.splitTextToSize(linha, 180), 12, y);
        y += 6;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    } else {
      doc.text('Nenhum histórico registrado.', 12, y);
      y += 6;
    }

    // Rodapé
    y = 285;
    doc.setDrawColor(22, 163, 74);
    doc.line(10, y-5, 200, y-5);
    doc.setFontSize(9);
    doc.setTextColor(120);
    if (ocultar) {
      doc.text('*Dados parcialmente ocultados por motivo de sigilo conforme LGPD.', 10, y-1);
    }
    doc.text('Este documento é confidencial.', 10, y+3);

    doc.save(`mensagem-${mensagem.protocolo}.pdf`);
    
    // Fechar o modal após gerar o PDF
    setImprimir(null);
  }

  return (
    <div className="container mx-auto py-8">
      <TabsMensagens 
        value={categoria}
        onChange={setCategoria} 
        counts={counts} 
      />
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Carregando mensagens...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <TabelaMensagens
          mensagens={mensagens || []}
          onVisualizar={setMensagemSelecionada}
          onArquivar={categoria !== 'arquivadas' ? handleArquivar : undefined}
          onMigrar={categoria !== 'arquivadas' ? handleMigrarPrompt : undefined}
          onDesarquivar={categoria === 'arquivadas' ? handleDesarquivar : undefined}
        />
      )}
      <ModalMensagem
        mensagem={mensagemSelecionada}
        open={!!mensagemSelecionada}
        onClose={() => setMensagemSelecionada(null)}
        onMarcarResolvido={() => mensagemSelecionada && handleArquivar({ ...mensagemSelecionada, resolvido: true })}
        onArquivar={() => mensagemSelecionada && handleArquivar(mensagemSelecionada)}
        onMigrar={() => mensagemSelecionada && handleMigrarPrompt(mensagemSelecionada)}
        onImprimir={() => mensagemSelecionada && handleImprimir(mensagemSelecionada)}
      />
      {imprimir && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 z-0 pointer-events-none" />
          <div className="relative z-10 bg-white rounded-lg shadow-2xl max-w-3xl w-full print-modal flex flex-col max-h-[95vh] pointer-events-auto border-2 border-taxi-green">
            <div className="flex-shrink-0 flex items-center justify-between gap-4 p-4 border-b">
              <button onClick={() => setImprimir(null)} className="bg-taxi-green text-white px-3 py-1 rounded shadow">Fechar</button>
              <label className="block mb-0">
                <input
                  type="checkbox"
                  checked={imprimir.ocultar}
                  onChange={e => setImprimir({ ...imprimir, ocultar: e.target.checked })}
                /> Ocultar dados sensíveis (LGPD)
              </label>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div id="print-area">
                <ImpressaoMensagem mensagem={imprimir.mensagem} ocultarDados={imprimir.ocultar} className="print:p-0 print:max-w-full print:mx-0 print:break-inside-avoid" />
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => gerarPdf(imprimir.mensagem, imprimir.ocultar)}
                className="bg-blue-600 text-white px-6 py-2 rounded shadow text-lg font-semibold hover:bg-blue-700"
              >
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}