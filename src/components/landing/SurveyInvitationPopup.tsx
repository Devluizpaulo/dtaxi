import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SurveyInvitationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the popup has been shown before
    const hasShownPopup = localStorage.getItem('hasShownSurveyPopup');
    if (!hasShownPopup) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('hasShownSurveyPopup', 'true');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Ajude-nos a melhorar!</DialogTitle>
          <DialogDescription className="text-center">
            Sua opinião é muito importante para continuarmos oferecendo o melhor serviço de táxi.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-gray-600 mb-4">
            Participe da nossa pesquisa de satisfação e nos ajude a melhorar ainda mais nossos serviços.
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