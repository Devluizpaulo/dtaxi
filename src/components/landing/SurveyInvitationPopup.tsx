import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useFirestore } from '@/hooks/useFirestore';
import useCookieConsent from '@/hooks/useCookieConsent';

const SurveyInvitationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: configData = [] } = useFirestore<any>({ 
    collectionName: 'configuracoes', 
    orderByField: 'nomePainel' 
  });
  const { hasConsentFor } = useCookieConsent();

  // Pegar a primeira configuração ou usar valores padrão
  const config = configData[0] || {
    popupPesquisa: {
      ativo: true,
      tempoExibicao: 5000,
      frequencia: 'primeira_visita',
      titulo: 'Ajude-nos a melhorar!',
      descricao: 'Participe da nossa pesquisa de satisfação e nos ajude a melhorar ainda mais nossos serviços.',
    }
  };

  const popupConfig = config.popupPesquisa || {
    ativo: true,
    tempoExibicao: 5000,
    frequencia: 'primeira_visita',
    titulo: 'Ajude-nos a melhorar!',
    descricao: 'Participe da nossa pesquisa de satisfação e nos ajude a melhorar ainda mais nossos serviços.',
  };

  useEffect(() => {
    // Não exibir se estiver desativado
    if (!popupConfig.ativo || popupConfig.frequencia === 'nunca') {
      return;
    }

    // Only check storage if user has consented to preferences cookies
    const canUseStorage = hasConsentFor('preferences');
    const hasShownPopup = canUseStorage ? localStorage.getItem('hasShownSurveyPopup') : null;
    
    // Lógica baseada na frequência configurada
    if (popupConfig.frequencia === 'primeira_visita' && hasShownPopup) {
      return;
    }
    
    if (popupConfig.frequencia === 'sempre') {
      // Sempre exibir, mas com um delay para não ser muito intrusivo
      const sessionShown = canUseStorage ? sessionStorage.getItem('popupShownThisSession') : null;
      if (sessionShown) {
        return;
      }
      if (canUseStorage) {
        sessionStorage.setItem('popupShownThisSession', 'true');
      }
    }

    // Exibir popup após o tempo configurado
    const timer = setTimeout(() => {
      setIsOpen(true);
      if (popupConfig.frequencia === 'primeira_visita' && canUseStorage) {
        localStorage.setItem('hasShownSurveyPopup', 'true');
      }
    }, popupConfig.tempoExibicao || 5000);

    return () => clearTimeout(timer);
  }, [popupConfig]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {popupConfig.titulo || 'Ajude-nos a melhorar!'}
          </DialogTitle>
          <DialogDescription className="text-center">
            Sua opinião é muito importante para continuarmos oferecendo o melhor serviço de táxi.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-gray-600 mb-4">
            {popupConfig.descricao || 'Participe da nossa pesquisa de satisfação e nos ajude a melhorar ainda mais nossos serviços.'}
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Agora não
          </Button>
          <Link to="/PesquisaSatisfacao" className="w-full sm:w-auto">
            <Button
              className="w-full bg-taxi-yellow text-black hover:bg-taxi-green hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Participar da Pesquisa
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyInvitationPopup;