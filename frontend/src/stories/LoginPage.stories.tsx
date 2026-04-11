import React from 'react';
import { LoginPage } from '../pages/auth/LoginPage';

export default {
  title: 'Pages/Auth/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Primary Entry point to the platform bridging mesh background physics natively.'
      }
    }
  }
};

export const Default = {
  args: {
    onLogin: (cred: any) => console.log('Login', cred),
    onNavigateRegister: () => console.log('Navigate to Register')
  }
};
