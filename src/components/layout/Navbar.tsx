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
              className="w-20 h-20 sm:w-18 sm:h-18 bg-white/90 flex items-center justify-center shadow-2xl overflow-hidden border-4 border-taxi-green/70 group-hover:border-taxi-yellow/80 transition-all duration-300 rounded-xl"
            >
              <img src={Logo} alt="D-TAXI Logo" className="w-24 h-24 sm:w-20 sm:h-20 object-contain drop-shadow-2xl" />
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
              className={`ml-2 shadow-md transition-transform hover:-translate-y-1 ${isScrolled
                  ? 'bg-taxi-green hover:bg-green-600 text-white'
                  : 'bg-white hover:bg-white/90 text-taxi-green'
                }`}
              aria-label="Entrar no Dashboard"
            >
              <User className="h-5 w-5 mr-1" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-xl border-2 border-taxi-green bg-white/80 shadow-md transition-colors duration-200 ${isScrolled ? 'text-taxi-green hover:bg-taxi-green/10' : 'text-taxi-green hover:bg-taxi-yellow/10'
                } focus:outline-none focus:ring-2 focus:ring-taxi-green`}
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
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
              className="md:hidden fixed inset-y-0 right-0 h-[100vh] w-[100vw] max-w-xs bg-white/90 bg-gradient-to-br from-white/95 via-taxi-green/10 to-green-100/70 shadow-2xl z-50 flex flex-col rounded-l-3xl backdrop-blur-lg border-l border-taxi-green/20"
            >
              {/* Topo com logo e botão fechar */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <img src={Logo} alt="D-TAXI Logo" className="w-16 h-16 object-contain drop-shadow-xl" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-taxi-green/10 hover:bg-taxi-green/30 transition"
                  aria-label="Fechar menu"
                >
                  <X className="h-7 w-7 text-taxi-green" />
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-2 px-4 pb-6 pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => {
                      handleNavClick(e, link);
                      setIsOpen(false);
                    }}
                    className={
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold w-full transition ` +
                      (link.special
                        ? 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-taxi-green shadow-md'
                        : location.pathname === link.href
                          ? 'bg-taxi-green/90 text-white shadow-md'
                          : 'text-taxi-green hover:bg-taxi-green/10 hover:shadow')
                    }
                    style={{ minWidth: 0 }}
                  >
                    {link.special && <Smile className="inline-block mr-1 mb-1 text-yellow-500" />}
                    {link.label}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-taxi-yellow to-yellow-400 text-taxi-green text-lg py-3 rounded-xl shadow-lg hover:from-yellow-300 hover:to-yellow-500"
                >
                  <LogIn className="h-5 w-5 mr-2" /> Entrar
                </Button>
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
