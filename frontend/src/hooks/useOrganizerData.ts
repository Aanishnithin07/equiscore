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

export function useOrganizerData() {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [teams, setTeams] = useState<TeamMemberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const hackathonId = useAuthStore(state => state.user?.hackathonId);

  const fetchDashboardData = useCallback(async () => {
    if (!hackathonId) return;
    setIsLoading(true);
    setError(null);
    try {
      // In a real app we'd have dedicated aggregation endpoints:
      // const statsRes = await apiClient.get(`/hackathons/${hackathonId}/stats`);
      // const teamsRes = await apiClient.get(`/hackathons/${hackathonId}/teams`);
      
      // For now we mock the API response structurally based on Phase 2
      setTimeout(() => {
        setStats({
          totalSubmissions: 42,
          pendingAnalysis: 3,
          averageScore: 76.5,
          failedSubmissions: 1
        });
        
        setTeams([
          { id: '1', name: 'Alpha Dynamics', track: 'healthcare', score: 85, behavioralScore: 90, status: 'completed', jobId: 'j1' },
          { id: '2', name: 'Beta Innovators', track: 'ai_ml', score: null, behavioralScore: null, status: 'processing', jobId: 'j2' },
          { id: '3', name: 'Gamma Protocol', track: 'open_innovation', score: 92, behavioralScore: 88, status: 'completed', jobId: 'j3' },
          { id: '4', name: 'Delta Force', track: 'ai_ml', score: null, behavioralScore: null, status: 'failed', jobId: 'j4' }
        ]);
        
        setIsLoading(false);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generic organizer data.');
      setIsLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Actions
  const advanceHackathonStage = async (newStatus: string) => {
     await apiClient.patch(`/hackathons/${hackathonId}`, { status: newStatus });
     fetchDashboardData();
  };

  const publishResults = async () => {
     await apiClient.post(`/hackathons/${hackathonId}/publish`);
     fetchDashboardData();
  };

  return {
    stats,
    teams,
    isLoading,
    error,
    refreshFn: fetchDashboardData,
    advanceHackathonStage,
    publishResults
  };
}
