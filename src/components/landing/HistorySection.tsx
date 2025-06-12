
import React from 'react';
import { 
  Milestone, 
  Calendar, 
  Car, 
  Award, 
  Leaf, 
  Building
} from 'lucide-react';

const HistorySection = () => {
  return (
    <section id="historia" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="title-large mb-4">Nossa História</h2>
          <p className="subtitle max-w-3xl mx-auto">
            Uma trajetória de mais de 50 anos proporcionando transporte de qualidade, segurança e inovação
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-taxi-yellow"></div>

          {/* Timeline items */}
          <div className="space-y-24">
            <TimelineItem 
              year="1969" 
              title="Fundação da D-TAXI"
              description="Início das operações de táxi em São Paulo com uma frota de 15 veículos."
              icon={Calendar}
              position="left"
            />

            <TimelineItem 
              year="1985" 
              title="Expansão Nacional"
              description="Ampliação para as principais capitais brasileiras, com mais de 500 veículos em operação."
              icon={Building}
              position="right"
            />

            <TimelineItem 
              year="2005" 
              title="Primeiro Táxi Acessível"
              description="Pioneirismo na introdução de táxis adaptados para pessoas com mobilidade reduzida."
              icon={Award}
              position="left"
            />

            <TimelineItem 
              year="2012" 
              title="Frota Híbrida"
              description="Início da substituição da frota por veículos híbridos, reduzindo em 40% a emissão de poluentes."
              icon={Car}
              position="right"
            />

            <TimelineItem 
              year="2018" 
              title="Certificação Verde"
              description="Reconhecimento como empresa de transporte com menor impacto ambiental do Brasil."
              icon={Leaf}
              position="left"
            />

            <TimelineItem 
              year="2023" 
              title="Atualidade"
              description="Operando com mais de 3.000 táxis em 20 cidades, sendo 70% da frota composta por veículos híbridos ou elétricos."
              icon={Car}
              position="right"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  position: 'left' | 'right';
}

const TimelineItem: React.FC<TimelineItemProps> = ({ 
  year, 
  title, 
  description, 
  icon: Icon,
  position 
}) => {
  return (
    <div className={`flex ${position === 'left' ? 'flex-row' : 'flex-row-reverse'} items-center`}>
      <div className={`w-1/2 ${position === 'left' ? 'text-right pr-12' : 'text-left pl-12'}`}>
        <span className="inline-block bg-taxi-yellow text-black font-bold rounded-full px-4 py-1 mb-2">
          {year}
        </span>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <div className="z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border-4 border-taxi-yellow">
        <Icon className="h-6 w-6 text-taxi-green" />
      </div>
      
      <div className="w-1/2"></div>
    </div>
  );
};

export default HistorySection;
