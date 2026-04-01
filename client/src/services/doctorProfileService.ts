import api from './api';

export const doctorProfileService = {
  // Doctor Profile
  getProfile: () =>
    api.get('/doctor/profile/me').then(r => r.data),
  
  createProfile: (data) =>
    api.post('/doctor/profile', data).then(r => r.data),
  
  updateProfile: (data) =>
    api.put('/doctor/profile/me', data).then(r => r.data),

  // Appointments
  getAppointments: () =>
    api.get('/doctor/appointments').then(r => r.data),
  
  getAppointmentDetails: (appointmentId) =>
    api.get(`/doctor/appointments/${appointmentId}`).then(r => r.data),

  // Prescriptions
  createPrescription: (data) =>
    api.post('/doctor/prescriptions', data).then(r => r.data),
  
  getPrescriptions: () =>
    api.get('/doctor/prescriptions').then(r => r.data),

  // Health Records
  createHealthRecord: (data) =>
    api.post('/doctor/health-records', data).then(r => r.data),
  
  getPatientHealthRecords: (patientId) =>
    api.get(`/doctor/health-records/${patientId}`).then(r => r.data),

  // Payments
  getPayments: () =>
    api.get('/doctor/payments').then(r => r.data),

  // Appointment Reminders
  createReminder: (data) =>
    api.post('/doctor/reminders', data).then(r => r.data),

  // Dashboard
  getDashboardStats: () =>
    api.get('/doctor/dashboard/stats').then(r => r.data),
};
