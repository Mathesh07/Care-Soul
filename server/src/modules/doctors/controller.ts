import { NextFunction, Request, Response } from 'express';

import { DoctorService } from './service';
import {
  createDoctorProfileSchema,
  searchDoctorsSchema,
  updateDoctorProfileSchema,
} from './validation';

export const createDoctorProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = String((req as any)?.user?.id || '');
    const payload = createDoctorProfileSchema.parse(req.body);

    const existing = await DoctorService.findByUserId(userId);
    if (existing) {
      return res.status(409).json({ message: 'Doctor profile already exists.' });
    }

    const profile = await DoctorService.createProfile(userId, payload);
    return res.status(201).json({ profile });
  } catch (err) {
    return next(err);
  }
};

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = String((req as any)?.user?.id || '');
    const profile = await DoctorService.findByUserId(userId);

    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    return next(err);
  }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await DoctorService.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    return next(err);
  }
};

export const searchDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = searchDoctorsSchema.parse(req.query);
    const result = await DoctorService.search(filters);

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = String((req as any)?.user?.id || '');
    const payload = updateDoctorProfileSchema.parse(req.body);

    const existing = await DoctorService.findByUserId(userId);
    if (!existing) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    const updated = await DoctorService.updateProfile(String((existing as any)._id), payload);
    return res.status(200).json({ profile: updated });
  } catch (err) {
    return next(err);
  }
};

export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.params.id;
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({ message: 'date query parameter is required.' });
    }

    const slots = await DoctorService.getAvailableSlots(doctorId, String(date));
    return res.status(200).json({ slots });
  } catch (err) {
    return next(err);
  }
};
