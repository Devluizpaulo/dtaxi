import { useState, useEffect } from 'react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  preferences: false,
  marketing: false,
};

export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load saved preferences from localStorage
    const loadPreferences = () => {
      try {
        const savedConsent = localStorage.getItem('cookieConsent');
        if (savedConsent) {
          const parsedPreferences = JSON.parse(savedConsent);
          setPreferences(parsedPreferences);
          setHasConsent(true);
        }
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences));
    setHasConsent(true);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true,
    };
    updatePreferences(allAccepted);
  };

  const rejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false,
    };
    updatePreferences(onlyEssential);
  };

  const resetConsent = () => {
    localStorage.removeItem('cookieConsent');
    setPreferences(defaultPreferences);
    setHasConsent(false);
  };

  // Helper functions to check specific cookie types
  const canUseAnalytics = () => preferences.analytics;
  const canUsePreferences = () => preferences.preferences;
  const canUseMarketing = () => preferences.marketing;

  // Function to check consent for a specific cookie type
  const hasConsentFor = (type: keyof CookiePreferences) => {
    return hasConsent && preferences[type];
  };

  // Function to conditionally execute code based on consent
  const withConsent = (type: keyof CookiePreferences, callback: () => void) => {
    if (hasConsent && preferences[type]) {
      callback();
    }
  };

  return {
    preferences,
    hasConsent,
    isLoading,
    updatePreferences,
    acceptAll,
    rejectAll,
    resetConsent,
    canUseAnalytics,
    canUsePreferences,
    canUseMarketing,
    hasConsentFor,
    withConsent,
  };
};

export default useCookieConsent;