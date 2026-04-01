import express from 'express';

import {
    getAllUsers,
    getAllAppointments,
    getDashboardStats,
    verifyDoctor,
    deactivateUser,
    getPendingDoctors,
    getVerifiedDoctors,
    verifyDoctorApplication,
    rejectDoctorApplication
} from '../controllers/adminController.js';

import {protect} from '../middleware/authMiddleware.js';
import {isAdmin} from '../middleware/adminMiddleware.js';


const router = express.Router();
router.use(protect);
router.use(isAdmin);

// GET /api/admin/stats
router.get('/stats', getDashboardStats);

// GET /api/admin/users
router.get('/users', getAllUsers);

// GET /api/admin/appointments
router.get('/appointments', getAllAppointments);

// PUT /api/admin/verify-doctor/:doctorId (old endpoint - keeping for backwards compatibility)
router.put('/verify-doctor/:doctorId', verifyDoctor);

// ========================== DOCTOR VERIFICATION ENDPOINTS ==========================

// GET /api/admin/pending-doctors - Get all doctors awaiting verification
router.get('/pending-doctors', getPendingDoctors);

// GET /api/admin/verified-doctors - Get all verified doctors
router.get('/verified-doctors', getVerifiedDoctors);

// POST /api/admin/doctors/:doctorId/approve - Approve a doctor application
router.post('/doctors/:doctorId/approve', verifyDoctorApplication);

// POST /api/admin/doctors/:doctorId/reject - Reject a doctor application
router.post('/doctors/:doctorId/reject', rejectDoctorApplication);

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', deactivateUser);

export default router;