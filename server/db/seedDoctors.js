import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

const doctors = [
  {
    name: "Dr. Rajesh Kumar",
    specialization: "General Physician",
    location: "Delhi",
    email: "rajesh.kumar@care-soul.example",
    phone: "+91-9000000001",
    availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    experience: "15 years",
    rating: 4.5,
  },
  {
    name: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    location: "Mumbai",
    email: "priya.sharma@care-soul.example",
    phone: "+91-9000000002",
    availableSlots: ["08:00", "09:00", "10:00", "11:00", "15:00", "16:00"],
    experience: "12 years",
    rating: 4.8,
  },
  {
    name: "Dr. Amit Patel",
    specialization: "Pediatrician",
    location: "Bangalore",
    email: "amit.patel@care-soul.example",
    phone: "+91-9000000003",
    availableSlots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
    experience: "10 years",
    rating: 4.6,
  },
  {
    name: "Dr. Sunita Reddy",
    specialization: "Gynecologist",
    location: "Chennai",
    email: "sunita.reddy@care-soul.example",
    phone: "+91-9000000004",
    availableSlots: ["08:00", "10:00", "11:00", "14:00", "15:00", "17:00"],
    experience: "18 years",
    rating: 4.9,
  },
  {
    name: "Dr. Vijay Singh",
    specialization: "Orthopedic",
    location: "Kolkata",
    email: "vijay.singh@care-soul.example",
    phone: "+91-9000000005",
    availableSlots: ["09:00", "10:00", "11:00", "14:00", "16:00", "17:00"],
    experience: "20 years",
    rating: 4.7,
  },
  {
    name: "Dr. Anjali Gupta",
    specialization: "Dermatologist",
    location: "Delhi",
    email: "anjali.gupta@care-soul.example",
    phone: "+91-9000000006",
    availableSlots: ["08:00", "09:00", "10:00", "11:00", "15:00", "16:00"],
    experience: "8 years",
    rating: 4.4,
  },
  {
    name: "Dr. Rahul Verma",
    specialization: "Neurologist",
    location: "Mumbai",
    email: "rahul.verma@care-soul.example",
    phone: "+91-9000000007",
    availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    experience: "14 years",
    rating: 4.8,
  },
  {
    name: "Dr. Meera Joshi",
    specialization: "General Physician",
    location: "Pune",
    email: "meera.joshi@care-soul.example",
    phone: "+91-9000000008",
    availableSlots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
    experience: "11 years",
    rating: 4.3,
  },
];

const seedDoctors = async () => {
  try {
    const MONGO_URI = process.env.MONGO_DB_URI;

    if (!MONGO_URI) {
      console.error("MONGO_DB_URI is not defined");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");


    const emails = doctors.map((doc) => doc.email);

    await Doctor.deleteMany({ email: { $in: emails } });
    await User.deleteMany({ email: { $in: emails } });

    const passwordHash = await bcrypt.hash("Doctor@123", 10);

    const createdUsers = await User.insertMany(
      doctors.map((doc) => ({
        name: doc.name,
        email: doc.email,
        passwordHash,
        role: "doctor",
        phone: doc.phone,
        specialization: doc.specialization,
        yearsOfExperience: Number(String(doc.experience || "0").replace(/\D/g, "")) || 0,
        address: doc.location,
        isEmailVerified: true,
        accountStatus: "active",
        isDocterVerifiedByAdmin: true,
        doctorVerificationRequestDate: new Date(),
        doctorVerifiedByAdminDate: new Date(),
      }))
    );

    const doctorDocs = doctors.map((doc) => {
      const user = createdUsers.find((u) => u.email === doc.email);
      return {
        userId: user?._id,
        name: doc.name,
        specialization: doc.specialization,
        location: doc.location,
        email: doc.email,
        phone: doc.phone,
        availableSlots: doc.availableSlots,
        experience: doc.experience,
        rating: doc.rating,
        isVerified: true,
      };
    });

    await Doctor.insertMany(doctorDocs);
    console.log('Doctors seeded successfully');

    console.log('Available doctors:');
    doctors.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name} - ${doc.specialization} - ${doc.location}`);
    });

    await mongoose.connection.close();

  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();