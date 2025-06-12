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
    title: "Lei do Taxi",
    description: "Sancionada a lei municipal que regulamentou a categoria, estabelecendo regras para frotas, alem de direitos e obrigações dos motoristas.",
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
    title: "Pioneirismo em Acessibilidade",
    description: "Fomos os primeiros a introduzir táxis acessíveis na cidade de São Paulo, com 70 veículos adaptados, promovendo inclusão e transformando a mobilidade urbana.",
    icon: <Users className="w-8 h-8 text-orange-200" />,
    color: "from-orange-400 to-orange-600",
    image: img2009
  },
  {
    year: "2012-2013",
    title: "Inovação e Sustentabilidade",
    description: "Iniciamos os primeiros táxis elétricos em 2012. Em 2013, implementamos a maior frota sustentável do Brasil com 150 híbridos 0KM e dobramos o número de táxis acessíveis, marcando o início do contrato com o serviço ATENDE.",
    icon: <Zap className="w-8 h-8 text-green-200" />,
    color: "from-green-400 to-blue-400",
    image: img2013
  },
  {
    year: "2018",
    title: "Nascimento da D-TAXI",
    description: "Surge a D-TAXI: uma nova era de gestão profissional, com motoristas treinados e uniformizados. Iniciamos operações no Aeroporto de Congonhas com mais de 250 táxis movidos a energia limpa, reafirmando nosso compromisso com qualidade, sustentabilidade e excelência no atendimento.",
    icon: <Rocket className="w-8 h-8 text-blue-200" />,
    color: "from-blue-400 to-green-400",
    image: img2018
  },
  {
    year: "2018-2024",
    title: "Liderança e Sustentabilidade",
    description: "Nos tornamos referência nacional em atendimento qualificado e mobilidade sustentável. Com mais de 15 milhões de passageiros atendidos, evitamos 14.040 toneladas de CO₂ e realizamos cerca de 3.500 corridas diárias apenas no Aeroporto de Congonhas. Hoje, somos o maior ponto de táxis híbridos do Brasil.",
    icon: <Star className="w-8 h-8 text-yellow-200" />,
    color: "from-yellow-400 to-green-400",
    image: img2024
  },
];

export default function CompanyHistoryCarousel() {
  return (
    <div id="historia" className="w-full max-w-5xl mx-auto py-8 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Nossa Trajetória</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8 text-taxi-gray text-justify">
          <b>ADETAX e D-TAXI</b>: Uma História de Pioneirismo no Transporte Paulistano<br /><br />
          Há mais de 50 anos revolucionando a mobilidade urbana, nossas frotas escrevem capítulos de inovação,
          acessibilidade e sustentabilidade na cidade de São Paulo.
        </p>
      </div>
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
            <div className={`bg-gradient-to-br ${event.color} rounded-xl shadow-lg p-6 flex flex-col items-center text-white h-full min-h-[320px]`}>
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-lg shadow mb-4 border-4 border-white"
                />
              )}
              <div className="text-center">
                {event.icon}
                <h3 className="text-xl font-bold mt-2">{event.year} - {event.title}</h3>
                <p className="mt-2 text-sm md:text-base text-justify px-2">{event.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}