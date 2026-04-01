

import mongoose from 'mongoose';


const emergencySchema = new mongoose.Schema({

    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    },

    location: {
        type: String,
        default: 'Unknown Location',
    },

    latitude: {
        type: Number,
        default: null,
    },

    longitude: {
        type: Number,
        default: null,
    },

    status: {
        type: String,
        enum: ['active', 'responded', 'resolved'],
        default: 'active',
    },


    description: {
        type: String,
        default: 'Emergency assistance needed'
    },

    
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

},{timestamps : true},);

export default mongoose.model('Emergency',emergencySchema);