import React from 'react';
import { FaStar, FaEye } from 'react-icons/fa';

interface PesquisaSatisfacao {
  id: string;
  nome: string;
  telefone: string;
  prefixoVeiculo?: string;
  media?: number;
  observacoes?: string;
  dataEnvio?: string | Date;
  [key: string]: any;
}

interface SatisfactionTableProps {
  pesquisas: PesquisaSatisfacao[];
  loading: boolean;
  erro: string;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  showSensitive: boolean;
  setDetalheAvaliacao: (p: PesquisaSatisfacao) => void;
  formatarData: (d: any) => string;
  mask: (v: any) => string;
  calcularMedia: (p: PesquisaSatisfacao) => number | null;
}

const SatisfactionTable: React.FC<SatisfactionTableProps> = ({
  pesquisas, loading, erro, selectedIds, setSelectedIds, expanded, setExpanded, showSensitive, setDetalheAvaliacao, formatarData, mask, calcularMedia
}) => (
  <div style={{ overflowX: "auto", background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px #0001", padding: 16 }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, minWidth: 600 }}>
      <thead>
        <tr style={{ background: "#f5f5f5", color: '#1976d2' }}>
          <th style={{ padding: 10, border: "1px solid #eee" }}>
            <input
              type="checkbox"
              checked={pesquisas.length > 0 && selectedIds.length === pesquisas.length}
              onChange={e => {
                if (e.target.checked) setSelectedIds(pesquisas.map(p => p.id));
                else setSelectedIds([]);
              }}
              aria-label="Selecionar todos"
            />
          </th>
          <th style={{ padding: 10, border: "1px solid #eee" }}>Data</th>
          <th style={{ padding: 10, border: "1px solid #eee" }}>Nome</th>
          <th style={{ padding: 10, border: "1px solid #eee" }}>Telefone</th>
          <th style={{ padding: 10, border: "1px solid #eee" }}>Prefixo</th>
          <th style={{ padding: 10, border: "1px solid #eee" }}>Média (★)</th>
          <th style={{ padding: 10, border: "1px solid #eee" }}></th>
        </tr>
      </thead>
      <tbody>
        {loading && (
          <tr><td colSpan={8} style={{ textAlign: "center", padding: 24 }}>Carregando...</td></tr>
        )}
        {erro && (
          <tr><td colSpan={8} style={{ color: "red", textAlign: "center", padding: 24 }}>{erro}</td></tr>
        )}
        {pesquisas.length === 0 && (
          <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: '#888' }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🔍</span>
            Nenhuma pesquisa encontrada para os filtros selecionados.
          </td></tr>
        )}
        {pesquisas.map((p, idx) => (
          <React.Fragment key={p.id}>
            <tr style={{ background: idx % 2 === 0 ? "#f9f9f9" : "#fff", transition: 'background 0.2s', ...(expanded === p.id ? { background: '#f0f6ff' } : {}) }}>
              <td style={{ padding: 10, border: "1px solid #eee", textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedIds([...selectedIds, p.id]);
                    else setSelectedIds(selectedIds.filter(id => id !== p.id));
                  }}
                  aria-label="Selecionar avaliação"
                />
              </td>
              <td style={{ padding: 10, border: "1px solid #eee" }}>{formatarData(p.dataEnvio)}</td>
              <td style={{ padding: 10, border: "1px solid #eee" }}>{showSensitive ? p.nome : mask(p.nome)}</td>
              <td style={{ padding: 10, border: "1px solid #eee" }}>{showSensitive ? p.telefone : mask(p.telefone)}</td>
              <td style={{ padding: 10, border: "1px solid #eee" }}>{showSensitive ? p.prefixoVeiculo : mask(p.prefixoVeiculo)}</td>
              <td style={{ padding: 10, border: "1px solid #eee" }}>
                <span style={{ marginRight: 4 }}>
                  {calcularMedia(p) !== null ? calcularMedia(p)!.toFixed(2) : '-'}
                </span>
                {calcularMedia(p) !== null && (
                  <span>
                    {[1, 2, 3, 4, 5].map(star => (
                      <FaStar
                        key={star}
                        style={{ color: star <= Math.round(calcularMedia(p)!) ? '#fbbf24' : '#ccc', marginRight: 1, verticalAlign: 'middle' }}
                        size={14}
                      />
                    ))}
                  </span>
                )}
              </td>
              <td style={{ padding: 10, border: "1px solid #eee", textAlign: 'center' }}>
                <button
                  onClick={() => setDetalheAvaliacao(p)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1976d2', fontSize: 18 }}
                  title="Ver detalhes"
                >
                  <FaEye />
                </button>
              </td>
            </tr>
            {expanded === p.id && (
              <tr style={{ background: '#f0f6ff' }}>
                <td colSpan={8} style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    <div><b>Pergunta 1:</b> {p.pergunta1 || '-'}</div>
                    <div><b>Pergunta 2:</b> {p.pergunta2 || '-'}</div>
                    <div><b>Pergunta 3:</b> {p.pergunta3 || '-'}</div>
                    <div><b>Pergunta 4:</b> {p.pergunta4 || '-'}</div>
                    <div><b>Pergunta 5:</b> {p.pergunta5 || '-'}</div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
);

export default SatisfactionTable; 