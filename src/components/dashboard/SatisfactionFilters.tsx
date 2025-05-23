import React from 'react';

interface SatisfactionFiltersProps {
  busca: string;
  setBusca: (v: string) => void;
  filtroTelefone: string;
  setFiltroTelefone: (v: string) => void;
  filtroPrefixo: string;
  setFiltroPrefixo: (v: string) => void;
  filtroDataIni: string;
  setFiltroDataIni: (v: string) => void;
  filtroDataFim: string;
  setFiltroDataFim: (v: string) => void;
  filtroMediaMin: string;
  setFiltroMediaMin: (v: string) => void;
  filtroMediaMax: string;
  setFiltroMediaMax: (v: string) => void;
  filtroObs: 'todos' | 'com' | 'sem';
  setFiltroObs: (v: 'todos' | 'com' | 'sem') => void;
}

const SatisfactionFilters: React.FC<SatisfactionFiltersProps> = ({
  busca, setBusca,
  filtroTelefone, setFiltroTelefone,
  filtroPrefixo, setFiltroPrefixo,
  filtroDataIni, setFiltroDataIni,
  filtroDataFim, setFiltroDataFim,
  filtroMediaMin, setFiltroMediaMin,
  filtroMediaMax, setFiltroMediaMax,
  filtroObs, setFiltroObs
}) => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '18px 0' }}>
    <input type="text" placeholder="Buscar por nome" value={busca} onChange={e => setBusca(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2', minWidth: 140 }} />
    <input type="text" placeholder="Telefone" value={filtroTelefone} onChange={e => setFiltroTelefone(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2', minWidth: 120 }} />
    <input type="text" placeholder="Prefixo" value={filtroPrefixo} onChange={e => setFiltroPrefixo(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2', minWidth: 120 }} />
    <input type="date" value={filtroDataIni} onChange={e => setFiltroDataIni(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2' }} />
    <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2' }} />
    <input type="number" placeholder="Média min" value={filtroMediaMin} onChange={e => setFiltroMediaMin(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2', width: 90 }} />
    <input type="number" placeholder="Média max" value={filtroMediaMax} onChange={e => setFiltroMediaMax(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2', width: 90 }} />
    <select value={filtroObs} onChange={e => setFiltroObs(e.target.value as 'todos' | 'com' | 'sem')} style={{ padding: 8, borderRadius: 6, border: '1px solid #1976d2' }}>
      <option value="todos">Todos</option>
      <option value="com">Com Observação</option>
      <option value="sem">Sem Observação</option>
    </select>
  </div>
);

export default SatisfactionFilters; 