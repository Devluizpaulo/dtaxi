import React from 'react';

interface SatisfactionSummaryCardsProps {
  total: number;
  mediaGeral: string | number;
  percentualObs: number;
  periodo: string;
}

const SatisfactionSummaryCards: React.FC<SatisfactionSummaryCardsProps> = ({ total, mediaGeral, percentualObs, periodo }) => (
  <div className="summary-cards" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 18 }}>
    <div style={{ background: '#f5faff', borderRadius: 10, padding: 18, minWidth: 180, boxShadow: '0 1px 4px #0001', flex: 1 }}>
      <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 18 }}>Total de Avaliações</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{total}</div>
    </div>
    <div style={{ background: '#f5faff', borderRadius: 10, padding: 18, minWidth: 180, boxShadow: '0 1px 4px #0001', flex: 1 }}>
      <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 18 }}>Média Geral</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{mediaGeral}</div>
    </div>
    <div style={{ background: '#f5faff', borderRadius: 10, padding: 18, minWidth: 180, boxShadow: '0 1px 4px #0001', flex: 1 }}>
      <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 18 }}>% com Observação</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{percentualObs}%</div>
    </div>
    <div style={{ background: '#f5faff', borderRadius: 10, padding: 18, minWidth: 180, boxShadow: '0 1px 4px #0001', flex: 1 }}>
      <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 18 }}>Período</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{periodo}</div>
    </div>
  </div>
);

export default SatisfactionSummaryCards; 