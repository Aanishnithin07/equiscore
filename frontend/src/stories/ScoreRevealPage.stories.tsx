import React from 'react';
import { ScoreRevealPage } from '../pages/team/ScoreRevealPage';

export default {
  title: 'Pages/Team/ScoreRevealPage',
  component: ScoreRevealPage,
  parameters: { layout: 'fullscreen' }
};

export const Advanced = () => (
  <ScoreRevealPage 
    score={91} rank={3} totalTeams={142} advanced={true}
    onDownloadReport={() => {}} onViewDetailedResults={() => {}}
  />
);

export const Normal = () => (
    <ScoreRevealPage 
      score={68} rank={84} totalTeams={142} advanced={false}
      onDownloadReport={() => {}} onViewDetailedResults={() => {}}
    />
  );
