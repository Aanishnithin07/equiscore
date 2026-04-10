import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

/**
 * Fetches the detail of a single evaluation. 
 * If the evaluation is 'pending' or 'processing', it polls frequently.
 */
export function useEvaluation(jobId: string | null) {
  return useQuery({
    queryKey: ['evaluation', jobId],
    queryFn: () => jobId ? api.getEvaluation(jobId) : null,
    enabled: !!jobId,
    // Dynamic polling: if it's not completed/failed, poll every 3 seconds
    refetchInterval: (query) => {
      const status = query.state?.data?.status;
      if (status === 'pending' || status === 'processing') return 3000;
      return false; // Stop polling when complete/failed
    },
    staleTime: 60000, // Detailed data is cacheable once static
  });
}
