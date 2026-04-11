import React from 'react';
import { RegisterPage } from '../pages/auth/RegisterPage';

export default {
  title: 'Pages/Auth/RegisterPage',
  component: RegisterPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Secondary Entry point wrapping registration forms routing Framer layouts natively.'
      }
    }
  }
};

export const Default = {
  args: {
    onRegister: (cred: any) => console.log('Register', cred),
    onNavigateLogin: () => console.log('Navigate to Login')
  }
};
