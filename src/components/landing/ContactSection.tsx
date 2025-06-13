import React, { useState, useCallback, useMemo } from 'react';
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

interface InputFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  className?: string;
}

interface ContactCardProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  content: React.ReactNode;
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

const ContactSection: React.FC = () => {
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

  // Memoized values para melhor performance
  const showSubjectField = useMemo(() => {
    return formData.messageType !== '' && formData.messageType !== 'elogio';
  }, [formData.messageType]);

  const isVehiclePrefixRequired = useMemo(() => {
    return formData.messageType === 'reclamacao' || formData.messageType === 'elogio';
  }, [formData.messageType]);

  const getMessagePlaceholder = useCallback(() => {
    switch (formData.messageType) {
      case 'elogio':
        return "Conte-nos sobre sua experiência positiva com nosso motorista";
      case 'reclamacao':
        return "Descreva detalhadamente o ocorrido para que possamos resolver";
      case 'sugestao':
        return "Compartilhe suas ideias para melhorarmos nossos serviços";
      case 'duvida':
        return "Qual é a sua dúvida? Tentaremos responder o mais breve possível";
      default:
        return "Digite sua mensagem aqui";
    }
  }, [formData.messageType]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSelectChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      messageType: value,
      // Reset campos dependentes quando o tipo de mensagem muda
      subject: value === 'elogio' ? '' : prev.subject,
      vehiclePrefix: prev.vehiclePrefix
    }));
  }, []);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, privacyPolicy: checked }));
  }, []);

  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push('Nome é obrigatório');
    if (!formData.email.trim()) errors.push('E-mail é obrigatório');
    if (!formData.phone.trim()) errors.push('Telefone é obrigatório');
    if (!formData.messageType) errors.push('Tipo de mensagem é obrigatório');
    if (!formData.message.trim()) errors.push('Mensagem é obrigatória');
    if (!formData.privacyPolicy) errors.push('Aceite dos termos de privacidade é obrigatório');

    if (isVehiclePrefixRequired && !formData.vehiclePrefix.trim()) {
      errors.push('Prefixo do veículo é obrigatório para este tipo de mensagem');
    }

    if (showSubjectField && !formData.subject.trim()) {
      errors.push('Assunto é obrigatório para este tipo de mensagem');
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('E-mail deve ter um formato válido');
    }

    return errors;
  }, [formData, isVehiclePrefixRequired, showSubjectField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Erro de validação",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
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

      // Prepara os dados para salvar, removendo campos desnecessários conforme o tipo
      const dataToSave = { ...formData };

      // Se for elogio, não precisa de assunto
      if (formData.messageType === 'elogio') {
        delete dataToSave.subject;
      }

      await addDoc(collection(db, collectionName), {
        ...dataToSave,
        status: 'pendente',
        protocolo: protocolo || null,
        createdAt: serverTimestamp()
      });

      // Mensagens personalizadas conforme o tipo
      const successMessages = {
        reclamacao: {
          title: "🚨 Reclamação Registrada com Sucesso!",
          description: `✅ Protocolo de Atendimento: ${protocolo}\n\n📞 Nossa equipe entrará em contato em até 48 horas\n📧 Você receberá atualizações por e-mail\n⏰ Horário de atendimento: Segunda a Sexta, 8h às 18h\n\n💼 Sua reclamação é importante para melhorarmos nossos serviços!`
        },
        elogio: {
          title: "🌟 Elogio Recebido - Muito Obrigado!",
          description: "\n🎉 Agradecemos imensamente seu feedback positivo!\n\n👨‍💼 Compartilharemos com nosso motorista e equipe\n🏆 Elogios como o seu nos motivam a continuar oferecendo o melhor serviço\n\n💛 Obrigado por escolher a D-Taxi!"
        },
        sugestao: {
          title: "💡 Sugestão Valiosa Recebida!",
          description: "🙏 Agradecemos sua contribuição para melhorarmos nossos serviços!\n\n📋 Sua sugestão será analisada pela nossa equipe de melhoria contínua\n🔄 Implementamos regularmente melhorias baseadas no feedback dos clientes\n📊 Você receberá retorno sobre a viabilidade da sua sugestão\n\n🚀 Juntos construímos um serviço cada vez melhor!"
        },
        duvida: {
          title: "❓ Dúvida Recebida - Vamos Ajudar!",
          description: "📞 Responderemos sua dúvida o mais breve possível!\n\n⚡ Tempo médio de resposta: 2-4 horas em dias úteis\n📧 Acompanhe sua solicitação pelo e-mail cadastrado\n🕐 Atendimento: Segunda a Sexta, 8h às 18h\n📱 Para urgências, entre em contato pelo WhatsApp\n\n🤝 Estamos aqui para ajudar você!"
        }
      };

      const message = successMessages[formData.messageType as keyof typeof successMessages] || {
        title: "Mensagem enviada!",
        description: "Agradecemos seu contato, responderemos em breve."
      };

      toast({
        title: message.title,
        description: message.description,
        variant: "success",
        duration: 8000,
      });

      // Reset form
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
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Por favor, tente novamente.",
        variant: "destructive"
      });
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
                  <InputField
                    label="Nome"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="E-mail"
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Telefone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                  <div className="grid gap-2">
                    <Label>Tipo de Mensagem <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.messageType}
                      onValueChange={handleSelectChange}
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
                </div>

                {/* Campos condicionais com estrutura estável */}
                <div className="space-y-6">
                  {/* Campo Prefixo do Veículo - sempre renderizado mas condicionalmente visível */}
                  <div 
                    className={`grid gap-2 transition-all duration-200 ${
                      formData.messageType ? 'opacity-100 max-h-none' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                  >
                    <Label htmlFor="vehiclePrefix">
                      Prefixo do Veículo {isVehiclePrefixRequired && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="vehiclePrefix"
                      value={formData.vehiclePrefix}
                      onChange={handleChange}
                      placeholder={isVehiclePrefixRequired ? "Obrigatório" : "Opcional"}
                      required={isVehiclePrefixRequired}
                      disabled={!formData.messageType}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      (Você pode encontrar o prefixo na parte de baixo da tampa do porta-malas e no vidro dianteiro)
                    </p>
                  </div>

                  {/* Campo Assunto - sempre renderizado mas condicionalmente visível */}
                  <div 
                    className={`grid gap-2 transition-all duration-200 ${
                      showSubjectField ? 'opacity-100 max-h-none' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                  >
                    <Label htmlFor="subject">Assunto <span className="text-red-500">*</span></Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Assunto"
                      required={showSubjectField}
                      disabled={!showSubjectField}
                    />
                  </div>

                  {/* Campo Mensagem - sempre renderizado mas condicionalmente visível */}
                  <div 
                    className={`grid gap-2 transition-all duration-200 ${
                      formData.messageType ? 'opacity-100 max-h-none' : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                  >
                    <Label htmlFor="message">Mensagem <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={getMessagePlaceholder()}
                      className="min-h-[120px]"
                      required={!!formData.messageType}
                      disabled={!formData.messageType}
                    />
                  </div>

                  {/* Checkbox e botão */}
                  <div className="flex items-start space-x-2 mb-4">
                    <Checkbox
                      id="privacyPolicy"
                      checked={formData.privacyPolicy}
                      onCheckedChange={handleCheckboxChange}
                      required
                    />
                    <Label htmlFor="privacyPolicy" className="text-sm font-normal">
                      <span className="text-red-500">*</span> Aviso de LGPD: Os dados fornecidos serão utilizados exclusivamente para fins de contato e atendimento à sua solicitação. Garantimos que suas informações serão armazenadas de forma segura e não serão compartilhadas com terceiros sem o seu consentimento. Para mais detalhes, consulte nossa Política de Privacidade.
                    </Label>
                  </div>

                  <div>
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

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  required = false,
  className = ""
}) => (
  <div className={`grid gap-2 ${className}`}>
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={label}
      required={required}
    />
  </div>
);
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