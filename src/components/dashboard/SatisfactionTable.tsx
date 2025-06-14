import React from 'react';
import { FaStar, FaEye, FaChevronDown, FaChevronUp, FaComment, FaCalendar, FaUser, FaPhone, FaCar } from 'react-icons/fa';

interface PesquisaSatisfacao {
  id: string;
  nome: string;
  telefone: string;
  prefixoVeiculo?: string;
  media?: number;
  observacoes?: string;
  dataEnvio?: Date;
  pergunta1?: string;
  pergunta2?: string;
  pergunta3?: string;
  pergunta4?: string;
  pergunta5?: string;
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
  formatarData: (d: string | Date) => string;
  mask: (v: string | undefined) => string;
  calcularMedia: (p: PesquisaSatisfacao) => number | null;
}

const SatisfactionTable: React.FC<SatisfactionTableProps> = ({
  pesquisas, loading, erro, selectedIds, setSelectedIds, expanded, setExpanded, 
  showSensitive, setDetalheAvaliacao, formatarData, mask, calcularMedia
}) => {
  const getMediaColor = (media: number | null) => {
    if (media === null) return '#9ca3af';
    if (media >= 4.5) return '#10b981';
    if (media >= 3.5) return '#f59e0b';
    if (media >= 2.5) return '#f97316';
    return '#ef4444';
  };

  const getMediaBadge = (media: number | null) => {
    if (media === null) return 'N/A';
    if (media >= 4.5) return 'Excelente';
    if (media >= 3.5) return 'Bom';
    if (media >= 2.5) return 'Regular';
    return 'Ruim';
  };

  const perguntas = [
    "Como você avalia a pontualidade do motorista?",
    "Como você avalia a educação e cortesia do motorista?",
    "Como você avalia a condução do veículo?",
    "Como você avalia as condições do veículo?",
    "Como você avalia o atendimento geral?"
  ];

  const getRespostaTexto = (valor: string | undefined) => {
    if (!valor) return 'Não respondida';
    const num = parseInt(valor);
    if (num >= 5) return `⭐⭐⭐⭐⭐ (${num}) - Excelente`;
    if (num >= 4) return `⭐⭐⭐⭐ (${num}) - Bom`;
    if (num >= 3) return `⭐⭐⭐ (${num}) - Regular`;
    if (num >= 2) return `⭐⭐ (${num}) - Ruim`;
    if (num >= 1) return `⭐ (${num}) - Muito Ruim`;
    return valor;
  };

  return (
    <div className="satisfaction-table-container">
      <div className="table-wrapper">
        <table className="satisfaction-table">
          <thead>
            <tr className="table-header">
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  className="header-checkbox"
                  checked={pesquisas.length > 0 && selectedIds.length === pesquisas.length}
                  onChange={e => {
                    if (e.target.checked) setSelectedIds(pesquisas.map(p => p.id));
                    else setSelectedIds([]);
                  }}
                  aria-label="Selecionar todos"
                />
              </th>
              <th className="info-column">
                <div className="header-content">
                  <FaCalendar className="header-icon" />
                  <span>Informações Gerais</span>
                </div>
              </th>
              <th className="rating-column">
                <div className="header-content">
                  <FaStar className="header-icon" />
                  <span>Avaliação</span>
                </div>
              </th>
              <th className="actions-column">
                <span>Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="status-cell">
                  <div className="status-content loading">
                    <div className="loading-spinner"></div>
                    <span>Carregando avaliações...</span>
                  </div>
                </td>
              </tr>
            )}
            {erro && (
              <tr>
                <td colSpan={4} className="status-cell">
                  <div className="status-content error">
                    <span className="status-icon">⚠️</span>
                    <span>{erro}</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading && !erro && pesquisas.length === 0 && (
              <tr>
                <td colSpan={4} className="status-cell">
                  <div className="status-content empty">
                    <span className="status-icon">🔍</span>
                    <div>
                      <h3>Nenhuma avaliação encontrada</h3>
                      <p>Tente ajustar os filtros para encontrar resultados.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {pesquisas.map((p) => {
              const media = calcularMedia(p);
              const isExpanded = expanded === p.id;
              const isSelected = selectedIds.includes(p.id);
              
              return (
                <React.Fragment key={p.id}>
                  <tr className={`table-row ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        className="row-checkbox"
                        checked={isSelected}
                        onChange={e => {
                          if (e.target.checked) setSelectedIds([...selectedIds, p.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== p.id));
                        }}
                        aria-label="Selecionar avaliação"
                      />
                    </td>
                    <td className="info-cell">
                      <div className="info-content">
                        <div className="info-header">
                          <div className="date-badge">
                            <FaCalendar size={12} />
                            <span>{formatarData(p.dataEnvio)}</span>
                          </div>
                          {p.observacoes && (
                            <div className="observation-badge" title="Possui observação">
                              <FaComment size={12} />
                              <span>Obs</span>
                            </div>
                          )}
                        </div>
                        <div className="info-details">
                          <div className="info-item">
                            <FaUser className="info-icon" />
                            <span className="info-label">Nome:</span>
                            <span className="info-value">{showSensitive ? p.nome : mask(p.nome)}</span>
                          </div>
                          <div className="info-item">
                            <FaPhone className="info-icon" />
                            <span className="info-label">Telefone:</span>
                            <span className="info-value">{showSensitive ? p.telefone : mask(p.telefone)}</span>
                          </div>
                          <div className="info-item">
                            <FaCar className="info-icon" />
                            <span className="info-label">Prefixo:</span>
                            <span className="info-value prefix">{showSensitive ? p.prefixoVeiculo : mask(p.prefixoVeiculo)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="rating-cell">
                      <div className="rating-content">
                        <div className="rating-main">
                          <div className="rating-score" style={{ color: getMediaColor(media) }}>
                            {media !== null ? media.toFixed(1) : 'N/A'}
                          </div>
                          <div className="rating-stars">
                            {media !== null && [1, 2, 3, 4, 5].map(star => (
                              <FaStar
                                key={star}
                                className={`star ${star <= Math.round(media) ? 'filled' : 'empty'}`}
                                size={14}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="rating-badge" style={{ backgroundColor: getMediaColor(media) }}>
                          {getMediaBadge(media)}
                        </div>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-content">
                        <button
                          className="action-button view-button"
                          onClick={() => setDetalheAvaliacao(p)}
                          title="Ver detalhes completos"
                        >
                          <FaEye size={14} />
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="expanded-row">
                      <td colSpan={4} className="expanded-cell">
                        <div className="expanded-content">
                          <div className="expanded-header">
                            <h4>📋 Detalhes da Avaliação</h4>
                            <div className="expanded-summary">
                              <span>Média Geral: <strong style={{ color: getMediaColor(media) }}>{media?.toFixed(1) || 'N/A'}</strong></span>
                            </div>
                          </div>
                          
                          <div className="questions-grid">
                            {perguntas.map((pergunta, index) => {
                              const respostaKey = `pergunta${index + 1}` as keyof PesquisaSatisfacao;
                              const resposta = p[respostaKey] as string;
                              
                              return (
                                <div key={index} className="question-item">
                                  <div className="question-header">
                                    <span className="question-number">{index + 1}</span>
                                    <span className="question-text">{pergunta}</span>
                                  </div>
                                  <div className="answer-content">
                                    <span className="answer-text">{getRespostaTexto(resposta)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {p.observacoes && (
                            <div className="observations-section">
                              <div className="observations-header">
                                <FaComment className="obs-icon" />
                                <h5>Observações do Cliente</h5>
                              </div>
                              <div className="observations-content">
                                <p>{p.observacoes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <style>{`
        .satisfaction-table-container {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        
        .table-wrapper {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        
        .table-wrapper::-webkit-scrollbar {
          height: 8px;
        }
        
        .table-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .table-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .satisfaction-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          min-width: 900px;
        }
        
        .table-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .table-header th {
          padding: 20px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 3px solid #5a67d8;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .header-icon {
          opacity: 0.9;
        }
        
        .checkbox-column {
          width: 60px;
          text-align: center;
        }
        
        .info-column {
          width: 45%;
        }
        
        .rating-column {
          width: 25%;
        }
        
        .actions-column {
          width: 15%;
          text-align: center;
        }
        
        .header-checkbox,
        .row-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #667eea;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .table-row {
          transition: all 0.3s ease;
          border-bottom: 1px solid #f3f4f6;
          background: white;
        }
        
        .table-row:nth-child(even) {
          background-color: #fafbfc;
        }
        
        .table-row:hover {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .table-row.selected {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-left: 5px solid #667eea;
        }
        
        .table-row.expanded {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
        
        .table-row td {
          padding: 20px 16px;
          vertical-align: top;
        }
        
        .checkbox-cell {
          text-align: center;
        }
        
        .info-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .info-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .date-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .observation-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .info-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 3px solid #e2e8f0;
        }
        
        .info-icon {
          color: #667eea;
          flex-shrink: 0;
        }
        
        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          min-width: 60px;
        }
        
        .info-value {
          font-weight: 500;
          color: #1e293b;
        }
        
        .info-value.prefix {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .rating-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        
        .rating-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .rating-score {
          font-size: 32px;
          font-weight: 800;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .rating-stars {
          display: flex;
          gap: 4px;
        }
        
        .star.filled {
          color: #fbbf24;
          filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));
        }
        
        .star.empty {
          color: #d1d5db;
        }
        
        .rating-badge {
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .actions-content {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        
        .action-button {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .view-button {
          color: #667eea;
          border-color: #667eea;
        }
        
        .view-button:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(102, 126, 234, 0.3);
        }
        
        .expand-button {
          color: #6b7280;
          border-color: #6b7280;
        }
        
        .expand-button:hover {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(107, 114, 128, 0.3);
        }
        
        .expanded-row {
          background: #f8fafc;
        }
        
        .expanded-cell {
          padding: 0;
        }
        
        .expanded-content {
          padding: 24px;
          border-top: 3px solid #667eea;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .expanded-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .expanded-header h4 {
          margin: 0;
          color: #667eea;
          font-size: 18px;
          font-weight: 700;
        }
        
        .expanded-summary {
          font-size: 14px;
          color: #64748b;
        }
        
        .questions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .question-item {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #667eea;
        }
        
        .question-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .question-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .question-text {
          font-weight: 600;
          color: #374151;
          line-height: 1.4;
        }
        
        .answer-content {
          padding-left: 36px;
        }
        
        .answer-text {
          color: #1e293b;
          font-weight: 500;
          font-size: 15px;
        }
        
        .observations-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #f59e0b;
        }
        
        .observations-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .obs-icon {
          color: #f59e0b;
        }
        
        .observations-header h5 {
          margin: 0;
          color: #374151;
          font-size: 16px;
          font-weight: 600;
        }
        
        .observations-content p {
          margin: 0;
          color: #1e293b;
          line-height: 1.6;
          font-style: italic;
        }
        
        .status-cell {
          padding: 48px 24px;
          text-align: center;
        }
        
        .status-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .status-content.loading {
          color: #6b7280;
        }
        
        .status-content.error {
          color: #dc2626;
        }
        
        .status-content.empty {
          color: #6b7280;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .status-icon {
          font-size: 48px;
        }
        
        .status-content h3 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 20px;
        }
        
        .status-content p {
          margin: 0;
          font-size: 14px;
        }
        
        @media (max-width: 1024px) {
          .questions-grid {
            grid-template-columns: 1fr;
          }
          
          .info-details {
            gap: 6px;
          }
          
          .info-item {
            padding: 6px 10px;
          }
        }
        
        @media (max-width: 768px) {
          .satisfaction-table {
            font-size: 12px;
            min-width: 700px;
          }
          
          .table-header th {
            padding: 16px 12px;
            font-size: 12px;
          }
          
          .table-row td {
            padding: 16px 12px;
          }
          
          .rating-score {
            font-size: 24px;
          }
          
          .expanded-content {
            padding: 16px;
          }
          
          .question-item {
            padding: 12px;
          }
          
          .observations-section {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default SatisfactionTable;