import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Check, Star } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

interface SurveyForm {
  name: string;
  phone: string;
  email: string;
  vehiclePrefix: string;
  driverRating: number;
  cleanlinessRating: number;
  carConditionRating: number;
  waitTimeRating: number;
  courtesyRating: number;
  comments: string;
  privacyPolicy: boolean;
}

interface SatisfactionData {
  name: string;
  phone: string;
  email: string;
  vehiclePrefix: string;
  driverRating: number;
  cleanlinessRating: number;
  carConditionRating: number;
  waitTimeRating: number;
  courtesyRating: number;
  averageRating: number;
  comments: string;
  createdAt: Date;
}

const InlineSatisfactionSurvey = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SurveyForm>({
    name: '',
    phone: '',
    email: '',
    vehiclePrefix: '',
    driverRating: 0,
    cleanlinessRating: 0,
    carConditionRating: 0,
    waitTimeRating: 0,
    courtesyRating: 0,
    comments: '',
    privacyPolicy: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, privacyPolicy: checked }));
  };
  
  const handleRatingChange = (field: string, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSelectRating = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyPolicy) {
      toast.error("Por favor, aceite os termos de privacidade antes de enviar.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calcular média das avaliações
      const ratings = [
        formData.driverRating,
        formData.cleanlinessRating,
        formData.carConditionRating,
        formData.waitTimeRating,
        formData.courtesyRating
      ];
      
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      
      // Adicionar ao Firestore
      await addDoc(collection(db, "satisfactionSurveys"), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        vehiclePrefix: formData.vehiclePrefix,
        driverRating: formData.driverRating,
        cleanlinessRating: formData.cleanlinessRating,
        carConditionRating: formData.carConditionRating,
        waitTimeRating: formData.waitTimeRating,
        courtesyRating: formData.courtesyRating,
        averageRating: avgRating,
        comments: formData.comments,
        createdAt: serverTimestamp()
      });
      
      toast.success("Avaliação enviada!", {
        description: "Obrigado por participar da nossa pesquisa de satisfação.",
      });
      
      // Resetar o formulário
      setFormData({
        name: '',
        phone: '',
        email: '',
        vehiclePrefix: '',
        driverRating: 0,
        cleanlinessRating: 0,
        carConditionRating: 0,
        waitTimeRating: 0,
        courtesyRating: 0,
        comments: '',
        privacyPolicy: false
      });
    } catch (error: unknown) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error("Erro ao enviar avaliação. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const RatingSelect = ({ field, label }: { field: string, label: string }) => (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <Select 
        value={formData[field as keyof typeof formData]?.toString() || "0"}
        onValueChange={(value) => handleSelectRating(field, value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Selecione</SelectItem>
          <SelectItem value="1">1 - Ruim</SelectItem>
          <SelectItem value="2">2 - Regular</SelectItem>
          <SelectItem value="3">3 - Bom</SelectItem>
          <SelectItem value="4">4 - Muito Bom</SelectItem>
          <SelectItem value="5">5 - Excelente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-taxi-yellow/10 pb-4">
        <CardTitle className="text-center text-2xl">Pesquisa de Satisfação</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <p className="text-center text-gray-600 mb-6">
          Obrigado por participar da nossa pesquisa de satisfação. <br />
          Por favor, preencha os seus dados corretamente.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Seu Nome:</Label>
              <Input 
                id="name" 
                placeholder="Digite seu nome completo" 
                value={formData.name} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone:</Label>
              <Input 
                id="phone" 
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail:</Label>
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
              <Label htmlFor="vehiclePrefix">Prefixo ou Placa do Veículo:</Label>
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
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-4">Por favor, avalie o seu atendimento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RatingSelect field="driverRating" label="Atendimento do Motorista:" />
              <RatingSelect field="cleanlinessRating" label="Limpeza do Carro:" />
              <RatingSelect field="carConditionRating" label="Conservação do Carro:" />
              <RatingSelect field="waitTimeRating" label="Tempo de Espera:" />
              <RatingSelect field="courtesyRating" label="Cordialidade do Atendimento:" />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="comments">Observações:</Label>
            <Textarea 
              id="comments" 
              placeholder="Compartilhe mais detalhes sobre sua experiência (opcional)"
              className="min-h-[100px]"
              value={formData.comments}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="privacyPolicy" 
              checked={formData.privacyPolicy}
              onCheckedChange={handleCheckboxChange}
              required
            />
            <Label htmlFor="privacyPolicy" className="text-sm font-normal">
              Ao enviar este formulário, você concorda com a nossa Política de Privacidade e com a utilização dos seus 
              dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD).
            </Label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-taxi-yellow text-taxi-black hover:bg-taxi-green hover:text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InlineSatisfactionSurvey;
