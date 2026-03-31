import mongoose, { Document, Model, Schema } from 'mongoose';
import { AppointmentStatus, ConsultationType, PaymentStatus } from './types';

export interface IAppointmentDocument extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  symptoms: string;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointmentDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    timeSlot: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
      required: true,
    },
    consultationType: {
      type: String,
      enum: Object.values(ConsultationType),
      required: true,
    },
    symptoms: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
      required: true,
    },
    paymentAmount: { type: Number, required: true, min: 0, default: 0 },
    cancelReason: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: false });

const Appointment: Model<IAppointmentDocument> =
  (mongoose.models.Appointment as Model<IAppointmentDocument>) ||
  mongoose.model<IAppointmentDocument>('Appointment', appointmentSchema);

export default Appointment;
