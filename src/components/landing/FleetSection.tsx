import React from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, Leaf, Battery, Gauge, Users } from 'lucide-react';

const FleetSection = () => {
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
    <section id="frota" className="py-0 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="text-center mb-10"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-4 text-taxi-black"
          >
            Frota Moderna e Sustentável
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-taxi-gray max-w-3xl mx-auto text-justify"
          >
            Nossa frota é composta por veículos de última geração, priorizando conforto, segurança e sustentabilidade.
          </motion.p>
        </motion.div>

        <h2 className="text-3xl font-bold text-center mb-10">Nossa Frota</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Veículos Elétricos & Híbridos */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-taxi-green/20 to-taxi-yellow/20 flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-taxi-green" />
              <Battery className="h-7 w-7 text-taxi-yellow ml-[-10px]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Veículos Elétricos & Híbridos</h3>
            <p className="text-taxi-gray mb-2 text-justify">
              Viagens silenciosas, economia de combustível e baixíssima emissão de poluentes. Eficiência, autonomia e sustentabilidade em cada trajeto.
            </p>
          </motion.div>
          {/* Táxis Acessíveis */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-blue-200 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Táxis Acessíveis</h3>
            <p className="text-taxi-gray mb-2 text-justify">
              Inclusão e conforto para todos. Veículos adaptados para cadeirantes e pessoas com mobilidade reduzida, com atendimento 24h.
            </p>
            <div className="flex justify-between text-sm w-full mt-2">
              <span className="text-muted-foreground">Atendimento 24h</span>
              <span className="font-medium">Sim</span>
            </div>
          </motion.div>
          {/* Táxis a GNV */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-green-200 flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Táxis a GNV</h3>
            <p className="text-taxi-gray mb-2 text-justify">
              Frota movida a Gás Natural Veicular: economia, sustentabilidade e menor emissão de poluentes para um futuro mais limpo.
            </p>
            <div className="flex justify-between text-sm w-full mt-2">
              <span className="text-muted-foreground">Redução de CO₂</span>
              <span className="font-medium">25%</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FleetSection; 