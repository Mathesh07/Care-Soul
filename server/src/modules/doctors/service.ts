import Doctor from './model';
import Appointment from '../appointments/model';
import { AppointmentStatus } from '../appointments/types';

const DEFAULT_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

interface SearchFilters {
  specialization?: string;
  language?: string;
  minRating?: number;
  maxFee?: number;
  isAvailableNow?: boolean;
  page?: number;
  limit?: number;
}

interface DoctorProfileInput {
  specialization: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  languages: string[];
  weeklySchedule?: Record<string, unknown>;
  bio?: string;
  isAvailableNow?: boolean;
}

export const DoctorService = {
  createProfile: async (userId: string, data: DoctorProfileInput) =>
    Doctor.create({
      userId,
      ...data,
    }),

  findByUserId: async (userId: string) =>
    Doctor.findOne({ userId }).populate('userId'),

  findById: async (id: string) =>
    Doctor.findById(id).populate('userId'),

  search: async (filters: SearchFilters = {}) => {
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.min(50, Math.max(1, Number(filters.limit || 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters.specialization) {
      query.specialization = { $regex: filters.specialization, $options: 'i' };
    }

    if (filters.language) {
      query.languages = { $in: [filters.language] };
    }

    if (typeof filters.minRating === 'number') {
      query.rating = { ...(query.rating as object), $gte: filters.minRating };
    }

    if (typeof filters.maxFee === 'number') {
      query.consultationFee = { $lte: filters.maxFee };
    }

    if (typeof filters.isAvailableNow === 'boolean') {
      query.isAvailableNow = filters.isAvailableNow;
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .populate('userId')
        .sort({ rating: -1, totalConsultations: -1 })
        .skip(skip)
        .limit(limit),
      Doctor.countDocuments(query),
    ]);

    return {
      doctors,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  updateProfile: async (doctorId: string, data: Partial<DoctorProfileInput>) =>
    Doctor.findByIdAndUpdate(doctorId, data, { new: true }).populate('userId'),

  getAvailableSlots: async (doctorId: string, date: string | Date): Promise<string[]> => {
    const inputDate = new Date(date);
    const dayStart = new Date(inputDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(inputDate);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: AppointmentStatus.CANCELLED },
    }).select('timeSlot');

    const bookedSlots = new Set(
      bookedAppointments
        .map((item) => item.timeSlot)
        .filter(Boolean)
        .map((slot) => String(slot).split('-')[0])
    );

    return DEFAULT_SLOTS.filter((slot) => !bookedSlots.has(slot));
  },

  updateRating: async (doctorId: string) => {
    const completedAppointments = await Appointment.find({
      doctorId,
      status: AppointmentStatus.COMPLETED,
    }).select('rating');

    const ratings = completedAppointments
      .map((item) => {
        const value = (item as unknown as { rating?: number }).rating;
        return typeof value === 'number' ? value : null;
      })
      .filter((value): value is number => value !== null);

    const totalConsultations = completedAppointments.length;
    const rating = ratings.length
      ? Number((ratings.reduce((acc, value) => acc + value, 0) / ratings.length).toFixed(2))
      : 0;

    return Doctor.findByIdAndUpdate(
      doctorId,
      {
        rating,
        totalConsultations,
      },
      { new: true }
    );
  },
};
