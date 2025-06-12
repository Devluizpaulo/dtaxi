import React from 'react';
import { PesquisasCard } from '@/components/dashboard/PesquisasCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PesquisasPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pesquisas de Satisfação</h1>
          <p className="text-muted-foreground">
            Gerencie e analise as pesquisas de satisfação dos clientes
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <PesquisasCard />
      </div>
    </div>
  );
} 