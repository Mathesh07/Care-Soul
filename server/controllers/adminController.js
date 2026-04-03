
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Emergency from '../models/Emergency.js';





export const getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users, count: users.length });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('userId', 'name email phone')
            .populate('doctorId', 'name specialization location')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: appointments,
            count: appointments.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getDashboardStats = async (req, res) => {
    try {
        // Run all queries simultaneously using Promise.all (faster than one by one)
        const [
            totalUsers,
            totalDoctors,
            totalAppointments,
            activeEmergencies,
            recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            Doctor.countDocuments(),
            Appointment.countDocuments(),
            Emergency.countDocuments({ status: 'active' }),
            User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(5)
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalDoctors,
                totalAppointments,
                activeEmergencies,
                recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// VERIFY a doctor (mark them as verified in system)
// In your Doctor model, add a "isVerified" field
export const verifyDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { isVerified: true },
            { new: true } // return the updated document
        );

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        res.status(200).json({
            success: true,
            data: doctor,
            message: 'Doctor verified successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE / deactivate a user
export const deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ========================== DOCTOR VERIFICATION ENDPOINTS ==========================

// Get all pending doctor applications
export const getPendingDoctors = async (req, res) => {
    try {
        const pendingDoctors = await User.find({
            role: "doctor",
            isEmailVerified: true,
            isDocterVerifiedByAdmin: false,
            accountStatus: "pending_admin_verification"
        }).select("-passwordHash");

        res.status(200).json({
            success: true,
            data: pendingDoctors,
            count: pendingDoctors.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all verified doctors
export const getVerifiedDoctors = async (req, res) => {
    try {
        const verifiedDoctors = await User.find({
            role: "doctor",
            isDocterVerifiedByAdmin: true,
            accountStatus: "active"
        }).select("-passwordHash");

        res.status(200).json({
            success: true,
            data: verifiedDoctors,
            count: verifiedDoctors.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Approve a doctor application
export const verifyDoctorApplication = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { verificationNotes } = req.body;

        const doctor = await User.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        if (doctor.role !== "doctor") {
            return res.status(400).json({ success: false, message: "User is not a doctor" });
        }

        // Create Doctor document in Doctor collection
        const Doctor = require("../models/Doctor.js").default;
        
        // Check if Doctor document already exists
        const existingDoctorDoc = await Doctor.findOne({ userId: doctor._id });
        
        if (!existingDoctorDoc) {
            // Create new Doctor document
            const newDoctor = new Doctor({
                userId: doctor._id,
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialization,
                experience: doctor.yearsOfExperience?.toString() || "",
                location: doctor.address || "Not specified",
                isVerified: true
            });
            
            await newDoctor.save();
        } else {
            // Update existing Doctor document to be verified
            existingDoctorDoc.isVerified = true;
            await existingDoctorDoc.save();
        }

        // Update doctor verification status in User collection
        doctor.isDocterVerifiedByAdmin = true;
        doctor.doctorVerifiedByAdminDate = new Date();
        doctor.accountStatus = "active";
        if (verificationNotes) {
            doctor.verificationNotes = verificationNotes;
        }

        await doctor.save();

        // Send approval email
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Care-Soul Team" <${process.env.EMAIL_USER}>`,
            to: doctor.email,
            subject: "🎉 Your Doctor Account Has Been Verified",
            text: `Hi ${doctor.name},\n\nGreat news! Your doctor account on Care-Soul has been verified and approved by our admin team.\n\nYou can now:\n- Log in to your doctor portal\n- Manage appointments\n- View patient health records\n- Upload prescriptions\n- Track earnings\n\nWelcome to Care-Soul!\n\nBest regards,\n- Care-Soul Team`
        });

        res.status(200).json({
            success: true,
            message: "Doctor verified successfully",
            data: doctor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject a doctor application
export const rejectDoctorApplication = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({ success: false, message: "Rejection reason is required" });
        }

        const doctor = await User.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        if (doctor.role !== "doctor") {
            return res.status(400).json({ success: false, message: "User is not a doctor" });
        }

        // Update doctor rejection status
        doctor.isDocterVerifiedByAdmin = false;
        doctor.accountStatus = "rejected";
        doctor.verificationNotes = rejectionReason;

        await doctor.save();

        // Send rejection email
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Care-Soul Team" <${process.env.EMAIL_USER}>`,
            to: doctor.email,
            subject: "Update on Your Doctor Application",
            text: `Hi ${doctor.name},\n\nThank you for applying to join Care-Soul as a doctor. After careful review, we are unable to approve your application at this time.\n\nReason: ${rejectionReason}\n\nIf you believe this is a mistake or would like to reapply, please contact us at support@caresoul.com\n\nBest regards,\n- Care-Soul Team`
        });

        res.status(200).json({
            success: true,
            message: "Doctor application rejected",
            data: doctor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};