import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getAppointmentDetails,
  createPrescription,
  getPrescriptions,
  createHealthRecord,
  getPatientHealthRecords,
  getPayments,
  createAppointmentReminder,
  getDoctorDashboardStats,
  updateAppointmentStatus
} from '../controllers/doctorProfileController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ========================== DOCTOR PROFILE ==========================
router.get('/profile/me', getDoctorProfile);
router.post('/profile', createDoctorProfile);
router.put('/profile/me', updateDoctorProfile);

// ========================== APPOINTMENTS ==========================
router.get('/appointments', getDoctorAppointments);
router.get('/appointments/:appointmentId', getAppointmentDetails);
router.put('/appointments/:appointmentId/status', updateAppointmentStatus);

// ========================== PRESCRIPTIONS ==========================
router.post('/prescriptions', createPrescription);
router.get('/prescriptions', getPrescriptions);

// ========================== HEALTH RECORDS ==========================
router.post('/health-records', createHealthRecord);
router.get('/health-records/:patientId', getPatientHealthRecords);

// ========================== PAYMENTS ==========================
router.get('/payments', getPayments);

// ========================== APPOINTMENT REMINDERS ==========================
router.post('/reminders', createAppointmentReminder);

// ========================== DASHBOARD ==========================
router.get('/dashboard/stats', getDoctorDashboardStats);

export default router;
