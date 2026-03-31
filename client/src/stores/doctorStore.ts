import { create } from 'zustand';
import { searchDoctors, getDoctorById, getDoctorSlots } from '../services/doctorService';

interface DoctorItem {
  _id?: string;
  id?: string;
  [key: string]: unknown;
}

interface DoctorStore {
  doctors: DoctorItem[];
  selectedDoctor: DoctorItem | null;
  availableSlots: string[];
  isLoading: boolean;
  error: string | null;
  search: (filters?: Record<string, unknown>) => Promise<void>;
  selectDoctor: (id: string) => Promise<void>;
  fetchSlots: (id: string, date: string) => Promise<void>;
  clearSelection: () => void;
}

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctors: [],
  selectedDoctor: null,
  availableSlots: [],
  isLoading: false,
  error: null,

  search: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await searchDoctors(filters);
      const doctors =
        (response?.doctors as DoctorItem[] | undefined) ||
        (response?.data as DoctorItem[] | undefined) ||
        [];
      set({ doctors, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to search doctors';
      set({ error: message, isLoading: false });
    }
  },

  selectDoctor: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getDoctorById(id);
      const selectedDoctor =
        (response?.profile as DoctorItem | undefined) ||
        (response?.doctor as DoctorItem | undefined) ||
        (response?.data as DoctorItem | undefined) ||
        null;
      set({ selectedDoctor, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch doctor details';
      set({ error: message, isLoading: false });
    }
  },

  fetchSlots: async (id, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getDoctorSlots(id, date);
      const availableSlots =
        (response?.slots as string[] | undefined) ||
        (response?.data?.slots as string[] | undefined) ||
        (response?.data as string[] | undefined) ||
        [];
      set({ availableSlots, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch available slots';
      set({ error: message, isLoading: false });
    }
  },

  clearSelection: () => {
    set({ selectedDoctor: null, availableSlots: [] });
  },
}));
