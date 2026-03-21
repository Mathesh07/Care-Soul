import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

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
