import Appointment, { IAppointmentDocument } from './model';
import { AppointmentStatus, ConsultationType } from './types';

export interface AppointmentFilters {
  status?: AppointmentStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  date: Date;
  timeSlot: string;
  consultationType: ConsultationType;
  symptoms: string;
  notes?: string;
  paymentAmount?: number;
}

function buildFilters(base: Record<string, unknown>, filters?: AppointmentFilters) {
  const query: Record<string, unknown> = { ...base };

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.fromDate || filters?.toDate) {
    query.date = {};

    if (filters.fromDate) {
      (query.date as Record<string, Date>).$gte = filters.fromDate;
    }

    if (filters.toDate) {
      (query.date as Record<string, Date>).$lte = filters.toDate;
    }
  }

  return query;
}

export class AppointmentService {
  static async create(data: CreateAppointmentInput): Promise<IAppointmentDocument> {
    return Appointment.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: data.date,
      timeSlot: data.timeSlot,
      consultationType: data.consultationType,
      symptoms: data.symptoms,
      notes: data.notes,
      paymentStatus: 'pending',
      paymentAmount: data.paymentAmount || 0,
      status: AppointmentStatus.PENDING,
    });
  }

  static async findById(id: string): Promise<IAppointmentDocument | null> {
    return Appointment.findById(id).exec();
  }

  static async findByPatient(
    patientId: string,
    filters?: AppointmentFilters
  ): Promise<IAppointmentDocument[]> {
    const query = buildFilters({ patientId }, filters);
    return Appointment.find(query).sort({ date: -1, createdAt: -1 }).exec();
  }

  static async findByDoctor(
    doctorId: string,
    filters?: AppointmentFilters
  ): Promise<IAppointmentDocument[]> {
    const query = buildFilters({ doctorId }, filters);
    return Appointment.find(query).sort({ date: -1, createdAt: -1 }).exec();
  }

  static async updateStatus(
    id: string,
    status: AppointmentStatus,
    reason?: string
  ): Promise<IAppointmentDocument> {
    const updated = await Appointment.findByIdAndUpdate(
      id,
      {
        status,
        ...(reason ? { cancelReason: reason } : {}),
      },
      { new: true }
    ).exec();

    if (!updated) {
      throw new Error('Appointment not found.');
    }

    return updated;
  }

  static async checkSlotConflict(doctorId: string, date: Date, timeSlot: string): Promise<boolean> {
    const conflict = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
    }).exec();

    return Boolean(conflict);
  }
}
