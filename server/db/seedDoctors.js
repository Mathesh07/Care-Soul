import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';

const doctors = [ { name: "Dr. Rajesh Kumar", specialization: "General Physician", location: "Delhi", availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"], experience: "15 years", rating: 4.5 }, { name: "Dr. Priya Sharma", specialization: "Cardiologist", location: "Mumbai", availableSlots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"], experience: "12 years", rating: 4.8 }, { name: "Dr. Amit Patel", specialization: "Pediatrician", location: "Bangalore", availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"], experience: "10 years", rating: 4.6 }, { name: "Dr. Sunita Reddy", specialization: "Gynecologist", location: "Chennai", availableSlots: ["08:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "05:00 PM"], experience: "18 years", rating: 4.9 }, { name: "Dr. Vijay Singh", specialization: "Orthopedic", location: "Kolkata", availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "05:00 PM"], experience: "20 years", rating: 4.7 }, { name: "Dr. Anjali Gupta", specialization: "Dermatologist", location: "Delhi", availableSlots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"], experience: "8 years", rating: 4.4 }, { name: "Dr. Rahul Verma", specialization: "Neurologist", location: "Mumbai", availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"], experience: "14 years", rating: 4.8 }, { name: "Dr. Meera Joshi", specialization: "General Physician", location: "Pune", availableSlots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"], experience: "11 years", rating: 4.3 } ];

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


    await Doctor.insertMany(doctors);
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