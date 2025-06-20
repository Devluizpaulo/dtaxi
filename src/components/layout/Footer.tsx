import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-taxi-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src="/lovable-uploads/edee2f14-becc-4974-8b85-8255bf4a9484.png" 
                alt="D-TAXI Logo" 
                className="h-12"
              />
            </div>
            <p className="text-gray-300 mb-4">
              Mobilidade inteligente e transporte sustentável desde 1969.
            </p>
            //<div className="flex space-x-4">
              //<SocialIcon icon={Facebook} />
              //<SocialIcon icon={Instagram} />
              //<SocialIcon icon={Twitter} />
              //<SocialIcon icon={Linkedin} />
            //</div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Endereço</h4>
            <address className="not-italic text-gray-300">
              <div className="flex items-start mb-2">
                <MapPin className="mr-2 h-5 w-5 mt-0.5 text-taxi-yellow" />
                <span>Av. Prestes Maia, 241<br />Santa Ifigênia, São Paulo - SP<br />CEP: 01031-001</span>
              </div>
            </address>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-taxi-yellow" />
                <span>(11) 94483-0851</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-taxi-yellow" />
                <a href="mailto:contato@dtaxi.com.br" className="hover:text-taxi-yellow transition-colors">
                contato@dtaxisp.com.br
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <FooterLink href="#historia" label="Nossa História" />
              <FooterLink href="#servicos" label="Nossos Serviços" />
              <FooterLink href="#sustentabilidade" label="Sustentabilidade" />
              <FooterLink href="/PesquisaSatisfacao" label="Pesquisa de Satisfação" />
              <FooterLink href="#contato" label="Contato" />
              <FooterLink href="/PrivacyPolicy" label="Política de Privacidade" />
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} D-TAXI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  href: string;
  label: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, label }) => {
  const isAnchorLink = href.startsWith('#');

  if (isAnchorLink) {
    return (
      <li>
        <a 
          href={href} 
          className="hover:text-taxi-yellow transition-colors"
        >
          {label}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link 
        to={href} 
        className="hover:text-taxi-yellow transition-colors"
      >
        {label}
      </Link>
    </li>
  );
};

interface SocialIconProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon: Icon }) => {
  return (
    <a 
      href="#" 
      className="bg-gray-800 p-2 rounded-full hover:bg-taxi-yellow hover:text-black transition-colors"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
};

export default Footer;
