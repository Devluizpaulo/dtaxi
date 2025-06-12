import React from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import HeroSection from '@/components/landing/HeroSection';
import CompanyHistoryCarousel from '@/components/landing/CompanyHistoryCarousel';
import FleetSection from '@/components/landing/FleetSection';
import SustainabilitySection from '@/components/landing/SustainabilitySection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SurveyInvitationPopup from '@/components/landing/SurveyInvitationPopup';

const Index = () => {
  return (
    <BaseLayout>
      <SurveyInvitationPopup />
      <HeroSection />
      <CompanyHistoryCarousel />
      <FleetSection />
      <SustainabilitySection />
      <TestimonialsSection />
      <FAQSection />
    </BaseLayout>
  );
};

export default Index;
