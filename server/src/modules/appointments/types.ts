export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum ConsultationType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  CHAT = 'CHAT',
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IAppointment {
  _id?: string;
  patientId: string;
  doctorId: string;
  date: Date;
  timeSlot: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  symptoms: string;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  cancelReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
