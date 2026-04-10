import { create } from 'zustand';
import { TrackEnum } from '../types/evaluation';
import { api } from '../api/client';

interface JudgeState {
  // State
  selectedJobId: string | null;
  trackFilter: TrackEnum | 'all';
  humanOverrideScore: number;
  judgeNotes: string;
  isSubmitting: boolean;
  submittedJobIds: Set<string>;

  // Actions
  setSelectedJob: (jobId: string | null, aiScore?: number) => void;
  setTrackFilter: (filter: TrackEnum | 'all') => void;
  setHumanScore: (score: number) => void;
  setNotes: (notes: string) => void;
  submitOverride: () => Promise<void>;
}

export const useJudgeStore = create<JudgeState>()((set, get) => ({
  selectedJobId: null,
  trackFilter: 'all',
  humanOverrideScore: 0,
  judgeNotes: '',
  isSubmitting: false,
  submittedJobIds: new Set<string>(),

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
}));
