import api from './api';
export const bookAppointment = (data) =>
  api.post('/appointments', data).then(r => r.data);
export const createAppointment = (data) =>
  bookAppointment(data);
export const getMyAppointments = (filters = {}) =>
  api.get('/appointments/my', {params:filters}).then(r => r.data);
export const cancelAppointment = (id, reason) =>
  api.put(`/appointments/${id}/cancel`,
  {cancelReason: reason}).then(r => r.data);
export const getAvailableSlots = (doctorId, date) =>
  api.get('/appointments/slots',
  {params:{doctorId,date}}).then(r => r.data);

export const appointmentService = {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getAvailableSlots,
  bookAppointment
};
