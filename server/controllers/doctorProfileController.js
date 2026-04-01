import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import HealthRecord from '../models/HealthRecord.js';
import Payment from '../models/Payment.js';
import AppointmentReminder from '../models/AppointmentReminder.js';
import User from '../models/User.js';

// ========================== DOCTOR PROFILE ==========================
export const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Find doctor in User model where role is doctor
    const doctor = await User.findById(doctorId);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor profile',
      error: error.message
    });
  }
};

export const createDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { specialization, yearsOfExperience, address, phone } = req.body;
    
    // Update doctor profile in User model
    const doctor = await User.findByIdAndUpdate(
      doctorId,
      {
        specialization,
        yearsOfExperience,
        address,
        phone
      },
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating doctor profile',
      error: error.message
    });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { name, specialization, yearsOfExperience, address, phone } = req.body;
    
    const doctor = await User.findByIdAndUpdate(
      doctorId,
      {
        name,
        specialization,
        yearsOfExperience,
        address,
        phone
      },
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating doctor profile',
      error: error.message
    });
  }
};

// ========================== DOCTOR APPOINTMENTS ==========================
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Verify the user is a doctor
    const doctor = await User.findById(doctorId);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Get appointments for this doctor (using user ID as doctorId in appointments)
    const appointments = await Appointment.find({ doctorId })
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1, time: -1 });
    
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

export const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user.id;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId
    })
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name specialization');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};

// ========================== PRESCRIPTIONS ==========================
export const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { appointmentId, medications, notes } = req.body;
    
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    const prescription = new Prescription({
      appointmentId,
      patientId: appointment.userId,
      doctorId,
      medications,
      notes
    });
    
    await prescription.save();
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating prescription',
      error: error.message
    });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const prescriptions = await Prescription.find({ doctorId })
      .populate('patientId', 'name email')
      .populate('appointmentId')
      .sort({ issuedAt: -1 });
    
    res.status(200).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
};

// ========================== HEALTH RECORDS ==========================
export const createHealthRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId, appointmentId, recordType, title, description, vitals, diagnosis, testResults, recommendations } = req.body;
    
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const healthRecord = new HealthRecord({
      patientId,
      doctorId,
      appointmentId,
      recordType,
      title,
      description,
      vitals,
      diagnosis,
      testResults,
      recommendations
    });
    
    await healthRecord.save();
    
    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: healthRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating health record',
      error: error.message
    });
  }
};

export const getPatientHealthRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;
    
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const healthRecords = await HealthRecord.find({
      patientId,
      doctorId
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: healthRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health records',
      error: error.message
    });
  }
};

// ========================== PAYMENTS ==========================
export const getPayments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const payments = await Payment.find({ doctorId })
      .populate('patientId', 'name email')
      .populate('appointmentId')
      .sort({ createdAt: -1 });
    
    // Calculate earnings
    const completedPayments = payments.filter(p => p.status === 'completed');
    const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        totalEarnings,
        pendingAmount,
        totalTransactions: payments.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// ========================== APPOINTMENT REMINDERS ==========================
export const createAppointmentReminder = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { appointmentId, patientId, reminderType, minutesBefore, message } = req.body;
    
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Calculate send time
    const appointmentTime = new Date(`${appointment.date}T${appointment.time}`);
    const sendAt = new Date(appointmentTime.getTime() - minutesBefore * 60 * 1000);
    
    const reminder = new AppointmentReminder({
      appointmentId,
      patientId,
      doctorId,
      reminderType,
      sendAt,
      minutesBefore,
      message
    });
    
    await reminder.save();
    
    res.status(201).json({
      success: true,
      message: 'Appointment reminder created successfully',
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating reminder',
      error: error.message
    });
  }
};

// ========================== DASHBOARD STATS ==========================
export const getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalPrescriptions,
      totalHealthRecords,
      totalPatients,
      payments
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId }),
      Appointment.countDocuments({ 
        doctorId, 
        date: { $gte: new Date().toISOString().split('T')[0] },
        status: 'Booked'
      }),
      Appointment.countDocuments({ doctorId, status: 'Completed' }),
      Prescription.countDocuments({ doctorId }),
      HealthRecord.countDocuments({ doctorId }),
      Appointment.distinct('userId', { doctorId }),
      Payment.find({ doctorId, status: 'completed' })
    ]);
    
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    
    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        totalPrescriptions,
        totalHealthRecords,
        totalPatients: totalPatients.length,
        totalEarnings,
        rating: doctor.rating || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};
