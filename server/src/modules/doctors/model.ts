import mongoose, { Schema } from 'mongoose';
import { IDoctor } from './types';

const TimeSlotSchema = new Schema(
  {
    start: { type: String, required: true, trim: true },
    end: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const DayScheduleSchema = new Schema(
  {
    isWorking: { type: Boolean, default: false },
    slots: { type: [TimeSlotSchema], default: [] },
  },
  { _id: false }
);

const WeeklyScheduleSchema = new Schema(
  {
    monday: { type: DayScheduleSchema, required: true },
    tuesday: { type: DayScheduleSchema, required: true },
    wednesday: { type: DayScheduleSchema, required: true },
    thursday: { type: DayScheduleSchema, required: true },
    friday: { type: DayScheduleSchema, required: true },
    saturday: { type: DayScheduleSchema, required: true },
    sunday: { type: DayScheduleSchema, required: true },
  },
  { _id: false }
);

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    qualifications: {
      type: [String],
      required: true,
      default: [],
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    languages: {
      type: [String],
      required: true,
      default: [],
    },
    weeklySchedule: {
      type: WeeklyScheduleSchema,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalConsultations: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailableNow: {
      type: Boolean,
      default: false,
      index: true,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Doctor =
  mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);

export default Doctor;
