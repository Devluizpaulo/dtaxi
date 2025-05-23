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
    <section className="relative min-h-[20vh] sm:min-h-[100vh] flex items-start overflow-hidden">
      {/* Imagem de fundo responsiva */}
      <img
        src={heroImg}
        alt="Frota D-TAXI"
        className="absolute inset-0 w-full h-full object-cover object-center md:object-top z-0 pointer-events-none brightness-60 sm:brightness-90"
      />
      <div className="absolute inset-0 bg-green-300/90 sm:bg-green-100/70 mix-blend-multiply z-0" />
      <div className="container mx-auto px-2 sm:px-4 z-20 pt-16 sm:pt-4 pb-8 sm:pb-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl mt-4 sm:mt-8"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-taxi-green/10 text-taxi-green px-4 sm:px-6 py-2 rounded-full mb-6 shadow-lg"
          >
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="bg-gray-800/70 sm:bg-transparent rounded-xl p-4 sm:p-0 shadow-lg"
          >
            <motion.h1
              variants={itemVariants}
              className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
            >
              Movendo o Futuro, <br />
              <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-400 bg-clip-text text-transparent animate-gradient-x">
                Preservando o Presente
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-xg text-yellow-100 font-semibold mb-8"
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
