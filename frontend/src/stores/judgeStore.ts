import { create } from 'zustand';
import { TrackEnum } from '../types/evaluation';
import { api } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';

let wsInstance: WebSocket | null = null;
let pingInterval: ReturnType<typeof setInterval> | null = null;

interface JudgeState {
  // State
  selectedJobId: string | null;
  trackFilter: TrackEnum | 'all';
  humanOverrideScore: number;
  judgeNotes: string;
  isSubmitting: boolean;
  submittedJobIds: Set<string>;
  plagiarismAlerts: any[];

  // Actions
  setSelectedJob: (jobId: string | null, aiScore?: number) => void;
  setTrackFilter: (filter: TrackEnum | 'all') => void;
  setHumanScore: (score: number) => void;
  setNotes: (notes: string) => void;
  submitOverride: () => Promise<void>;
  
  // WS
  connectWebSocket: (hackathonId: string, token: string, queryClient: any) => void;
  disconnectWebSocket: () => void;
}

export const useJudgeStore = create<JudgeState>()((set, get) => ({
  selectedJobId: null,
  trackFilter: 'all',
  humanOverrideScore: 0,
  judgeNotes: '',
  isSubmitting: false,
  submittedJobIds: new Set<string>(),
  plagiarismAlerts: [],

  setSelectedJob: (jobId, aiScore = 50) => 
    set((state) => {
      // If we are selecting a new team, reset the override score to their AI baseline 
      // so the slider starts near where the AI scored them
      if (jobId !== state.selectedJobId) {
        return { 
          selectedJobId: jobId, 
          humanOverrideScore: aiScore,
          judgeNotes: '' // Reset notes on new selection
        };
      }
      return { selectedJobId: jobId };
    }),

  setTrackFilter: (filter) => set({ trackFilter: filter }),
  
  setHumanScore: (score) => set({ humanOverrideScore: score }),
  
  setNotes: (notes) => set({ judgeNotes: notes }),

  submitOverride: async () => {
    const { selectedJobId, humanOverrideScore, judgeNotes, submittedJobIds } = get();
    if (!selectedJobId) return;

    set({ isSubmitting: true });
    try {
      await api.submitOverride(selectedJobId, humanOverrideScore, judgeNotes);
      
      // Add to locked-in set so we can visually indicate it's submitted
      const newSubmitted = new Set(submittedJobIds);
      newSubmitted.add(selectedJobId);
      
      set({ submittedJobIds: newSubmitted });
    } catch (error) {
      console.error("Failed to submit override", error);
    } finally {
      set({ isSubmitting: false });
    }
  },

  connectWebSocket: (hackathonId, token, queryClient) => {
    if (wsInstance) return;

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${WS_URL}/api/v1/ws/hackathon/${hackathonId}?token=${token}`);

    ws.onopen = () => {
      console.log('WS Connected for hackathon:', hackathonId);
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'evaluation_complete') {
          // Invalidate leaderboard to trigger a refetch since a new score came in automatically natively
          queryClient.invalidateQueries({ queryKey: ['leaderboard', 'all'] });
        } else if (data.type === 'plagiarism_alert') {
          set((state) => ({ plagiarismAlerts: [data.payload, ...state.plagiarismAlerts] }));
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    ws.onclose = () => {
      console.log('WS Disconnected');
      if (pingInterval) clearInterval(pingInterval);
      wsInstance = null;
      // Auto-reconnect could go here
    };

    wsInstance = ws;
  },

  disconnectWebSocket: () => {
    if (wsInstance) {
      wsInstance.close();
      wsInstance = null;
    }
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  }
}));
