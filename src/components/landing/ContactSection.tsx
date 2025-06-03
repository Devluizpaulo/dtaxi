import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { addDoc, collection, serverTimestamp, doc, runTransaction } from 'firebase/firestore';
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

function getFilteredMessages(messages: any[], type: string) {
  return messages.filter((msg) => msg.messageType === type);
}

const generateProtocolo = async (): Promise<string> => {
  const counterRef = doc(db, 'counters', 'reclamacao');
  const protocolo = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    const currentNumber = counterDoc.exists() ? counterDoc.data().lastNumber || 0 : 0;
    const nextNumber = currentNumber + 1;
    transaction.set(counterRef, { lastNumber: nextNumber }, { merge: true });
    const formatted = String(nextNumber).padStart(5, '0');
    const year = new Date().getFullYear();
    return `${formatted}-${year}`;
  });
  return protocolo;
};

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

      let protocolo = '';
      if (formData.messageType === 'reclamacao') {
        protocolo = await generateProtocolo();
      }

      const collectionName = {
        reclamacao: 'reclamacoes',
        elogio: 'elogios',
        sugestao: 'sugestoes',
        duvida: 'duvidas'
      }[formData.messageType] || 'outras-mensagens';

      await addDoc(collection(db, collectionName), {
        ...formData,
        status: 'pendente',
        protocolo: protocolo || null,
        createdAt: serverTimestamp()
      });

      if (formData.messageType === 'reclamacao') {
        toast.success("Reclamação enviada!", {
          description: `Protocolo: ${protocolo}. Entraremos em contato em até 48 horas.`,
        });
      } else {
        toast.success("Mensagem enviada!", {
          description: "Agradecemos seu contato, responderemos em breve.",
        });
      }

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
          <div className="lg:col-span-1 space-y-8">
            <ContactCard 
              icon={MapPin}
              title="Endereço"
              content={<>Av. Prestes Maia, 241<br />Santa Ifigênia, São Paulo - SP<br />CEP: 01031-001</>}
            />
            <ContactCard icon={Phone} title="Telefone" content={<>(11)94483-0851</>} />
            <ContactCard icon={Mail} title="E-mail" content={<>contato@dtaxisp.com.br</>} />
            <ContactCard 
              icon={MessageSquare}
              title="WhatsApp"
              content={
                <a 
                  href="https://wa.me/5511944830851"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white transition-colors py-2 px-4 rounded-md mt-2"
                >
                  Chamar no WhatsApp
                </a>
              }
            />
          </div>

          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-6">Envie-nos uma mensagem</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Nome" id="name" value={formData.name} onChange={handleChange} required />
                  <InputField label="E-mail" id="email" type="email" value={formData.email} onChange={handleChange} required />
                  <InputField label="Telefone" id="phone" value={formData.phone} onChange={handleChange} required />

                  <div className="grid gap-2">
                    <Label>Tipo de Mensagem</Label>
                    <Select value={formData.messageType} onValueChange={handleSelectChange} required>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
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
                    <Input id="vehiclePrefix" value={formData.vehiclePrefix} onChange={handleChange} placeholder="Opcional" />
                    <p className="text-sm text-gray-500 mt-1">
                      (Você pode encontrar o prefixo na parte de baixo da tampa do porta-malas e no vidro dianteiro)
                    </p>
                  </div>

                  <InputField label="Assunto" id="subject" value={formData.subject} onChange={handleChange} required className="md:col-span-2" />

                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea id="message" value={formData.message} onChange={handleChange} placeholder="Digite sua mensagem aqui" className="min-h-[120px]" required />
                  </div>

                  <div className="md:col-span-2 flex items-start space-x-2 mb-4">
                    <Checkbox id="privacyPolicy" checked={formData.privacyPolicy} onCheckedChange={handleCheckboxChange} required />
                    <Label htmlFor="privacyPolicy" className="text-sm font-normal">
                      Aviso de LGPD: Os dados fornecidos serão utilizados exclusivamente para fins de contato e atendimento à sua solicitação. Garantimos que suas informações serão armazenadas de forma segura e não serão compartilhadas com terceiros sem o seu consentimento. Para mais detalhes, consulte nossa Política de Privacidade.
                    </Label>
                  </div>

                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white" disabled={isSubmitting}>
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

const InputField = ({ label, id, value, onChange, type = "text", required = false, className = "" }) => (
  <div className={`grid gap-2 ${className}`}>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} type={type} value={value} onChange={onChange} placeholder={label} required={required} />
  </div>
);

interface ContactCardProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  content: React.ReactNode;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon: Icon, title, content }) => (
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

export default ContactSection;
