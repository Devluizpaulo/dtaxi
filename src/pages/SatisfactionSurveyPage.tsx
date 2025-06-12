import React, { useState } from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/hooks/useFirestore';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SurveyForm {
  nome: string;
  telefone: string;
  email: string;
  prefixoVeiculo: string;
  atendimentoMotorista: number;
  limpezaCarro: number;
  conservacaoCarro: number;
  tempoEspera: number;
  cordialidadeAtendimento: number;
  observacoes: string;
  dataEnvio: Date;
  politicaPrivacidade: boolean;
}

const SatisfactionSurveyPage = () => {
  const [formData, setFormData] = useState<SurveyForm>({
    nome: '',
    telefone: '',
    email: '',
    prefixoVeiculo: '',
    atendimentoMotorista: 0,
    limpezaCarro: 0,
    conservacaoCarro: 0,
    tempoEspera: 0,
    cordialidadeAtendimento: 0,
    observacoes: '',
    dataEnvio: new Date(),
    politicaPrivacidade: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { data: existingSurveys } = useFirestore<SurveyForm>({
    collectionName: 'pesquisa_satisfacao'
  });

  const steps = [
    { label: 'Identificação' },
    { label: 'Atendimento do Motorista' },
    { label: 'Limpeza do Carro' },
    { label: 'Conservação do Carro' },
    { label: 'Tempo de Espera' },
    { label: 'Cordialidade do Atendimento' },
    { label: 'Observações' },
    { label: 'Confirmação' },
  ];
  const [step, setStep] = useState(0);

  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;

  const navigate = useNavigate();

  function canProceed() {
    switch (step) {
      case 0:
        return !!formData.nome && !!formData.telefone && !!formData.email;
      case 1:
        return formData.atendimentoMotorista > 0;
      case 2:
        return formData.limpezaCarro > 0;
      case 3:
        return formData.conservacaoCarro > 0;
      case 4:
        return formData.tempoEspera > 0;
      case 5:
        return formData.cordialidadeAtendimento > 0;
      case 7:
        return formData.politicaPrivacidade;
      default:
        return true;
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, politicaPrivacidade: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.politicaPrivacidade) {
      toast({
        title: "Termos de Privacidade",
        description: "Por favor, aceite os termos de privacidade antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.nome || !formData.telefone || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu nome, telefone e email.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'pesquisa_satisfacao'), {
        ...formData,
        dataEnvio: new Date()
      });

      toast({
        title: "Obrigado pelo feedback!",
        description: "Sua avaliação foi registrada com sucesso.",
      });

      // Reset form
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        prefixoVeiculo: '',
        atendimentoMotorista: 0,
        limpezaCarro: 0,
        conservacaoCarro: 0,
        tempoEspera: 0,
        cordialidadeAtendimento: 0,
        observacoes: '',
        dataEnvio: new Date(),
        politicaPrivacidade: false
      });

      // Redireciona para a home após um pequeno delay
      setTimeout(() => navigate('/'), 1200);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar sua avaliação. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente de seleção de estrelas
  const StarRating = ({ value, onChange, label, id }: { value: number, onChange: (v: number) => void, label: string, id: string }) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((star) => (
          <button
            type="button"
            key={star}
            aria-label={`Dar ${star} estrela${star>1?'s':''}`}
            onClick={() => onChange(star)}
            className={`focus:outline-none ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500`}
          >
            <Star className="h-7 w-7" fill={star <= value ? '#fbbf24' : 'none'} />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">{value ? `${value} estrela${value>1?'s':''}` : 'Selecione'}</span>
      </div>
    </div>
  );

  // Perguntas com contexto motivacional
  const perguntasComContexto = [
    {
      id: "atendimentoMotorista",
      label: "Prezamos pela qualidade em cada atendimento realizado e estamos buscando evoluir. Como você avalia o Atendimento do Motorista?"
    },
    {
      id: "limpezaCarro",
      label: "A limpeza do veículo é fundamental para o seu conforto. Como você avalia a Limpeza do Carro?"
    },
    {
      id: "conservacaoCarro",
      label: "A conservação do carro reflete nosso compromisso com a segurança e o bem-estar. Como você avalia a Conservação do Carro?"
    },
    {
      id: "tempoEspera",
      label: "Sabemos que seu tempo é valioso. Como você avalia o tempo de espera até o seu embarque em um de nossos veículos?"
    },
    {
      id: "cordialidadeAtendimento",
      label: "Ser cordial é muito importante para nós. O colaborador que realizou seu embarque foi atencioso, gentil e respeitoso com você?"
    }
  ];

  return (
    <BaseLayout>
      <section className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Pesquisa de Satisfação</h1>
              <p className="text-lg text-gray-600 mb-4">
                Obrigado por participar da nossa pesquisa de satisfação.<br />
                Por favor, preencha os seus dados corretamente.
              </p>
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-taxi-yellow h-2 rounded-full transition-all"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                {steps.map((s, i) => (
                  <span key={i} className={i === step ? 'font-bold text-taxi-green' : ''}>{s.label}</span>
                ))}
              </div>
            </div>

            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Etapas do wizard */}
                  {step === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="nome">Seu Nome:</Label>
                        <Input 
                          id="nome" 
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          placeholder="Digite seu nome completo" 
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="telefone">Telefone:</Label>
                        <Input 
                          id="telefone" 
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">E-mail:</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="prefixoVeiculo">Prefixo ou Placa do Veículo:</Label>
                        <Input 
                          id="prefixoVeiculo" 
                          name="prefixoVeiculo"
                          value={formData.prefixoVeiculo}
                          onChange={handleInputChange}
                          placeholder="Opcional"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          (Você pode encontrar o prefixo na parte de baixo da tampa do porta-malas e no vidro dianteiro)
                        </p>
                      </div>
                    </div>
                  )}
                  {step >= 1 && step <= 5 && (
                    <div>
                      <div className="mb-4 text-base text-gray-700 font-medium">
                        {perguntasComContexto[step-1].label}
                      </div>
                      <StarRating
                        id={perguntasComContexto[step-1].id}
                        label=""
                        value={formData[perguntasComContexto[step-1].id as keyof typeof formData] as number}
                        onChange={v => setFormData(prev => ({ ...prev, [perguntasComContexto[step-1].id]: v }))}
                      />
                    </div>
                  )}
                  {step === 6 && (
                    <div className="grid gap-2">
                      <Label htmlFor="observacoes">Observações:</Label>
                      <Textarea 
                        id="observacoes" 
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        placeholder="Compartilhe mais detalhes sobre sua experiência (opcional)"
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                  {step === 7 && (
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="politicaPrivacidade" 
                        checked={formData.politicaPrivacidade}
                        onCheckedChange={handleCheckboxChange}
                        required
                      />
                      <Label htmlFor="politicaPrivacidade" className="text-sm font-normal">
                        Ao enviar este formulário, você concorda com a nossa Política de Privacidade e com a utilização dos seus 
                        dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD).
                      </Label>
                    </div>
                  )}
                  {/* Navegação dos passos */}
                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(s => Math.max(0, s - 1))}
                      disabled={isFirstStep}
                    >
                      Voltar
                    </Button>
                    {!isLastStep ? (
                      <Button
                        type="button"
                        className="bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white"
                        onClick={() => canProceed() && setStep(s => Math.min(steps.length - 1, s + 1))}
                        disabled={!canProceed()}
                      >
                        Próximo
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="w-full bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white"
                        disabled={isSubmitting || !canProceed()}
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
};

export default SatisfactionSurveyPage; 