    import express from 'express';
import { createSession, joinSession, getSessionByAppointment } from '../controllers/telemedicineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// POST /api/telemedicine/create-session
router.post('/create-session', createSession);

// GET /api/telemedicine/join/:roomId
router.get('/join/:roomId', joinSession);

// GET /api/telemedicine/appointment/:appointmentId
router.get('/appointment/:appointmentId', getSessionByAppointment);

export default router;