import React from 'react';
import { CustomProgress } from '@/components/ui/custom-progress';
import { Leaf, Droplet, Zap, TreePine, Car, Users } from 'lucide-react';

const SustainabilitySection = () => {
  return (
    <section id="sustentabilidade" className="py-20 bg-gradient-to-b from-green-50 via-blue-50 to-orange-50 relative">
      {/* Selo ecológico */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/90 border-2 border-green-400 rounded-full px-2 py-1 shadow-lg">
        <Leaf className="h-5 w-5 text-green-600" />
        <span className="text-green-700 font-semibold text-sm">Nosso Compromisso Ecológico</span>
      </div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-taxi-black">Transformando a Mobilidade Urbana</h2>
          <p className="text-lg text-taxi-gray max-w-3xl mx-auto text-justify">
            Estamos liderando a revolução da mobilidade sustentável, com uma frota que respeita o meio ambiente e contribui para um futuro mais limpo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 mt-12">
          <ImpactCard 
            icon={TreePine}
            title="Redução de CO₂"
            value="14.040"
            unit="toneladas"
            description="Emissões evitadas em 2023"
            color="text-green-500 border-green-400"
          />
          <ImpactCard 
            icon={Droplet}
            title="Economia de Combustível"
            value="1.2M"
            unit="litros"
            description="Economizados no último ano"
            color="text-blue-500 border-blue-400"
          />
          <ImpactCard 
            icon={Zap}
            title="Energia Limpa"
            value="100%"
            unit="da frota"
            description="Veículos híbridos ou elétricos,  ou movidos a GNV"
            color="text-orange-500 border-orange-400"
          />
        </div>
      </div>
    </section>
  );
};

interface ImpactCardProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
  unit: string;
  description: string;
  color: string;
}

const ImpactCard: React.FC<ImpactCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  unit, 
  description,
  color 
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${color.replace('text', 'bg')}/10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm text-gray-500 ml-1">{unit}</span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

interface ProgressItemProps {
  label: string;
  value: number;
  color: string;
}

const ProgressItem: React.FC<ProgressItemProps> = ({ label, value, color }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-medium text-gray-600">{value}%</span>
      </div>
      <CustomProgress 
        value={value} 
        className="bg-gray-100" 
        indicatorClassName={color}
      />
    </div>
  );
};

export default SustainabilitySection;
