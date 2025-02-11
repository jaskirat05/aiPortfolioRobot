import React from 'react';
import {CustomOrganizationSwitcher} from '../components/OrganizationSwitcher';
import { ClerkProvider } from '@clerk/nextjs';
export const metadata = {
  title: 'Clients | Portfolio',
  description: 'Client work and collaborations',
};

const ClientsPage = () => {
  return (
    <ClerkProvider>
    
      <CustomOrganizationSwitcher />
   
    
    </ClerkProvider>
  );
};

export default ClientsPage;
