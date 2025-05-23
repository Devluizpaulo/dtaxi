import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface SatisfactionChartsProps {
  distEstrelas: any[];
  evolucaoMedia: any[];
  pesquisasPeriodo: any[];
}

const SatisfactionCharts: React.FC<SatisfactionChartsProps> = ({ distEstrelas, evolucaoMedia, pesquisasPeriodo }) => (
  <div className="charts-section" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
    <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 16 }}>
      <h3 style={{ marginBottom: 8, color: '#1976d2' }}>Distribuição de Estrelas</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={distEstrelas}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="estrela" tickFormatter={e => `${e}★`} />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={value => [`${value} respostas`, 'Quantidade']} />
          <Legend />
          <Bar dataKey="quantidade" fill="#fbbf24" name="Quantidade" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 16 }}>
      <h3 style={{ marginBottom: 8, color: '#1976d2' }}>Evolução da Média</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={evolucaoMedia}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" tickFormatter={d => d.slice(0, 10)} minTickGap={30} />
          <YAxis domain={[1, 5]} />
          <Tooltip formatter={value => [`${Number(value).toFixed(2)}★`, 'Média']} />
          <Legend />
          <Line type="monotone" dataKey="media" stroke="#1976d2" strokeWidth={2} dot={false} name="Média" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 16 }}>
      <h3 style={{ marginBottom: 8, color: '#1976d2' }}>% com Observação</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie dataKey="value" data={[
            { name: 'Com Observação', value: pesquisasPeriodo.filter(p => p.observacao).length },
            { name: 'Sem Observação', value: pesquisasPeriodo.length - pesquisasPeriodo.filter(p => p.observacao).length }
          ]} cx="50%" cy="50%" outerRadius={70} label>
            <Cell key="obs" fill="#1976d2" />
            <Cell key="semobs" fill="#b0bec5" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default SatisfactionCharts; 