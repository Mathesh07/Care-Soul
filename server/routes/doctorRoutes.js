import express from 'express';
import { getAllDoctors, searchDoctors, getDoctorById } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/search', searchDoctors);
router.get('/:id', getDoctorById);

export default router;
