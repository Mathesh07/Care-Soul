import api from './api.js';

export const doctorService = {
  getAllDoctors: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },

  searchDoctors: async (searchParams) => {
    const params = new URLSearchParams();
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.specialization) params.append('specialization', searchParams.specialization);
    
    const response = await api.get(`/doctors/search?${params}`);
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  }
};
