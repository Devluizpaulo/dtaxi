
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SendHorizontal, Mail, Phone } from 'lucide-react';

interface ClientResponseProps {
  feedback: any;
  onClose: () => void;
}

const ClientResponse = ({ feedback, onClose }: ClientResponseProps) => {
  const { toast } = useToast();
  const [responseMethod, setResponseMethod] = useState('email');
  const [responseText, setResponseText] = useState('');
  const [sending, setSending] = useState(false);
  
  const getDefaultResponse = () => {
    if (feedback.type === 'elogio') {
      return `Prezado(a) ${feedback.name},\n\nObrigado pelo seu feedback positivo! Estamos felizes em saber que você teve uma boa experiência com a D-TAXI.\n\nAgradecemos sua preferência e esperamos poder atendê-lo(a) novamente em breve.\n\nAtenciosamente,\nEquipe D-TAXI`;
    } else if (feedback.type === 'reclamacao') {
      return `Prezado(a) ${feedback.name},\n\nAgradecemos por nos informar sobre sua experiência. Lamentamos o ocorrido e gostaríamos de assegurar que estamos investigando a situação para garantir que isso não se repita.\n\nSeu feedback é muito importante para nós e nos ajuda a melhorar nossos serviços.\n\nSe tiver qualquer dúvida adicional, não hesite em nos contatar.\n\nAtenciosamente,\nEquipe D-TAXI`;
    } else {
      return `Prezado(a) ${feedback.name},\n\nObrigado por entrar em contato com a D-TAXI.\n\nEstamos analisando sua mensagem e retornaremos o mais breve possível com as informações solicitadas.\n\nAgradecemos sua preferência.\n\nAtenciosamente,\nEquipe D-TAXI`;
    }
  };
  
  React.useEffect(() => {
    setResponseText(getDefaultResponse());
  }, [feedback]);
  
  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, insira um texto para a resposta.",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    
    // Em uma aplicação real, aqui você enviaria a resposta via email ou SMS
    // usando uma função do Firebase ou outra API
    
    try {
      // Simulando o envio com um timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Resposta enviada",
        description: `Sua resposta foi enviada com sucesso para ${feedback.name} via ${responseMethod === 'email' ? 'e-mail' : 'SMS/WhatsApp'}.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao tentar enviar a resposta. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Detalhes do Cliente</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 border rounded-md">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm truncate">{feedback.email}</span>
          </div>
          <div className="flex items-center gap-2 p-2 border rounded-md">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm truncate">{feedback.contact || feedback.telefone}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Método de Resposta</Label>
        <Select value={responseMethod} onValueChange={setResponseMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha o método de resposta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="whatsapp">WhatsApp/SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Mensagem</Label>
        <Textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          rows={10}
          placeholder="Digite sua resposta ao cliente..."
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSendResponse} disabled={sending}>
          <SendHorizontal className="mr-2 h-4 w-4" />
          {sending ? "Enviando..." : "Enviar Resposta"}
        </Button>
      </div>
    </div>
  );
};

export default ClientResponse;
