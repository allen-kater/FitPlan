import { create } from 'zustand';
import type { PetDTO } from '../types';
import { getMyPet } from '../api/pet';

interface PetState {
  pet: PetDTO | null;
  loading: boolean;
  fetchPet: () => Promise<void>;
  setPet: (pet: PetDTO | null) => void;
  clearPet: () => void;
}

export const usePetStore = create<PetState>((set) => ({
  pet: null,
  loading: false,

  fetchPet: async () => {
    set({ loading: true });
    try {
      const res = await getMyPet();
      set({ pet: res.data || null, loading: false });
    } catch {
      set({ pet: null, loading: false });
    }
  },

  setPet: (pet) => set({ pet }),

  clearPet: () => set({ pet: null }),
}));
