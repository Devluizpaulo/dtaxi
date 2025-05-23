
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SmilePlus, Frown, Meh, ThumbsUp, Star, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const formSchema = z.object({
  name: z.string().min(3, { message: 'O nome precisa ter pelo menos 3 caracteres' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  email: z.string().email({ message: 'Email inválido' }),
  platePrefix: z.string().optional(),
  driverRating: z.number().min(1).max(5),
  cleanlinessRating: z.number().min(1).max(5),
  carConditionRating: z.number().min(1).max(5),
  waitTimeRating: z.number().min(1).max(5),
  courtesyRating: z.number().min(1).max(5),
  comments: z.string().optional(),
  contactRequest: z.boolean().optional(),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: 'Você deve concordar com a política de privacidade',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SatisfactionSurvey = () => {
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [showContactRequest, setShowContactRequest] = useState(false);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [complaintProtocol, setComplaintProtocol] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      platePrefix: '',
      driverRating: 0,
      cleanlinessRating: 0,
      carConditionRating: 0,
      waitTimeRating: 0,
      courtesyRating: 0,
      comments: '',
      contactRequest: false,
      privacyPolicy: false,
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    
    // Calcular média das avaliações
    const ratings = [
      data.driverRating,
      data.cleanlinessRating,
      data.carConditionRating,
      data.waitTimeRating,
      data.courtesyRating
    ];
    
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    setAverageRating(avgRating);
    
    // Verificar se é um elogio ou uma reclamação
    if (avgRating >= 4) {
      // É um elogio
      setShowContactRequest(true);
    } else if (avgRating < 3) {
      // É uma reclamação
      generateComplaintProtocol();
      setShowComplaintDialog(true);
    }
    
    toast.success('Obrigado pelo seu feedback!');
    setSubmitted(true);
    // Em uma aplicação real, você enviaria esses dados para o servidor
  };

  const resetForm = () => {
    form.reset();
    setSubmitted(false);
    setShowContactRequest(false);
    setShowComplaintDialog(false);
  };
  
  const generateComplaintProtocol = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const protocol = `REC-${year}${month}${day}-${random}`;
    setComplaintProtocol(protocol);
  };

  const StarRating = ({ rating, onChange }: { rating: number, onChange: (rating: number) => void }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`cursor-pointer w-6 h-6 ${
              star <= rating ? 'fill-taxi-yellow text-taxi-yellow' : 'text-gray-300'
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Como foi sua experiência?</CardTitle>
        <CardDescription className="text-center">
          Compartilhe sua experiência com a D-TAXI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              className="w-full bg-taxi-yellow text-taxi-black hover:bg-taxi-green hover:text-white"
            >
              Participar da Pesquisa
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader className="mb-6">
              <SheetTitle>Pesquisa de Satisfação</SheetTitle>
              <SheetDescription>
                Obrigado por participar da nossa pesquisa de satisfação.
                Por favor, preencha os seus dados corretamente.
              </SheetDescription>
            </SheetHeader>
            
            {!submitted ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Nome:</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone:</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail:</FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="platePrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefixo ou Placa do Veículo:</FormLabel>
                        <FormControl>
                          <Input placeholder="Opcional" {...field} />
                        </FormControl>
                        <FormDescription>
                          Você pode encontrar o prefixo na parte de baixo da tampa do porta-malas e no vidro dianteiro
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold mb-4">Por favor, avalie o seu atendimento</h3>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="driverRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Atendimento do Motorista:</FormLabel>
                            <FormControl>
                              <StarRating 
                                rating={field.value} 
                                onChange={(rating) => field.onChange(rating)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cleanlinessRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Limpeza do Carro:</FormLabel>
                            <FormControl>
                              <StarRating 
                                rating={field.value} 
                                onChange={(rating) => field.onChange(rating)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="carConditionRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conservação do Carro:</FormLabel>
                            <FormControl>
                              <StarRating 
                                rating={field.value} 
                                onChange={(rating) => field.onChange(rating)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="waitTimeRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tempo de Espera:</FormLabel>
                            <FormControl>
                              <StarRating 
                                rating={field.value} 
                                onChange={(rating) => field.onChange(rating)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="courtesyRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cordialidade do Atendimento:</FormLabel>
                            <FormControl>
                              <StarRating 
                                rating={field.value} 
                                onChange={(rating) => field.onChange(rating)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações:</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Compartilhe mais detalhes sobre sua experiência (opcional)"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactRequest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Desejo ser contatado pelo motorista para receber um agradecimento pelo elogio (opcional)
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            Ao enviar este formulário, você concorda com a nossa Política de Privacidade e com a utilização dos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD).
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-taxi-yellow text-taxi-black hover:bg-taxi-green hover:text-white"
                  >
                    Enviar Avaliação
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6 text-center">
                {averageRating >= 4 ? (
                  <ThumbsUp className="w-16 h-16 mx-auto text-taxi-green mb-4" />
                ) : averageRating >= 3 ? (
                  <SmilePlus className="w-16 h-16 mx-auto text-taxi-yellow mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
                )}
                
                <h3 className="text-xl font-semibold">Obrigado pelo seu feedback!</h3>
                
                <div className="flex justify-center gap-1 my-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-8 w-8 ${
                        star <= Math.round(averageRating) ? 'fill-taxi-yellow text-taxi-yellow' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                
                <p className="text-xl font-semibold">
                  Sua avaliação: {averageRating.toFixed(1)}
                </p>
                
                <p className="text-muted-foreground">
                  Sua opinião é muito importante para nós. Estamos constantemente melhorando nossos serviços com base nas opiniões dos nossos clientes.
                </p>
                
                {showContactRequest && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 my-4">
                    <p className="text-sm text-green-800">
                      Obrigado pelo elogio! Se você marcou a opção, o motorista poderá entrar em contato para agradecer pessoalmente.
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
        
        <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reclamação Registrada</DialogTitle>
              <DialogDescription>
                Sua reclamação foi registrada com sucesso e será analisada pela nossa equipe.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
                <p className="font-semibold">Protocolo: {complaintProtocol}</p>
                <p className="text-sm text-amber-800 mt-2">
                  Guarde este número para acompanhar o status da sua reclamação.
                  Nossa equipe responderá em até 48 horas úteis.
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="bg-taxi-yellow/10 p-3 rounded-full inline-flex mb-2">
              <Star className="w-8 h-8 text-taxi-yellow" />
            </div>
            <p className="font-medium">Excelência</p>
          </div>
          <div className="text-center">
            <div className="bg-taxi-green/10 p-3 rounded-full inline-flex mb-2">
              <ThumbsUp className="w-8 h-8 text-taxi-green" />
            </div>
            <p className="font-medium">Confiança</p>
          </div>
          <div className="text-center">
            <div className="bg-taxi-yellow/10 p-3 rounded-full inline-flex mb-2">
              <SmilePlus className="w-8 h-8 text-taxi-yellow" />
            </div>
            <p className="font-medium">Satisfação</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center text-muted-foreground">
          Sua opinião nos ajuda a melhorar continuamente nossos serviços
        </p>
      </CardFooter>
    </Card>
  );
};

export default SatisfactionSurvey;
