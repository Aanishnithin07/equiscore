import { create } from 'zustand';
import { HackathonResponse } from '../types/evaluation';

interface HackathonState {
  currentHackathon: HackathonResponse | null;
  setCurrentHackathon: (hackathon: HackathonResponse | null) => void;
}

export const useHackathonStore = create<HackathonState>()((set) => ({
  currentHackathon: null,
  setCurrentHackathon: (hackathon) => set({ currentHackathon: hackathon }),
}));
