import React from 'react';
import ConfiguracoesPermissoes from '../components/settings/ConfiguracoesPermissoes';

const DashboardConfiguracoes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie configurações do sistema, usuários e permissões
          </p>
        </div>
      </div>
      
      <ConfiguracoesPermissoes />
    </div>
  );
};

export default DashboardConfiguracoes;