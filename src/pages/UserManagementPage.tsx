
import React from 'react';
import UserManagement from '@/components/dashboard/UserManagement';
import { PageTitle } from '@/components/ui/page-title';

const UserManagementPage = () => {
  return (
    <>
      <PageTitle title="Gerenciamento de Usuários | D-TAXI" />
      <UserManagement />
    </>
  );
};

export default UserManagementPage;
