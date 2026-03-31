import { z } from 'zod';
import { AppointmentStatus, ConsultationType } from './types';

export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  date: z.coerce.date(),
  timeSlot: z.string().min(3),
  consultationType: z.nativeEnum(ConsultationType),
  symptoms: z.string().min(1),
  notes: z.string().optional(),
  paymentAmount: z.number().min(0).optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  cancelReason: z.string().optional(),
});

export const availableSlotsSchema = z.object({
  doctorId: z.string().min(1),
  date: z.coerce.date(),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AvailableSlotsInput = z.infer<typeof availableSlotsSchema>;
