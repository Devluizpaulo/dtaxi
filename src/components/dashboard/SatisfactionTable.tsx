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
        
        .satisfaction-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        
        /* Melhorias para Mobile */
        @media (max-width: 640px) {
          .satisfaction-table {
            font-size: 12px;
          }
          
          .table-header th {
            padding: 12px 8px;
            font-size: 11px;
          }
          
          .table-row td {
            padding: 12px 8px;
          }
          
          .info-content {
            min-width: 200px;
          }
          
          .info-details {
            gap: 4px;
          }
          
          .info-item {
            padding: 4px 8px;
            font-size: 11px;
          }
          
          .rating-score {
            font-size: 18px;
          }
          
          .rating-badge {
            font-size: 10px;
            padding: 2px 6px;
          }
          
          .expanded-content {
            padding: 12px;
          }
          
          .questions-grid {
            gap: 12px;
          }
          
          .question-item {
            padding: 12px;
          }
          
          .question-number {
            width: 20px;
            height: 20px;
            font-size: 10px;
          }
          
          .question-text {
            font-size: 13px;
          }
          
          .answer-text {
            font-size: 12px;
          }
        }
        
        /* Melhorias para Tablet */
        @media (max-width: 1024px) and (min-width: 641px) {
          .satisfaction-table {
            font-size: 13px;
          }
          
          .questions-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          
          .info-details {
            gap: 6px;
          }
          
          .info-item {
            padding: 6px 10px;
          }
        }
        
        /* Melhorias para Desktop */
        @media (min-width: 1025px) {
          .questions-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }
        }
        
        /* Scroll horizontal suave em mobile */
        @media (max-width: 768px) {
          .table-wrapper {
            -webkit-overflow-scrolling: touch;
          }
          
          .satisfaction-table {
            min-width: 600px; /* Reduzido de 700px */
          }
        }
      `}</style>
    </div>
  );
};

export default SatisfactionTable;