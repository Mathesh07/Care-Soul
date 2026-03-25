import express from 'express';
import { raiseEmergency, getAllEmergencies, respondToEmergency } from '../controllers/emergencyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// POST /api/emergency/alert  → patient raises emergency
router.post('/alert', raiseEmergency);

// GET /api/emergency/all  → admin sees all emergencies
router.get('/all', getAllEmergencies);

// PUT /api/emergency/:id/respond  → admin responds
router.put('/:id/respond', respondToEmergency);

export default router;