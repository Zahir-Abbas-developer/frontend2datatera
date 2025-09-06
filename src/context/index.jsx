
import React from 'react';

import { AuthProvider } from './auth';
import { ListProvider } from './list';
import { PlanProvider } from './plans/plans';


const ContextProvider = ({ children }) => {
  return (
    <AuthProvider>
      <PlanProvider>
        <ListProvider>{children}</ListProvider>
      </PlanProvider>
    </AuthProvider>
  );
};

export default ContextProvider;
