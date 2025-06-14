import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle, MessageCircle, Info, Smile, Star, Archive as ArchiveIcon
} from 'lucide-react';

export const categorias = [
  { value: 'reclamacao', label: 'Reclamações', icon: AlertTriangle },
  { value: 'sugestao', label: 'Sugestões', icon: MessageCircle },
  { value: 'duvida', label: 'Duvidas', icon: Info },
  { value: 'elogio', label: 'Elogios', icon: Star },
  { value: 'outro', label: 'Outros', icon: Smile },
  { value: 'arquivadas', label: 'Arquivadas', icon: ArchiveIcon },
];

type TabsMensagensProps = {
  value: string;
  onChange: (v: string) => void;
  counts?: Record<string, number>;
};

export default function TabsMensagens({ value, onChange, counts = {} }: TabsMensagensProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className="mb-6">
      <TabsList className="flex gap-2 bg-gray-50 p-2 rounded-lg shadow-sm">
        {categorias.map(cat => {
          const Icon = cat.icon;
          return (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors data-[state=active]:bg-taxi-green/90 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-taxi-green/10 font-medium relative"
            >
              <Icon className="w-5 h-5" />
              <span>{cat.label}</span>
              {typeof counts[cat.value] === 'number' && (
                <Badge className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 text-xs font-semibold rounded-full min-w-[1.5em] text-center">
                  {counts[cat.value]}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
} 