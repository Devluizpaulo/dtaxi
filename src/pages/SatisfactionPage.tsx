
import React from 'react';
import SatisfactionResults from '@/components/dashboard/SatisfactionResults';
import { PageTitle } from '@/components/ui/page-title';

const SatisfactionPage = () => {
  return (
    <>
      <PageTitle title="Pesquisa de Satisfação | D-TAXI" />
      <SatisfactionResults />
    </>
  );
};

export default SatisfactionPage;
