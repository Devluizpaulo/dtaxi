import React from 'react';
import { Praise } from '../types';

interface PraiseGridProps {
  praises: Praise[];
  loading: boolean;
  onSendClick: (praise: Praise) => void;
  onDetailsClick: (praise: Praise) => void;
  onCardPreviewClick: (praise: Praise) => void;
}

export const PraiseGrid: React.FC<PraiseGridProps> = ({ praises, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {praises.map(praise => (
        <div key={praise.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{praise.driverName}</h3>
          <p className="text-sm text-gray-600">{praise.message}</p>
        </div>
      ))}
    </div>
  );
};