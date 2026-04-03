import express from 'express';
import { getAllDoctors, searchDoctors, getDoctorById, getDoctorSlots } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/search', searchDoctors);
router.get('/:id/slots', getDoctorSlots);
router.get('/:id', getDoctorById);

export default router;
