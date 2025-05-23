import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  messageType: string;
  vehiclePrefix: string;
  subject: string;
  message: string;
  privacyPolicy: boolean;
}

interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  messageType: string;
  vehiclePrefix: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    messageType: '',
    vehiclePrefix: '',
    subject: '',
    message: '',
    privacyPolicy: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, messageType: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, privacyPolicy: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyPolicy) {
      toast.error("Por favor, aceite os termos de privacidade antes de enviar.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Adicionar ao Firestore
      await addDoc(collection(db, "contactMessages"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        messageType: formData.messageType,
        vehiclePrefix: formData.vehiclePrefix,
        subject: formData.subject,
        message: formData.message,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      toast.success("Mensagem enviada!", {
        description: "Agradecemos seu contato, responderemos em breve.",
      });
      
      // Resetar o formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        messageType: '',
        vehiclePrefix: '',
        subject: '',
        message: '',
        privacyPolicy: false
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="title-large mb-4">Fale Conosco</h2>
          <p className="subtitle max-w-3xl mx-auto">
            Estamos sempre disponíveis para atender você da melhor forma possível
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-8">
              <ContactCard 
                icon={MapPin}
                title="Endereço"
                content={<>Av. Prestes Maia, 241<br />Santa Ifigênia, São Paulo - SP<br />CEP: 01031-001</>}
              />
              
              <ContactCard 
                icon={Phone}
                title="Telefone"
                content={<>(11)94483-0851</>}
              />
              
              <ContactCard 
                icon={Mail}
                title="E-mail"
                content={<>contato@dtaxisp.com.br</>}
              />
              
              <ContactCard 
                icon={MessageSquare}
                title="WhatsApp"
                content={<>
                  <a 
                    href="https://wa.me/5511944830851" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white transition-colors py-2 px-4 rounded-md mt-2"
                  >
                    Chamar no WhatsApp
                  </a>
                </>}
              />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-6">Envie-nos uma mensagem</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input 
                      id="name" 
                      placeholder="Seu nome" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={formData.email}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      placeholder="(00) 00000-0000" 
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Tipo de Mensagem</Label>
                    <Select 
                      value={formData.messageType} 
                      onValueChange={handleSelectChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="duvida">Dúvida</SelectItem>
                        <SelectItem value="elogio">Elogio</SelectItem>
                        <SelectItem value="reclamacao">Reclamação</SelectItem>
                        <SelectItem value="sugestao">Sugestão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="vehiclePrefix">Prefixo do Veículo</Label>
                    <Input 
                      id="vehiclePrefix" 
                      placeholder="Opcional" 
                      value={formData.vehiclePrefix}
                      onChange={handleChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      (Você pode encontrar o prefixo na parte de baixo da tampa do porta-malas e no vidro dianteiro)
                    </p>
                  </div>
                  
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input 
                      id="subject" 
                      placeholder="Assunto da mensagem" 
                      value={formData.subject}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Digite sua mensagem aqui" 
                      className="min-h-[120px]" 
                      value={formData.message}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-start space-x-2 mb-4">
                      <Checkbox 
                        id="privacyPolicy" 
                        checked={formData.privacyPolicy} 
                        onCheckedChange={handleCheckboxChange}
                        required
                      />
                      <Label htmlFor="privacyPolicy" className="text-sm font-normal">
                        Aviso de LGPD: Os dados fornecidos serão utilizados exclusivamente para fins de contato e atendimento à sua solicitação. 
                        Garantimos que suas informações serão armazenadas de forma segura e não serão compartilhadas com terceiros sem o seu consentimento. 
                        Para mais detalhes sobre como protegemos suas informações, consulte nossa Política de Privacidade.
                      </Label>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

interface ContactCardProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  content: React.ReactNode;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon: Icon, title, content }) => {
  return (
    <div className="flex gap-4">
      <div className="mt-1">
        <div className="w-10 h-10 rounded-full bg-taxi-yellow/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-taxi-green" />
        </div>
      </div>
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  );
};

export default ContactSection;
