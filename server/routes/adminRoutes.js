import express from 'express';

import {
    getAllUsers,
    getAllAppointments,
    getDashboardStats,
    verifyDoctor,
    deactivateUser
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

// PUT /api/admin/verify-doctor/:doctorId
router.put('/verify-doctor/:doctorId', verifyDoctor);

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', deactivateUser);

export default router;