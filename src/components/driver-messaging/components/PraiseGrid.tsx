import React from 'react';
import { Praise } from '../types';
import { PraiseCard } from './PraiseCard';

interface PraiseGridProps {
  praises: Praise[];
  loading: boolean;
  onSendClick: (praise: Praise) => void;
  onDetailsClick: (praise: Praise) => void;
  onCardPreviewClick: (praise: Praise) => void;
}

export const PraiseGrid: React.FC<PraiseGridProps> = ({ 
  praises, 
  loading, 
  onSendClick, 
  onDetailsClick, 
  onCardPreviewClick 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando elogios...</p>
        </div>
      </div>
    );
  }

  if (praises.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <p className="text-gray-600 text-lg mb-2">Nenhum elogio encontrado</p>
          <p className="text-gray-500 text-sm">Tente ajustar os filtros ou criar um novo elogio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {praises.map(praise => (
        <PraiseCard
          key={praise.id}
          praise={praise}
          onSendClick={onSendClick}
          onDetailsClick={onDetailsClick}
          onCardPreviewClick={onCardPreviewClick}
        />
      ))}
    </div>
  );
};