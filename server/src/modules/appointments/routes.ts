import { Router } from 'express';

import { authorize, verifyAccessToken } from '../../middleware/auth';
import {
  bookAppointment,
  cancelAppointment,
  getAvailableSlots,
  getMyAppointments,
} from './controller';

const router = Router();

router.post('/', verifyAccessToken, authorize('patient'), bookAppointment);
router.get('/my', verifyAccessToken, authorize('patient', 'doctor'), getMyAppointments);
router.put('/:id/cancel', verifyAccessToken, authorize('patient', 'doctor', 'admin'), cancelAppointment);
router.get('/slots', getAvailableSlots);

export default router;
