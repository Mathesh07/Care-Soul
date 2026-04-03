import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';

const normalizeTimeSlot = (slot) => {
  if (!slot) return '';
  const trimmed = String(slot).trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();
  const normalizedHour = period === 'PM'
    ? (hour === 12 ? 12 : hour + 12)
    : (hour === 12 ? 0 : hour);
  return `${String(normalizedHour).padStart(2, '0')}:${minute}`;
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;
    const userId = req.user.id;

    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, date, and time are required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: 'Cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const appointment = new Appointment({
      userId,
      doctorId,
      date,
      time,
      notes: notes || ''
    });

    await appointment.save();
    await appointment.populate('doctorId', 'name specialization location');

    if (doctor && doctor.userId) {
      await Notification.create({
        receiverId: doctor.userId,
        senderId: userId,
        title: 'New Appointment',
        message: `A new appointment was requested for ${date} at ${time}.`,
        type: 'appointment',
        relatedId: appointment._id,
        onModel: 'Appointment',
        isRead: false
      });
    }

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error booking appointment',
      error: error.message
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await Appointment.find({ userId })
      .populate('doctorId', 'name specialization location')
      .sort({ date: -1, time: -1 });

    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a => a.date === today && a.status === 'Booked');

    for (const apt of todaysAppointments) {
      if (apt.doctorId && apt.doctorId._id) {
        const existing = await Notification.findOne({
          receiverId: userId,
          relatedId: apt._id,
          type: 'appointment_reminder'
        });
        if (!existing) {
          await Notification.create({
            receiverId: userId,
            senderId: apt.doctorId._id,
            title: 'Appointment Today',
            message: `Reminder: You have an appointment with Dr. ${apt.doctorId.name} today at ${apt.time}.`,
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

export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;

    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own appointments'
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    const doctorUser = await Doctor.findById(appointment.doctorId);
    if (doctorUser && doctorUser.userId) {
      await Notification.create({
        receiverId: doctorUser.userId,
        senderId: userId,
        title: 'Appointment Cancelled',
        message: `A patient has cancelled their appointment on ${appointment.date} at ${appointment.time}.`,
        type: 'appointment',
        relatedId: appointment._id,
        onModel: 'Appointment',
        isRead: false
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'name specialization location');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own appointments'
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

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const existingAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $ne: 'Cancelled' }
    }).select('time');

    const bookedSlots = new Set(
      existingAppointments
        .map((apt) => normalizeTimeSlot(apt.time))
        .filter(Boolean)
    );

    const availableSlots = (doctor.availableSlots || []).filter((slot) => {
      const normalized = normalizeTimeSlot(slot);
      if (!normalized) return true;
      return !bookedSlots.has(normalized);
    });

    res.status(200).json({
      success: true,
      data: {
        doctorId,
        date,
        slots: availableSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
};
