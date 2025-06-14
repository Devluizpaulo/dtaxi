import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, Cookie } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import useCookieConsent, { CookiePreferences } from '@/hooks/useCookieConsent';

const CookieBanner = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
    marketing: false,
  });
  
  const { 
    preferences, 
    hasConsent, 
    isLoading, 
    updatePreferences, 
    acceptAll, 
    rejectAll 
  } = useCookieConsent();

  // Initialize local preferences with current preferences
  React.useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  const handleSavePreferences = () => {
    updatePreferences(localPreferences);
    setShowSettings(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setLocalPreferences(prev => ({ ...prev, [type]: value }));
  };

  // Don't show banner if user has already given consent or if still loading
  if (hasConsent || isLoading) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
        <Card className="max-w-6xl mx-auto p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Este site utiliza cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência de navegação, 
                  lembrar suas preferências e analisar o tráfego do site. 
                  Você pode escolher quais tipos de cookies aceitar.
                </p>
                <Link 
                  to="/politica-privacidade" 
                  className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                >
                  Saiba mais sobre nossa Política de Privacidade
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configurações de Cookies</DialogTitle>
                    <DialogDescription>
                      Escolha quais tipos de cookies você deseja aceitar.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="font-medium">Cookies Essenciais</Label>
                        <p className="text-xs text-gray-500">
                          Necessários para o funcionamento básico do site
                        </p>
                      </div>
                      <Switch 
                        checked={localPreferences.essential} 
                        disabled 
                        aria-label="Cookies essenciais (obrigatórios)"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="font-medium">Cookies de Preferências</Label>
                        <p className="text-xs text-gray-500">
                          Lembram suas configurações e preferências
                        </p>
                      </div>
                      <Switch 
                        checked={localPreferences.preferences} 
                        onCheckedChange={(value) => handlePreferenceChange('preferences', value)}
                        aria-label="Cookies de preferências"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="font-medium">Cookies de Análise</Label>
                        <p className="text-xs text-gray-500">
                          Ajudam a entender como você usa o site
                        </p>
                      </div>
                      <Switch 
                        checked={localPreferences.analytics} 
                        onCheckedChange={(value) => handlePreferenceChange('analytics', value)}
                        aria-label="Cookies de análise"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="font-medium">Cookies de Marketing</Label>
                        <p className="text-xs text-gray-500">
                          Usados para personalizar anúncios
                        </p>
                      </div>
                      <Switch 
                        checked={localPreferences.marketing} 
                        onCheckedChange={(value) => handlePreferenceChange('marketing', value)}
                        aria-label="Cookies de marketing"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={handleSavePreferences} 
                      className="flex-1"
                    >
                      Salvar Preferências
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRejectAll}
              >
                Rejeitar
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Aceitar Todos
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default CookieBanner;