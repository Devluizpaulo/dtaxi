
import React from 'react';
import { 
  Car, 
  Briefcase, 
  Plane, 
  Accessibility,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ServicesSection = () => {
  return (
    <section id="servicos" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="title-large mb-4">Nossos Serviços</h2>
          <p className="subtitle max-w-3xl mx-auto">
            Soluções de mobilidade para todas as suas necessidades, com qualidade, conforto e segurança
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard 
            title="Táxi Comum" 
            description="Transporte rápido e econômico para o dia a dia, com motoristas experientes e veículos modernos."
            icon={Car}
          />
          
          <ServiceCard 
            title="Táxi Executivo" 
            description="Experiência premium com veículos de luxo, ideal para executivos e ocasiões especiais."
            icon={Briefcase}
          />
          
          <ServiceCard 
            title="Táxi Acessível" 
            description="Veículos adaptados para proporcionar conforto e segurança para pessoas com mobilidade reduzida."
            icon={Accessibility}
          />
          
          <ServiceCard 
            title="Serviço Aeroportuário" 
            description="Transporte especializado para aeroportos, com acompanhamento de voos e assistência com bagagem."
            icon={Plane}
          />
          
          <ServiceCard 
            title="Agendamento" 
            description="Programe suas viagens com antecedência, garantindo pontualidade para seus compromissos."
            icon={Calendar}
          />
          
          <ServiceCard 
            title="Corporativo" 
            description="Soluções de mobilidade para empresas, com relatórios gerenciais e faturamento mensal."
            icon={Briefcase}
          />
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6">Presença em Pontos Estratégicos</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <LocationCard location="Aeroporto de Congonhas" vehicles="40 veículos" />
            <LocationCard location="Aeroporto de Guarulhos" vehicles="65 veículos" />
            <LocationCard location="Estação da Luz" vehicles="25 veículos" />
            <LocationCard location="Shopping Centers" vehicles="120 veículos" />
          </div>
        </div>
      </div>
    </section>
  );
};

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon: Icon }) => {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-2">
        <div className="w-12 h-12 rounded-full bg-taxi-yellow/20 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-taxi-green" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

interface LocationCardProps {
  location: string;
  vehicles: string;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, vehicles }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-taxi-yellow">
      <h4 className="font-bold text-lg mb-2">{location}</h4>
      <p className="text-sm text-gray-600">{vehicles}</p>
    </div>
  );
};

export default ServicesSection;
