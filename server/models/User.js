import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
    },
    emergencyEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ['pending_verification', 'pending_admin_verification', 'active', 'suspended', 'rejected'],
      default: 'pending_verification',
    },
    // Doctor-specific fields
    specialization: {
      type: String,
      default: '',
      description: 'Doctor specialization'
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      description: 'Years of experience for doctors'
    },
    address: {
      type: String,
      default: '',
      description: 'Clinic/Hospital address for doctors'
    },
    isDocterVerifiedByAdmin: {
      type: Boolean,
      default: false,
      description: 'Only applicable when role is doctor'
    },
    doctorVerificationRequestDate: {
      type: Date,
      default: null,
    },
    doctorVerifiedByAdminDate: {
      type: Date,
      default: null,
    },
    verificationNotes: {
      type: String,
      default: '',
      description: 'Notes from admin regarding doctor verification'
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
