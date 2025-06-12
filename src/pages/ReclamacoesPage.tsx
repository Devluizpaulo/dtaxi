import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReclamacoesCard } from '@/components/dashboard/ReclamacoesCard';

const ReclamacoesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reclamações</h2>
        <p className="text-muted-foreground">
          Gerencie e acompanhe todas as reclamações dos clientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reclamações Ativas e Arquivadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ReclamacoesCard />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReclamacoesPage; 