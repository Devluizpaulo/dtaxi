import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SendHorizontal, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';

interface Feedback {
  id?: string;
  name: string;
  email: string;
  telefone?: string;
  contact?: string;
  type: 'elogio' | 'reclamacao' | 'duvida' | 'sugestao' | string;
}

interface ClientResponseProps {
  feedback: Feedback;
  onClose: () => void;
}

const ClientResponse: React.FC<ClientResponseProps> = ({ feedback, onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [responseMethod, setResponseMethod] = useState<'email' | 'whatsapp'>('email');
  const [responseText, setResponseText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setResponseText(generateDefaultResponse(feedback));
  }, [feedback]);

  const generateDefaultResponse = (feedback: Feedback): string => {
    const greeting = `Prezado(a) ${feedback.name},`;
    const closing = `\n\nAtenciosamente,\nEquipe D-TAXI`;

    switch (feedback.type) {
      case 'elogio':
        return `${greeting}\n\nObrigado pelo seu feedback positivo! Estamos felizes em saber que você teve uma boa experiência com a D-TAXI.\n\nAgradecemos sua preferência e esperamos poder atendê-lo(a) novamente em breve.${closing}`;
      case 'reclamacao':
        return `${greeting}\n\nAgradecemos por nos informar sobre sua experiência. Lamentamos o ocorrido e estamos investigando a situação para garantir que isso não se repita.\n\nSeu feedback é muito importante para nós.${closing}`;
      default:
        return `${greeting}\n\nObrigado por entrar em contato com a D-TAXI.\n\nEstamos analisando sua mensagem e responderemos o mais breve possível.${closing}`;
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma resposta antes de enviar",
        variant: "destructive"
      });
      return;
    }

    if (!feedback.id) {
      toast({
        title: "Erro",
        description: "ID da mensagem não encontrado",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);
      
      // Implementação real do envio
      const responseData = {
        messageId: feedback.id,
        response: responseText,
        method: responseMethod,
        timestamp: new Date(),
        userId: user?.uid || 'anonymous'
      };

      // Salvar resposta no Firestore
      await addDoc(collection(db, 'message_responses'), responseData);
      
      // Atualizar status da mensagem
      await updateDoc(doc(db, 'messages', feedback.id), {
        status: 'respondido',
        respondedAt: new Date(),
        respondedBy: user?.uid || 'anonymous'
      });

      toast({
        title: "Sucesso",
        description: "Resposta enviada com sucesso!"
      });
      onClose();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar resposta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Label>Detalhes do Cliente</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 border rounded-md">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm truncate">{feedback.email}</span>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded-md">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm truncate">{feedback.telefone ?? feedback.contact ?? 'Não informado'}</span>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <Label>Método de Resposta</Label>
        <Select value={responseMethod} onValueChange={(v) => setResponseMethod(v as 'email' | 'whatsapp')}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha o método de resposta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="whatsapp">WhatsApp/SMS</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="space-y-2">
        <Label>Mensagem</Label>
        <Textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          rows={10}
          placeholder="Digite sua resposta ao cliente..."
        />
      </section>

      <section className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={sending}>
          Cancelar
        </Button>
        <Button onClick={handleSendResponse} disabled={sending}>
          <SendHorizontal className="mr-2 h-4 w-4" />
          {sending ? 'Enviando...' : 'Enviar Resposta'}
        </Button>
      </section>
    </div>
  );
};

export default ClientResponse;
