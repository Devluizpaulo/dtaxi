import React from 'react';
import ConfiguracoesPermissoes from '@/components/settings/ConfiguracoesPermissoes';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const DashboardConfiguracoes: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-2">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Painel</CardTitle>
          <CardDescription>Gerencie permissões de acesso e preferências do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConfiguracoesPermissoes />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardConfiguracoes; 