import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';
import { Rocket, TrendingUp, Users, Award, Star, Zap } from 'lucide-react';
import img1969 from '@/images/1969.jpg';
import img1970 from '@/images/adetax.png';
import img2009 from '@/images/acessiveis.jpeg';
import img2013 from '@/images/eletricos.jpeg';
import img2018 from '@/images/2018.jpg';
import img2024 from '@/images/2024.png';

const historyEvents = [
  {
    year: "1969",
    title: "Início das Frotas",
    description: "As frotas de táxi tornam-se a espinha dorsal do transporte de passageiros em São Paulo.",
    icon: <Users className="w-8 h-8 text-green-300" />, color: "from-green-600 to-green-800",
    image: img1969
  },
  {
    year: "1970",
    title: "Fundação da ADETAX",
    description: "A ADETAX surge como força transformadora, unindo esforços para aprimorar as condições dos motoristas e empresas.",
    icon: <Award className="w-8 h-8 text-blue-200" />, color: "from-blue-500 to-blue-700",
    image: img1970
  },
  {
    year: "2009",
    title: "Táxis Acessíveis",
    description: "Introduzimos os primeiros táxis acessíveis, com 70 carros adaptados, revolucionando o setor.",
    icon: <Users className="w-8 h-8 text-orange-200" />, color: "from-orange-400 to-orange-600",
    image: img2009
  },
  {
    year: "2012-2013",
    title: "Inovação Elétrica e Híbrida",
    description: "Primeiros táxis elétricos (2012) e, em 2013, 150 híbridos 0KM e o dobro de táxis acessíveis, iniciando contrato com a ATENDE.",
    icon: <Zap className="w-8 h-8 text-green-200" />, color: "from-green-400 to-blue-400",
    image: img2013
  },
  {
    year: "2018",
    title: "Nascimento da D-TAXI",
    description: "Gestão profissional, motoristas treinados e uniformizados, operação no aeroporto de Congonhas com mais de 250 táxis limpos.",
    icon: <Rocket className="w-8 h-8 text-blue-200" />, color: "from-blue-400 to-green-400",
    image: img2018
  },
  {
    year: "2018-2024",
    title: "Liderança e Sustentabilidade",
    description: "15 milhões de passageiros, 14.040 toneladas de CO₂ evitadas, cerca de 3.500 corridas diárias só no aeroporto.",
    icon: <Star className="w-8 h-8 text-yellow-200" />, color: "from-yellow-400 to-green-400",
    image: img2024
  },
];

export default function CompanyHistoryCarousel() {
  return (
    <div id="historia" className="w-full max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-center mb-4">Nossa História</h2>
      <p className="text-lg text-center max-w-2xl mx-auto mb-8 text-taxi-gray">
        Bem-vindo à História de Duas Empresas Pioneiras: <b>ADETAX</b> e <b>D-TAXI São Paulo</b>!<br />
        Desde 1969, as frotas de táxi são a espinha dorsal do transporte em São Paulo. Conheça nossos marcos de inovação, acessibilidade e sustentabilidade.
      </p>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1 },
          1024: { slidesPerView: 2 },
        }}
        className="!pb-12"
      >
        {historyEvents.map((event, idx) => (
          <SwiperSlide key={idx}>
            <div className={`bg-gradient-to-br ${event.color} rounded-xl shadow-lg p-8 flex flex-col items-center text-white h-full min-h-[320px]`}>
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-48 h-48 object-cover rounded-lg shadow mb-4 border-4 border-white"
                />
              )}
              {event.icon}
              <h3 className="text-xl font-bold mt-4">{event.year} - {event.title}</h3>
              <p className="mt-2 text-base text-center text-justify">{event.description}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
} 