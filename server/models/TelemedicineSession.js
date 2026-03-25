import mongoose from 'mongoose';


const telemedicineSessionSchema = new mongoose.Schema({

    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },


    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },


    roomId: {
        type: String,
        required: true,
        unique: true
    },

    status: {
        type: String,
        enum: ['scheduled', 'active', 'ended'],
        default: 'scheduled'
    },

    startedAt: {
        type: Date,
        default: null
    },

    endedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

export default mongoose.model('TelemedicineSession', telemedicineSessionSchema);