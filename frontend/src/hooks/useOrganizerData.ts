import { useState, useCallback, useEffect } from 'react';
import { api, apiClient } from '../api/client';
import { useAuthStore } from '../stores/authStore';

export interface OrganizerStats {
  totalSubmissions: number;
  pendingAnalysis: number;
  averageScore: number;
  failedSubmissions: number;
}

export interface TeamMemberRow {
  id: string;
  name: string;
  track: string;
  score: number | null;
  behavioralScore: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId: string | null;
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useOrganizerData() {
  const hackathonId = useAuthStore(state => state.user?.hackathonId);
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
     queryKey: ['organizer-stats', hackathonId],
     queryFn: async () => {
         const res = await apiClient.get('/analytics/overview');
         return res.data;
     },
     enabled: !!hackathonId,
  });

  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useQuery({
     queryKey: ['organizer-teams', hackathonId],
     queryFn: async () => {
         const res = await apiClient.get('/teams/');
         return res.data.map((t: any) => ({
             id: String(t.id),
             name: t.name,
             track: t.submission?.track || 'General',
             score: t.final_score || null,
             behavioralScore: null,
             status: t.evaluation_status || 'unscored',
             jobId: null,
             topStrengths: ['Dynamically parsed from system'],
             topWeakness: 'Evaluated Live'
         }));
     },
     enabled: !!hackathonId,
  });

  // Actions
  const advanceHackathonStage = async (newStatus: string) => {
     await apiClient.patch(`/hackathons/${hackathonId}`, { status: newStatus });
     queryClient.invalidateQueries({ queryKey: ['organizer-stats'] });
  };

  const publishResults = async () => {
     await apiClient.post(`/hackathons/${hackathonId}/publish`);
     queryClient.invalidateQueries({ queryKey: ['organizer-teams'] });
  };

  return {
    stats,
    teams,
    isLoading: statsLoading || teamsLoading,
    error: statsError || teamsError,
    refreshFn: () => queryClient.invalidateQueries(),
    advanceHackathonStage,
    publishResults
  };
}
