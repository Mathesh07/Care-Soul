import api from './api.js';

export const adminService = {

    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    getAllAppointments: async () => {
        const response = await api.get('/admin/appointments');
        return response.data;
    },

    verifyDoctor: async (doctorId) => {
        const response = await api.put(`/admin/verify-doctor/${doctorId}`);
        return response.data;
    },

    // Doctor verification methods
    getPendingDoctors: async () => {
        const response = await api.get('/admin/pending-doctors');
        return response.data;
    },

    getVerifiedDoctors: async () => {
        const response = await api.get('/admin/verified-doctors');
        return response.data;
    },

    approveDoctor: async (doctorId, notes = '') => {
        const response = await api.post(`/admin/doctors/${doctorId}/approve`, {
            verificationNotes: notes
        });
        return response.data;
    },

    rejectDoctor: async (doctorId, reason) => {
        const response = await api.post(`/admin/doctors/${doctorId}/reject`, {
            rejectionReason: reason
        });
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }
};