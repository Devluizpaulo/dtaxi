import React from 'react';
import { Praise, MessageDetails } from '../types';

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  praise: Praise | null;
  onSendPraise: (messageDetails: MessageDetails, praise: Praise) => Promise<boolean>;
}

export const SendMessageDialog: React.FC<SendMessageDialogProps> = () => {
  return null; // Placeholder
};