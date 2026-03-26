
import api from './api.js';


export const emergencyService = {
    

    raiseAlert : async (data) => {
        const response = await api.post('/emergency/alert',data);
        return response.data
    },

    getAllEmergencies:async () =>{
        const response = await api.get('/emergency/all');
        return response.data
    },
    respond: async (emergencyId) => {
    const response = await api.put(`/emergency/${emergencyId}/respond`);
    return response.data;
    },
}