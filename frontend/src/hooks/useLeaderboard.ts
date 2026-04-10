import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useJudgeStore } from '../stores/judgeStore';

/**
 * Polls the leaderboard every 30 seconds to get the live state of hackathon teams.
 */
export function useLeaderboard() {
  const trackFilter = useJudgeStore((state) => state.trackFilter);

  return useQuery({
    queryKey: ['leaderboard', trackFilter],
    queryFn: () => api.getLeaderboard(trackFilter),
    // Poll every 30 seconds since this is a live dashboard
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
