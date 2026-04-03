import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import HealthRecord from '../models/HealthRecord.js';
import Payment from '../models/Payment.js';
import AppointmentReminder from '../models/AppointmentReminder.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';

const buildExperienceLabel = (years) => {
  if (typeof years === 'number' && !Number.isNaN(years)) {
    return `${years} years`;
  }
  if (typeof years === 'string') {
    return years;
  }
  return '';
};

const getDoctorContext = async (userId) => {
  const user = await User.findById(userId);

  if (!user || user.role !== 'doctor') {
    return { error: { status: 404, message: 'Doctor profile not found' } };
  }

  let doctor = await Doctor.findOne({ userId: user._id });

  if (!doctor) {
    const location = user.address || 'Unknown';
    const experience = buildExperienceLabel(user.yearsOfExperience) || '';
    const specialization = user.specialization || 'General';
    const phone = user.phone || '';

    doctor = await Doctor.create({
      userId: user._id,
      name: user.name,
      specialization,
      location,
      email: user.email,
      phone,
      experience,
      isVerified: user.isDocterVerifiedByAdmin === true
    });
  }

  return { user, doctor };
};

// ========================== DOCTOR PROFILE ==========================
export const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const context = await getDoctorContext(doctorId);

    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { user, doctor } = context;

    res.status(200).json({
      success: true,
      data: {
        ...doctor.toObject(),
        name: doctor.name || user.name,
        email: doctor.email || user.email,
        phone: doctor.phone || user.phone,
        specialization: doctor.specialization || user.specialization,
        location: doctor.location || user.address,
        accountStatus: user.accountStatus,
        role: user.role
      }
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
    const { name, specialization, yearsOfExperience, address, phone, location, availableSlots, experience, bio } = req.body;

    const user = await User.findById(doctorId);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const nextExperience = experience || buildExperienceLabel(yearsOfExperience) || user.yearsOfExperience;
    const nextLocation = location || address || user.address || 'Unknown';
    const nextName = name || user.name;
    const nextSpecialization = specialization || user.specialization || 'General';
    const nextPhone = phone || user.phone || '';

    const doctorUpdate = {
      userId: user._id,
      name: nextName,
      specialization: nextSpecialization,
      location: nextLocation,
      email: user.email,
      phone: nextPhone,
      experience: typeof nextExperience === 'number' ? buildExperienceLabel(nextExperience) : nextExperience,
      isVerified: user.isDocterVerifiedByAdmin === true
    };

    if (Array.isArray(availableSlots)) {
      doctorUpdate.availableSlots = availableSlots;
    }

    if (typeof bio === 'string') {
      doctorUpdate.bio = bio;
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: user._id },
      doctorUpdate,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (specialization) userUpdate.specialization = specialization;
    if (typeof yearsOfExperience === 'number') userUpdate.yearsOfExperience = yearsOfExperience;
    if (address) userUpdate.address = address;
    if (phone) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(user._id, userUpdate);
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
    const { name, specialization, yearsOfExperience, address, phone, location, availableSlots, experience, bio } = req.body;

    const user = await User.findById(doctorId);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const doctorUpdate = {
      email: user.email,
      isVerified: user.isDocterVerifiedByAdmin === true
    };

    if (name) doctorUpdate.name = name;
    if (specialization) doctorUpdate.specialization = specialization;
    if (location || address) doctorUpdate.location = location || address;
    if (phone) doctorUpdate.phone = phone;
    if (typeof yearsOfExperience === 'number') {
      doctorUpdate.experience = buildExperienceLabel(yearsOfExperience);
    } else if (experience) {
      doctorUpdate.experience = experience;
    }
    if (Array.isArray(availableSlots)) doctorUpdate.availableSlots = availableSlots;
    if (typeof bio === 'string') doctorUpdate.bio = bio;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: user._id },
      doctorUpdate,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (specialization) userUpdate.specialization = specialization;
    if (typeof yearsOfExperience === 'number') userUpdate.yearsOfExperience = yearsOfExperience;
    if (address) userUpdate.address = address;
    if (phone) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(user._id, userUpdate);
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
    const context = await getDoctorContext(doctorId);

    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;

    // Get appointments for this doctor
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1, time: -1 });

    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a => a.date === today && a.status === 'Booked');

    for (const apt of todaysAppointments) {
      if (apt.userId && apt.userId._id) {
        const existing = await Notification.findOne({
          receiverId: doctor.userId,
          relatedId: apt._id,
          type: 'appointment_reminder'
        });
        if (!existing) {
          await Notification.create({
            receiverId: doctor.userId,
            senderId: apt.userId._id,
            title: 'Appointment Today',
            message: `Reminder: You have an appointment with patient ${apt.userId.name || 'Unknown'} today at ${apt.time}.`,
            type: 'appointment_reminder',
            relatedId: apt._id,
            onModel: 'Appointment',
            isRead: false
          });
        }
      }
    }
    
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
    const context = await getDoctorContext(doctorId);

    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id
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

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const doctorId = req.user.id;
    const context = await getDoctorContext(doctorId);

    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;

    if (!['Pending', 'Booked', 'Cancelled', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id
    }).populate('doctorId', 'name specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    await appointment.save();

    // Create a Notification if logic dictates
    let title = '';
    let message = '';
    if (status === 'Booked') {
      title = 'Appointment Accepted';
      message = `Your appointment with Dr. ${appointment.doctorId.name} on ${appointment.date} at ${appointment.time} has been accepted.`;
    } else if (status === 'Rejected') {
      title = 'Appointment Rejected';
      message = `Your appointment with Dr. ${appointment.doctorId.name} on ${appointment.date} at ${appointment.time} was rejected. Please select a different time or doctor.`;
    }

    if (title) {
      await Notification.create({
        receiverId: appointment.userId,
        senderId: doctor._id,
        title,
        message,
        type: 'appointment',
        isRead: false
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message
    });
  }
};

// ========================== PRESCRIPTIONS ==========================
export const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { appointmentId, medications, notes } = req.body;

    const context = await getDoctorContext(doctorId);
    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create prescriptions for your own appointments'
      });
    }
    
    const prescription = new Prescription({
      appointmentId,
      patientId: appointment.userId,
      doctorId: doctor._id,
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
    const context = await getDoctorContext(doctorId);

    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
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

    const context = await getDoctorContext(doctorId);
    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;
    
    const healthRecord = new HealthRecord({
      patientId,
      doctorId: doctor._id,
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
    const context = await getDoctorContext(doctorId);

    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;

    const healthRecords = await HealthRecord.find({
      patientId,
      doctorId: doctor._id
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
    const context = await getDoctorContext(doctorId);

    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;

    const payments = await Payment.find({ doctorId: doctor._id })
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

    const context = await getDoctorContext(doctorId);
    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create reminders for your own appointments'
      });
    }
    
    // Calculate send time
    const appointmentTime = new Date(`${appointment.date}T${appointment.time}`);
    const sendAt = new Date(appointmentTime.getTime() - minutesBefore * 60 * 1000);
    
    const reminder = new AppointmentReminder({
      appointmentId,
      patientId,
      doctorId: doctor._id,
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
    const context = await getDoctorContext(doctorId);

    if (context.error) {
      return res.status(context.error.status).json({
        success: false,
        message: context.error.message
      });
    }

    const { doctor } = context;

    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalPrescriptions,
      totalHealthRecords,
      totalPatients,
      payments
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId: doctor._id }),
      Appointment.countDocuments({ 
        doctorId: doctor._id, 
        date: { $gte: new Date().toISOString().split('T')[0] },
        status: 'Booked'
      }),
      Appointment.countDocuments({ doctorId: doctor._id, status: 'Completed' }),
      Prescription.countDocuments({ doctorId: doctor._id }),
      HealthRecord.countDocuments({ doctorId: doctor._id }),
      Appointment.distinct('userId', { doctorId: doctor._id }),
      Payment.find({ doctorId: doctor._id, status: 'completed' })
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
