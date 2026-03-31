import { Response } from 'express';
import { z } from 'zod';

import { AuthenticatedRequest } from '../../middleware/auth';
import { AppointmentStatus } from './types';
import { AppointmentService } from './service';
import {
  availableSlotsSchema,
  bookAppointmentSchema,
  updateStatusSchema,
} from './validation';

const SLOT_MINUTES = 30;
const START_HOUR = 9;
const END_HOUR = 17;

function resolveParamId(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0];
  }

  return null;
}

function buildDaySlots(): string[] {
  const slots: string[] = [];

  for (let hour = START_HOUR; hour < END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      const startHour = String(hour).padStart(2, '0');
      const startMin = String(minute).padStart(2, '0');

      const endDate = new Date();
      endDate.setHours(hour, minute + SLOT_MINUTES, 0, 0);
      const endHour = String(endDate.getHours()).padStart(2, '0');
      const endMin = String(endDate.getMinutes()).padStart(2, '0');

      slots.push(`${startHour}:${startMin}-${endHour}:${endMin}`);
    }
  }

  return slots;
}

/** Book a new appointment after validating input and checking slot conflicts. */
export const bookAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const input = bookAppointmentSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.user.role === 'patient' && req.user.id !== input.patientId) {
      res.status(403).json({ success: false, message: 'Patients can book only their own appointments.' });
      return;
    }

    const hasConflict = await AppointmentService.checkSlotConflict(
      input.doctorId,
      input.date,
      input.timeSlot
    );

    if (hasConflict) {
      res.status(409).json({ success: false, message: 'Selected slot is already booked.' });
      return;
    }

    const appointment = await AppointmentService.create(input);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.flatten() });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to book appointment.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/** Return appointments for currently authenticated patient or doctor. */
export const getMyAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const status = (req.query.status as AppointmentStatus | undefined) || undefined;
    const filters = { status };

    if (req.user.role === 'patient') {
      const appointments = await AppointmentService.findByPatient(req.user.id, filters);
      res.status(200).json({ success: true, data: appointments });
      return;
    }

    if (req.user.role === 'doctor') {
      const appointments = await AppointmentService.findByDoctor(req.user.id, filters);
      res.status(200).json({ success: true, data: appointments });
      return;
    }

    res.status(403).json({ success: false, message: 'Only patients and doctors can access this route.' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/** Cancel an appointment if current user is owner doctor/patient or admin. */
export const cancelAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const statusPayload = updateStatusSchema.parse({
      status: AppointmentStatus.CANCELLED,
      cancelReason: req.body?.cancelReason,
    });

    const appointmentId = resolveParamId(req.params?.id);
    if (!appointmentId) {
      res.status(400).json({ success: false, message: 'Appointment id is required.' });
      return;
    }

    const appointment = await AppointmentService.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isPatientOwner = appointment.patientId.toString() === userId;
    const isDoctorOwner = appointment.doctorId.toString() === userId;

    if (!isAdmin && !isPatientOwner && !isDoctorOwner) {
      res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment.' });
      return;
    }

    const updated = await AppointmentService.updateStatus(
      appointmentId,
      statusPayload.status,
      statusPayload.cancelReason
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.flatten() });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/** Return available 30-minute slots for a specific doctor and date. */
export const getAvailableSlots = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = availableSlotsSchema.parse({
      doctorId: req.query.doctorId,
      date: req.query.date,
    });

    const slots = buildDaySlots();
    const slotChecks = await Promise.all(
      slots.map(async (slot) => ({
        slot,
        isBooked: await AppointmentService.checkSlotConflict(validated.doctorId, validated.date, slot),
      }))
    );

    const available = slotChecks.filter((item) => !item.isBooked).map((item) => item.slot);

    res.status(200).json({
      success: true,
      data: {
        doctorId: validated.doctorId,
        date: validated.date,
        slots: available,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.flatten() });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
