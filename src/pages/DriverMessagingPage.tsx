
import React from 'react';
import DriverMessaging from '@/components/dashboard/DriverMessaging';
import { PageTitle } from '@/components/ui/page-title';

const DriverMessagingPage = () => {
  return (
    <>
      <PageTitle title="Elogios aos Motoristas | D-TAXI" />
      <DriverMessaging />
    </>
  );
};

export default DriverMessagingPage;
