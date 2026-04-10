import axios from 'axios';
import { EvaluationStatusResponse, LeaderboardResponse, TrackEnum } from '../types/evaluation';

// Fallback UUID v4 generator for request traces
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ── Base Axios Instance ──────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Inject Trace IDs ────────────────────────────────
apiClient.interceptors.request.use((config) => {
  // Add a unique request ID to track end-to-end trace per the backend structlog spec
  if (!config.headers['X-Request-ID']) {
    config.headers['X-Request-ID'] = generateUUID();
  }
  return config;
});

// ── Response Interceptor: Global Error Handling ──────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // In a full app with a toast library, you'd trigger toasts here for 401/500
    if (error.response?.status === 401) {
      console.error('Session expired');
    } else if (error.response?.status >= 500) {
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

// ── API Functions ────────────────────────────────────────────────────────
export const api = {
  /** Check backend health */
  healthCheck: async (): Promise<{ status: string }> => {
    // We intentionally hit the root base URL (which removes /api/v1 for health check)
    const url = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('/api/v1', '') + '/health';
    const { data } = await axios.get(url);
    return data;
  },

  /** Fetch the live leaderboard */
  getLeaderboard: async (
    track?: TrackEnum | 'all',
    limit: number = 50,
    offset: number = 0
  ): Promise<LeaderboardResponse> => {
    const params: Record<string, string | number> = { limit, offset };
    if (track && track !== 'all') {
      params.track = track;
    }
    const { data } = await apiClient.get<LeaderboardResponse>('/leaderboard', { params });
    return data;
  },

  /** Fetch detailed evaluation status by job ID */
  getEvaluation: async (jobId: string): Promise<EvaluationStatusResponse> => {
    const { data } = await apiClient.get<EvaluationStatusResponse>(`/evaluation/${jobId}`);
    return data;
  },

  /** Phase 2: Override a score physically (mock endpoint, returns success) */
  submitOverride: async (
    jobId: string,
    score: number,
    notes: string
  ): Promise<{ success: boolean; message: string }> => {
    // We mock this since the backend route for this specific action wasn't part of Phase 1
    // Usually this would be: await apiClient.post(`/evaluation/${jobId}/override`, { score, notes });
    console.log(`[Mock Submission] Job: ${jobId}, Score: ${score}, Notes: ${notes}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Score successfully locked in.' });
      }, 800); // simulate network delay
    });
  },
};
