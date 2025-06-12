import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  type: string;
}

interface SatisfactionData {
  id: string;
  nome: string;
  media: number;
  observacao: string;
  dataEnvio: Date;
}

interface ReclamacaoData {
  id: string;
  nome: string;
  tipo: string;
  mensagem: string;
  dataEnvio: Date;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do Firestore
  const { 
    data: satisfactionData, 
    loading: isLoadingSatisfaction, 
    error: satisfactionError 
  } = useFirestore<SatisfactionData>({
    collectionName: 'pesquisa_satisfacao',
    limitCount: 100
  });

  const { 
    data: reclamacoesData, 
    loading: isLoadingReclamacoes, 
    error: reclamacoesError 
  } = useFirestore<ReclamacaoData>({
    collectionName: 'reclamacoes',
    limitCount: 100
  });

  useEffect(() => {
    if (!isLoadingSatisfaction && !isLoadingReclamacoes && satisfactionData && reclamacoesData) {
      // Processar dados de satisfação
      const satisfactionTestimonials = satisfactionData
        .filter((item) => item.observacao && item.media >= 4)
        .map((item) => ({
          id: item.id,
          name: item.nome,
          rating: Math.round(item.media),
          comment: item.observacao,
          date: new Date().toISOString().split('T')[0],
          type: 'satisfaction'
        }));

      // Processar dados de reclamações (apenas elogios)
      const reclamacoesTestimonials = reclamacoesData
        .filter((item) => item.tipo?.toLowerCase().includes('elogio'))
        .map((item) => ({
          id: item.id,
          name: item.nome,
          rating: 5,
          comment: item.mensagem,
          date: item.dataEnvio instanceof Date ? item.dataEnvio.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          type: 'reclamacao'
        }));

      // Combinar e ordenar por data
      const allTestimonials = [...satisfactionTestimonials, ...reclamacoesTestimonials]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6); // Limitar a 6 depoimentos

      setTestimonials(allTestimonials);
      setIsLoading(false);
    }
  }, [satisfactionData, reclamacoesData, isLoadingSatisfaction, isLoadingReclamacoes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="title-large mb-4">O Que Nossos Clientes Dizem</h2>
          <p className="subtitle max-w-3xl mx-auto">
            Conheça as experiências de quem confia em nossos serviços
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-5 w-5" />
                    ))}
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : testimonials.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              Nenhum depoimento disponível no momento.
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-taxi-yellow/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-taxi-green">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-gray-500 text-sm">{formatDate(testimonial.date)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-taxi-yellow fill-taxi-yellow" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 