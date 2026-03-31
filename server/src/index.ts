import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { RequestHandler } from 'express';

import authRoutesV2 from './modules/auth/routes';
import appointmentRoutesV2 from './modules/appointments/routes';
import doctorRoutes from './modules/doctors/routes';

type ESMModule<T = unknown> = { default?: T } & Record<string, unknown>;

const importEsm = new Function('modulePath', 'return import(modulePath)') as (
  modulePath: string
) => Promise<ESMModule>;

async function bootstrap(): Promise<void> {
  dotenv.config();

  const app = express();
  const PORT = process.env.PORT || 8000;

  const dbModule = await importEsm('../db/connect.js');
  const connectDB = dbModule.connectDB as (() => Promise<void>) | undefined;

  const authRoutesLegacy = (await importEsm('../routes/authRoutes.js')).default as RequestHandler;
  const doctorRoutesLegacy = (await importEsm('../routes/doctorRoutes.js')).default as RequestHandler;
  const appointmentRoutesLegacy = (await importEsm('../routes/appointmentRoutes.js'))
    .default as RequestHandler;
  const userRoutes = (await importEsm('../routes/userRoutes.js')).default as RequestHandler;
  const notificationRoutes = (await importEsm('../routes/notificationRoutes.js')).default as RequestHandler;
  const emergencyRoutes = (await importEsm('../routes/emergencyRoutes.js')).default as RequestHandler;
  const telemedicineRoutes = (await importEsm('../routes/telemedicineRoutes.js')).default as RequestHandler;
  const adminRoutes = (await importEsm('../routes/adminRoutes.js')).default as RequestHandler;

  app.use(morgan('dev'));
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Keep legacy auth routes active for existing frontend behavior.
  app.use('/api/auth', authRoutesLegacy);
  // Layer new auth routes so /refresh and new token flow are available.
  app.use('/api/auth', authRoutesV2);

  // Keep all existing API route registrations from legacy entrypoint.
  app.use('/api/doctors', doctorRoutesLegacy);
  app.use('/api/appointments', appointmentRoutesLegacy);
  // Layer the new appointments module so protected /my path uses Phase 3 middleware.
  app.use('/api/appointments', appointmentRoutesV2);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/emergency', emergencyRoutes);
  app.use('/api/telemedicine', telemedicineRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/', (_req, res) => {
    res.send('Backend is running!');
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy.' });
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (connectDB) {
      void connectDB();
    }
  });
}

void bootstrap();
