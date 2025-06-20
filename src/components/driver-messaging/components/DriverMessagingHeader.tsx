import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, PlusCircle } from 'lucide-react';

interface DriverMessagingHeaderProps {
  onCreateClick: () => void;
}

export const DriverMessagingHeader: React.FC<DriverMessagingHeaderProps> = ({
  onCreateClick
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
      <div>
        <div className="flex items-center gap-2">
          <Award className="h-8 w-8 text-yellow-500" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Elogios aos Motoristas
          </h2>
        </div>
        <p className="text-muted-foreground mt-1">
          Envie mensagens carinhosas de reconhecimento aos motoristas
        </p>
      </div>
    </div>
  );
};
