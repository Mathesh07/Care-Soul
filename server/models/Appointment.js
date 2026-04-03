import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v); // YYYY-MM-DD format
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{2}:\d{2}$/.test(v); // HH:MM format
      },
      message: 'Time must be in HH:MM format'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Booked', 'Cancelled', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
