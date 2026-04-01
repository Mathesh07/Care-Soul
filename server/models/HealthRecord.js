import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  recordType: {
    type: String,
    enum: ['consultation_notes', 'lab_report', 'medical_test', 'diagnosis', 'follow_up'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  vitals: {
    bloodPressure: {
      type: String,
      default: ''
    },
    heartRate: {
      type: String,
      default: ''
    },
    temperature: {
      type: String,
      default: ''
    },
    weight: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: ''
    }
  },
  diagnosis: {
    type: String,
    default: ''
  },
  testResults: {
    type: String,
    default: ''
  },
  recommendations: {
    type: String,
    default: ''
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, { timestamps: true });

export default mongoose.models.HealthRecord || mongoose.model('HealthRecord', healthRecordSchema);
