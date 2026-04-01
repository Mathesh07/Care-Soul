import mongoose from 'mongoose';

const appointmentReminderSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  reminderType: {
    type: String,
    enum: ['email', 'sms', 'in_app'],
    default: 'email'
  },
  sendAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed'],
    default: 'scheduled'
  },
  message: {
    type: String,
    default: ''
  },
  sentAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: ''
  },
  minutesBefore: {
    type: Number,
    default: 60,
    description: 'Send reminder X minutes before appointment'
  }
}, { timestamps: true });

export default mongoose.models.AppointmentReminder || mongoose.model('AppointmentReminder', appointmentReminderSchema);
