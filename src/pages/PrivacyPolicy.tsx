import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const PrivacyPolicy = () => (
  <>
    <Navbar />
    <div className="max-w-3xl mx-auto px-4 py-16 bg-white rounded-xl pt-28 pb-12 shadow-lg mt-8 mb-8">
      <h1 className="text-3xl font-bold mb-6 text-taxi-green">Política de Privacidade</h1>
      <p className="mb-4 text-gray-700">
        Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e o Código de Defesa do Consumidor (CDC - Lei 8.078/1990).
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">1. Coleta de Dados</h2>
      <p className="mb-4 text-gray-700">
        Coletamos informações fornecidas por você ao utilizar nossos serviços, como nome, e-mail, telefone, prefixo do veículo, mensagens e outros dados necessários para atendimento e melhoria dos nossos serviços.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">2. Uso dos Dados</h2>
      <p className="mb-4 text-gray-700">
        Utilizamos seus dados para:
        <ul className="list-disc ml-6">
          <li>Atender solicitações e prestar suporte;</li>
          <li>Melhorar nossos serviços e experiência do usuário;</li>
          <li>Enviar comunicações importantes e informativos;</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">3. Armazenamento e Segurança</h2>
      <p className="mb-4 text-gray-700">
        Seus dados são armazenados em ambiente seguro, com medidas técnicas e administrativas para protegê-los contra acessos não autorizados, perda, alteração ou divulgação indevida.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">4. Compartilhamento de Dados</h2>
      <p className="mb-4 text-gray-700">
        Não compartilhamos seus dados pessoais com terceiros, exceto quando necessário para cumprimento de obrigações legais, regulatórias ou mediante seu consentimento expresso.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">5. Direitos do Titular</h2>
      <p className="mb-4 text-gray-700">
        Você tem direito de acessar, corrigir, atualizar, portar, eliminar ou solicitar anonimização de seus dados pessoais, bem como revogar consentimentos e obter informações sobre o uso dos seus dados, conforme previsto na LGPD e CDC.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">6. Cookies e Tecnologias de Rastreamento</h2>
      <p className="mb-4 text-gray-700">
        Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar uso e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">7. Consentimento</h2>
      <p className="mb-4 text-gray-700">
        Ao utilizar nossos serviços, você concorda com esta Política de Privacidade. Caso não concorde, recomendamos que não utilize nossos serviços.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">8. Atualizações</h2>
      <p className="mb-4 text-gray-700">
        Esta política pode ser atualizada periodicamente. Recomendamos a leitura regular deste documento. Mudanças relevantes serão comunicadas em nossos canais oficiais.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">9. Contato</h2>
      <p className="mb-4 text-gray-700">
        Em caso de dúvidas, solicitações ou para exercer seus direitos, entre em contato pelo e-mail: <a href="mailto:privacidade@dtaxi.com.br" className="text-taxi-green underline">privacidade@dtaxi.com.br</a>
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">10. Legislação Aplicável</h2>
      <p className="mb-4 text-gray-700">
        Esta política está em conformidade com a LGPD (Lei 13.709/2018) e o CDC (Lei 8.078/1990).
      </p>
    </div>
    <Footer />
  </>
);

export default PrivacyPolicy; 