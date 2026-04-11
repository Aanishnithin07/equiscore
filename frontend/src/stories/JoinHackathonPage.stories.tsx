import React from 'react';
import { JoinHackathonPage } from '../pages/auth/JoinHackathonPage';

export default {
  title: 'Pages/Auth/JoinHackathonPage',
  component: JoinHackathonPage,
  parameters: {
    layout: 'fullscreen',
  }
};

export const Default = {
  args: {
    onJoin: (token: string) => alert('Joining with: ' + token)
  }
};
