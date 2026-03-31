import { z } from 'zod';

const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const TimeSlotSchema = z.object({
  start: z.string().regex(hhmmRegex, 'start must be HH:MM'),
  end: z.string().regex(hhmmRegex, 'end must be HH:MM'),
});

export const DayScheduleSchema = z.object({
  isWorking: z.boolean(),
  slots: z.array(TimeSlotSchema),
});

export const WeeklyScheduleSchema = z.object({
  monday: DayScheduleSchema,
  tuesday: DayScheduleSchema,
  wednesday: DayScheduleSchema,
  thursday: DayScheduleSchema,
  friday: DayScheduleSchema,
  saturday: DayScheduleSchema,
  sunday: DayScheduleSchema,
});

export const createDoctorProfileSchema = z.object({
  specialization: z.string().min(2),
  qualifications: z.array(z.string()).min(1),
  experience: z.number().min(0).max(60),
  consultationFee: z.number().min(0),
  languages: z.array(z.string()).default(['English']),
  weeklySchedule: WeeklyScheduleSchema.optional(),
  bio: z.string().max(1000).optional(),
});

export const updateDoctorProfileSchema = z.object({
  specialization: z.string().min(2).optional(),
  qualifications: z.array(z.string()).min(1).optional(),
  experience: z.number().min(0).max(60).optional(),
  consultationFee: z.number().min(0).optional(),
  languages: z.array(z.string()).optional(),
  weeklySchedule: WeeklyScheduleSchema.optional(),
  bio: z.string().max(1000).optional(),
});

export const searchDoctorsSchema = z.object({
  specialization: z.string().optional(),
  language: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxFee: z.number().min(0).optional(),
  isAvailableNow: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});
