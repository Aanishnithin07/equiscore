import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { AuthResponse, EvaluationStatusResponse, LeaderboardResponse, TrackEnum } from '../types/evaluation';
import { useAuthStore } from '../stores/authStore';

// Fallback UUID v4 generator for request traces
function generateUUID(): string {
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

// ── Request Interceptor: Inject Trace IDs & Tokens ────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.headers['X-Request-ID']) {
    config.headers['X-Request-ID'] = generateUUID();
  }
  
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Global Error Handling & Refresh ─────────────────
let isRefreshing = false;
let failedQueue: { resolve: (val: string | null) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (originalRequest && error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise<string | null>(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
            if (token) {
                originalRequest.headers.Authorization = 'Bearer ' + token;
                return apiClient(originalRequest);
            }
            return Promise.reject(error);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<AuthResponse>(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
        apiClient.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response && error.response.status >= 500) {
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

// ── API Functions ────────────────────────────────────────────────────────
export const api = {
  /** Check backend health */
  healthCheck: async (): Promise<{ status: string }> => {
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

  submitOverride: async (
    jobId: string,
    score: number,
    notes: string
  ): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post(`/evaluate-pitch`, { 
        job_id: jobId, 
        evaluator_id: "judge", 
        human_score: score, 
        human_notes: notes 
    });
    return data;
  },

  /** Auth Endpoints */
  login: async (email: string, password: string, hackathon_slug?: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password, hackathon_slug });
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', { email, password, full_name: fullName });
    return data;
  },

  /** Invites */
  getInvitePreview: async (token: string): Promise<{hackathon_name: string; role: string; team_name: string | null}> => {
    const { data } = await apiClient.get(`/invites/${token}/preview`);
    return data;
  },

  redeemInvite: async (token: string, teamName?: string): Promise<{message: string; hackathon_id: string; role: string}> => {
    const { data } = await apiClient.post('/invites/redeem', { token, team_name: teamName });
    return data;
  },

  getBiasReport: async (hackathonId: string, forceRerun: boolean = false): Promise<any> => {
    const { data } = await apiClient.get(`/audit/${hackathonId}/bias-report`, { params: { force_rerun: forceRerun }});
    return data;
  }
};
