import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
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
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true,
      example: '500mg'
    },
    frequency: {
      type: String,
      required: true,
      example: 'Twice daily'
    },
    duration: {
      type: String,
      required: true,
      example: '5 days'
    },
    instructions: {
      type: String,
      default: ''
    }
  }],
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['issued', 'viewed', 'completed', 'cancelled'],
    default: 'issued'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
