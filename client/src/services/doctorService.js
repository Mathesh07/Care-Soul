import api from './api';
export const searchDoctors = (filters = {}) =>
  api.get('/doctors/search', {params:filters}).then(r => r.data);
export const getDoctorById = (id) =>
  api.get(`/doctors/${id}`).then(r => r.data);
export const getDoctorSlots = (id, date) =>
  api.get(`/doctors/${id}/slots`,
  {params:{date}}).then(r => r.data);
export const createDoctorProfile = (data) =>
  api.post('/doctors/profile', data).then(r => r.data);
export const updateDoctorProfile = (data) =>
  api.put('/doctors/profile/me', data).then(r => r.data);
