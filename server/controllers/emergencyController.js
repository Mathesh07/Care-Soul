import Emergency from "../models/Emergency.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendEmergencyEmail } from "../services/emailService.js";


export const raiseEmergency = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { location, latitude, longitude, description } = req.body;

        // Get patient details including emergency email
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const emergency = new Emergency({
            patientId,
            location: location || "Unknown",
            latitude: latitude || null,
            longitude: longitude || null,
            description: description || "Emergency assistance needed",
            status: "active",
        });

        await emergency.save();

        const admins = await User.find({ role: 'admin' });

        const notificationPromises = admins.map(admin => {
            return new Notification({
                receiverId: admin._id,
                type: 'emergency',
                title: '🚨 Emergency Alert!',
                message: `Patient needs immediate help.Location : ${location || 'Unknown'}`,
                relatedId: emergency._id
            }).save();
        });

        await Promise.all(notificationPromises);

        // Send email to emergency contact if configured
        let emailSent = false;
        if (patient.emergencyEmail) {
            const emailResult = await sendEmergencyEmail(
                patient.emergencyEmail,
                patient.name,
                location,
                description,
                emergency.createdAt
            );
            emailSent = emailResult.success;
        }

        res.status(201).json({
            success: true,
            data: emergency,
            emailSent,
            message: emailSent 
                ? 'Emergency alert raised. Help is on the way. Emergency contact notified.'
                : 'Emergency alert raised. Help is on the way.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getAllEmergencies = async (req,res) =>{
    try{
        const emergencies = await Emergency.find()
        .populate('patientId','name email phone')
        .populate('respondedBy','name email')
        .sort({createdAt : -1})

        res.status(200).json({success:true, data : emergencies});

    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


export const respondToEmergency = async (req,res) =>{
    try{

        const {id} = req.params;
        const adminId = req.user.id;

        const emergency = await Emergency.findById(id);

        if(!emergency){
            return res.status(404).json({
                success:false,
                message : 'Emergency not found'
            });
        }

        emergency.status = 'responded';
        emergency.respondedBy = adminId;
        await emergency.save();

        await new Notification({
            receiverId : emergency.patientId,
            type : 'emergency',
            title : '✅ Help is on the way',
            message : 'Your emergency has been received. Someone will contact you shortly.',
            relatedId : emergency._id
        }).save()
        res.status(200).json({ success: true, data: emergency });

    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}