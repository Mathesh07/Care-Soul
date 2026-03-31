import { Router } from 'express';

import { authorize, verifyAccessToken } from '../../middleware/auth';
import {
  createDoctorProfile,
  getAvailableSlots,
  getDoctorById,
  getMyProfile,
  searchDoctors,
  updateMyProfile,
} from './controller';

const router = Router();

// Public routes
router.get('/search', searchDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getAvailableSlots);

// Doctor-only routes
router.post('/profile', verifyAccessToken, authorize('doctor'), createDoctorProfile);
router.get('/profile/me', verifyAccessToken, authorize('doctor'), getMyProfile);
router.put('/profile/me', verifyAccessToken, authorize('doctor'), updateMyProfile);

export default router;
