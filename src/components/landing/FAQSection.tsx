import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "Como posso solicitar um táxi?",
    answer: "Atualmente, nosso serviço está disponível exclusivamente no Aeroporto de Congonhas – SP. Basta se dirigir até nosso ponto de atendimento para embarcar com conforto e segurança. Em breve, lançaremos um aplicativo rápido e dinâmico para que você possa aproveitar o táxi mais sustentável do Brasil de onde estiver."
  },  
  {
    question: "Quais são as formas de pagamento aceitas?",
    answer: "Nossos motoristas aceitam todas as bandeiras de cartões de crédito e débito, além de pagamentos via PIX. Trabalhamos para oferecer a você mais conforto, segurança e comodidade na hora de pagar pela sua corrida."
  },  
  {
    question: 'Os motoristas são verificados?',
    answer: 'Sim, todos os nossos motoristas passam por um rigoroso processo de seleção, incluindo verificação de antecedentes criminais, análise de documentos e treinamento específico para garantir sua segurança.'
  },
  {
    question: 'Vocês oferecem serviço para empresas?',
    answer: 'Sim, oferecemos planos corporativos personalizados para empresas de todos os portes. Entre em contato com nossa equipe comercial para conhecer as opções disponíveis.'
  },
  {
    question: "Como posso me tornar um motorista parceiro?",
    answer: "Para se tornar um motorista parceiro, é necessário possuir o CONDUTAX ativo, não ter antecedentes criminais, estar vinculado a uma frota associada e locar um veículo já cadastrado e regulamentado. Para mais informações, entre em contato com uma de nossas frotas parceiras."
  }  
];

const FAQSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="title-large mb-4">Perguntas Frequentes</h2>
          <p className="subtitle max-w-3xl mx-auto">
            Tire suas dúvidas sobre nossos serviços
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 