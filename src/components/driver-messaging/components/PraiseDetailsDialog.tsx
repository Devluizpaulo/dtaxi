import React from 'react';
import { Praise } from '../types';

interface PraiseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  praise: Praise | null;
  onSendClick: (praise: Praise) => void;
  onCardPreviewClick: (praise: Praise) => void;
}

export const PraiseDetailsDialog: React.FC<PraiseDetailsDialogProps> = () => {
  return null; // Placeholder
};