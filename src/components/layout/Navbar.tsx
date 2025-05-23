import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Leaf,
  Car,
  Users,
  MessageSquare,
  Phone,
  LogIn,
  Smile,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from '@/components/auth/LoginModal';
import Logo from '@/images/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/', label: 'Nossa História', scrollTo: 'historia' },
    { href: '/', label: 'Nossa Frota', scrollTo: 'frota' },
    { href: '/', label: 'Sustentabilidade', scrollTo: 'sustentabilidade' },
    { href: '/FaleConosco', label: 'Fale Conosco' },
    { href: '/PesquisaSatisfacao', label: 'Pesquisa de Satisfação', special: true },
  ];

  const handleNavClick = (e, link) => {
    if (link.scrollTo) {
      e.preventDefault();
      if (location.pathname !== '/') {
        navigate('/', { replace: false });
        setTimeout(() => {
          const element = document.getElementById(link.scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 400);
      } else {
      const element = document.getElementById(link.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-xl'
          : 'bg-gradient-to-r from-taxi-green/90 to-green-600/90 backdrop-blur-md'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group focus:outline-none" aria-label="Página inicial D-TAXI">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              className="w-16 h-16 bg-white/60 flex items-center justify-center shadow-xl overflow-hidden border-4 border-taxi-green/70 group-hover:border-taxi-yellow/80 transition-all duration-300 rounded-xl"
            >
              <img src={Logo} alt="D-TAXI Logo" className="w-20 h-20 object-contain drop-shadow-lg" />
            </motion.div>
          </Link>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={`relative text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-taxi-green px-1
                  ${isScrolled
                    ? link.special
                      ? 'text-yellow-600 font-bold bg-yellow-100 px-3 py-1 rounded hover:bg-yellow-200'
                      : 'text-gray-700 hover:text-taxi-green'
                    : link.special
                      ? 'text-yellow-300 font-bold bg-yellow-900/30 px-3 py-1 rounded hover:bg-yellow-700/40'
                      : 'text-white/90 hover:text-white'
                  }
                  ${location.pathname === link.href
                    ? (isScrolled ? 'text-taxi-green' : 'text-white')
                    : ''
                  }`}
              >
                {link.special && <Smile className="inline-block mr-1 mb-1 text-yellow-400" />}
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-taxi-green transition-all group-hover:w-full"></span>
              </Link>
            ))}

            <Button
              onClick={() => setShowLoginModal(true)}
              className={`ml-2 shadow-lg transition-transform hover:-translate-y-1 ${isScrolled
                  ? 'bg-taxi-green hover:bg-green-600 text-white'
                  : 'bg-white hover:bg-white/90 text-taxi-green'
                }`}
              aria-label="Entrar no Dashboard"
            >
              <User className="h-5 w-5 mr-2" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-full border-2 border-taxi-green bg-white/80 shadow-md transition-colors duration-200 ${isScrolled ? 'text-taxi-green hover:bg-taxi-green/10' : 'text-taxi-green hover:bg-taxi-yellow/10'
                } focus:outline-none focus:ring-2 focus:ring-taxi-green`}
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden fixed inset-y-0 right-0 w-72 bg-white/95 shadow-2xl z-50 flex flex-col"
            >
              <div className="pt-20 pb-3 px-4 space-y-4 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => {
                      handleNavClick(e, link);
                      setIsOpen(false);
                    }}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${link.special
                        ? 'text-yellow-600 font-bold bg-yellow-100 hover:bg-yellow-200'
                        : location.pathname === link.href
                          ? 'text-taxi-green bg-gray-50'
                          : 'text-gray-700 hover:text-taxi-green hover:bg-gray-50'
                      }`}
                  >
                    {link.special && <Smile className="inline-block mr-1 mb-1 text-yellow-400" />}
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t space-y-4">
                  <Button
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full bg-taxi-green hover:bg-green-600 text-white shadow-lg"
                  >
                    <LogIn className="h-4 w-4 mr-2" /> Entrar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </nav>
  );
};

export default Navbar;
