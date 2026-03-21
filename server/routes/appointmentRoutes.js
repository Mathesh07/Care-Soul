import express from 'express';
import { createAppointment, getMyAppointments, cancelAppointment, getAppointmentById } from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createAppointment);
router.get('/my', getMyAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);

export default router;
