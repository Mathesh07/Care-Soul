import express from "express"
import cors from "cors"
import morgan from "morgan";
import dotenv from "dotenv";


import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import telemedicineRoutes from './routes/telemedicineRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import {connectDB} from './db/connect.js';

dotenv.config();

const app = express();
const PORT = 8000;


app.use(morgan("dev"));
app.use(cors("*"));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/telemedicine', telemedicineRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});


