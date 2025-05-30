import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowRight, Car, Users, Zap } from 'lucide-react';
import heroImg from '@/images/hero.png';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative min-h-[50vh] md:min-h-[100vh] flex items-start overflow-hidden">
      {/* Container da imagem com proporção controlada */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <img
          src={heroImg}
          alt="Frota D-TAXI"
          className="w-full h-full object-cover object-center md:object-top pointer-events-none"
          style={{
            filter: 'brightness(0.7) contrast(1.1)',
            objectPosition: '50% 30%',
            minHeight: '100%',
            minWidth: '100%'
          }}
        />
      </div>
          
      {/* Conteúdo */}
      <div className="container mx-auto px-0 md:px-4 z-20 pt-10 md:pt-14 pb-8 md:pb-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl mx-4 md:mx-0 mt-4 md:mt-8"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-taxi-green/10 text-taxi-green px-4 md:px-6 py-2 rounded-full mb-6 shadow-lg"
          >
            {/* Adicione conteúdo aqui se necessário */}
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-gray-800/70 md:bg-gray-900/40 rounded-xl p-4 md:p-6 lg:p-8 shadow-lg backdrop-blur-sm md:backdrop-blur-none"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg text-center md:text-left"
            >
              Movendo o Futuro, <br />
              <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-400 bg-clip-text text-transparent animate-gradient-x">
                Preservando o Presente
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-yellow-100 font-medium mb-8 text-justify md:text-left"
            >
              Somos pioneiros em mobilidade sustentável, transformando cada viagem em um passo para um futuro mais verde. Nossa frota ecologicamente correta está revolucionando o transporte urbano.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;