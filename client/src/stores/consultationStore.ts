import { create } from 'zustand';

export interface ConsultationState {
  activeConsultationId: string | null;
  notes: string;
  prescriptions: string[];
  startedAt: string | null;
  setActiveConsultation: (id: string | null) => void;
  updateNotes: (value: string) => void;
  addPrescription: (value: string) => void;
  removePrescription: (index: number) => void;
  reset: () => void;
}

const initialState = {
  activeConsultationId: null,
  notes: '',
  prescriptions: [],
  startedAt: null,
};

export const useConsultationStore = create<ConsultationState>((set) => ({
  ...initialState,

  setActiveConsultation: (id) => {
    set({
      activeConsultationId: id,
      startedAt: id ? new Date().toISOString() : null,
    });
  },

  updateNotes: (value) => {
    set({ notes: value });
  },

  addPrescription: (value) => {
    const nextValue = value.trim();
    if (!nextValue) return;

    set((state) => ({ prescriptions: [...state.prescriptions, nextValue] }));
  },

  removePrescription: (index) => {
    set((state) => ({
      prescriptions: state.prescriptions.filter((_, itemIndex) => itemIndex !== index),
    }));
  },

  reset: () => {
    set(initialState);
  },
}));
