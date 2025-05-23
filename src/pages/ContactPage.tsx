import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';

interface ContactForm {
  nome: string;
  email: string;
  telefone: string;
  tipoMensagem: string;
  prefixoVeiculo: string;
  assunto: string;
  mensagem: string;
}

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactForm>({
    nome: '',
    email: '',
    telefone: '',
    tipoMensagem: '',
    prefixoVeiculo: '',
    assunto: '',
    mensagem: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-28 pb-12">
        <div className="container mx-auto px-2 sm:px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Fale Conosco</h1>
          <p className="text-lg text-gray-600">
            Estamos sempre disponíveis para atender você da melhor forma possível
          </p>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Information */}
            <div className="space-y-8 order-2 lg:order-1">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Informações de Contato</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-taxi-yellow mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Endereço</h3>
                    <p className="text-gray-600">
                      Av. Prestes Maia, 241<br />
                      Santa Ifigênia, São Paulo - SP<br />
                      CEP: 01031-001
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-taxi-yellow mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Telefone</h3>
                    <p className="text-gray-600">
                      (11) 94483-0851<br />
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-taxi-yellow mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">E-mail</h3>
                    <p className="text-gray-600">
                      contato@dtaxisp.com.br
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageSquare className="h-6 w-6 text-taxi-yellow mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">WhatsApp</h3>
                    <a 
                      href="https://wa.me/5511944830851" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-taxi-yellow hover:text-taxi-green transition-colors"
                    >
                      Chamar no WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
            <div className="order-1 lg:order-2">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Envie-nos uma mensagem</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Seu nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoMensagem">Tipo de Mensagem</Label>
                <Select
                  value={formData.tipoMensagem}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipoMensagem: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sugestao">Sugestão</SelectItem>
                    <SelectItem value="reclamacao">Reclamação</SelectItem>
                    <SelectItem value="elogio">Elogio</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefixoVeiculo">Prefixo do Veículo (Opcional)</Label>
                <Input
                  id="prefixoVeiculo"
                  name="prefixoVeiculo"
                  placeholder="Prefixo do veículo"
                  value={formData.prefixoVeiculo}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500">
                  Você pode encontrar o prefixo na parte de baixo da tampa do porta-malas e no vidro dianteiro
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assunto">Assunto</Label>
                <Input
                  id="assunto"
                  name="assunto"
                  placeholder="Assunto da mensagem"
                  value={formData.assunto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  name="mensagem"
                  placeholder="Digite sua mensagem aqui"
                  value={formData.mensagem}
                  onChange={handleChange}
                  required
                  className="min-h-[120px]"
                />
              </div>

              <p className="text-sm text-gray-500">
                Aviso de LGPD: Os dados fornecidos serão utilizados exclusivamente para fins de contato e atendimento à sua solicitação. 
                Garantimos que suas informações serão armazenadas de forma segura e não serão compartilhadas com terceiros sem o seu consentimento. 
                Para mais detalhes sobre como protegemos suas informações, consulte nossa Política de Privacidade.
              </p>

              <Button 
                type="submit"
                className="w-full bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white"
              >
                Enviar Mensagem
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
      </div>
    </>
  );
};

export default ContactPage; 