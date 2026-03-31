import { create } from 'zustand';
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getAvailableSlots,
} from '../services/appointmentService';

export interface AppointmentItem {
  _id?: string;
  id?: string;
  doctorId?: string;
  patientId?: string;
  date: string;
  time?: string;
  status: string;
  [key: string]: unknown;
}

interface AppointmentStore {
  appointments: AppointmentItem[];
  availableSlots: string[];
  isLoading: boolean;
  error: string | null;
  fetchMyAppointments: (filters?: Record<string, unknown>) => Promise<void>;
  book: (data: Record<string, unknown>) => Promise<void>;
  cancel: (id: string, reason?: string) => Promise<void>;
  fetchSlots: (doctorId: string, date: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  availableSlots: [],
  isLoading: false,
  error: null,

  fetchMyAppointments: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMyAppointments(filters);
      const list = (response?.appointments || response?.data || []) as AppointmentItem[];
      set({ appointments: list, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load appointments';
      set({ error: message, isLoading: false });
    }
  },

  book: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookAppointment(data);
      const created = (response?.appointment || response?.data || response) as AppointmentItem;
      const appointments = [created, ...get().appointments];
      set({ appointments, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create appointment';
      set({ error: message, isLoading: false });
    }
  },

  cancel: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      await cancelAppointment(id, reason);
      const appointments = get().appointments.map((item) => {
        if (item._id === id || item.id === id) {
          return { ...item, status: 'CANCELLED' };
        }
        return item;
      });
      set({ appointments, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel appointment';
      set({ error: message, isLoading: false });
    }
  },

  fetchSlots: async (doctorId, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAvailableSlots(doctorId, date);
      const slots =
        (response?.slots as string[] | undefined) ||
        (response?.data?.slots as string[] | undefined) ||
        (response?.data as string[] | undefined) ||
        [];
      set({ availableSlots: slots, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch available slots';
      set({ error: message, isLoading: false });
    }
  },
}));
