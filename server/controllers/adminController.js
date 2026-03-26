
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Emergency from '../models/Emergency.js';





export const getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select('-password').sort({ createdAt: -1 });
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
            User.find().select('-password').sort({ createdAt: -1 }).limit(5)
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