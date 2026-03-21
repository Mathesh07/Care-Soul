# CARE SOUL - Healthcare Platform

A full-stack MERN healthcare platform focusing on User Authentication, Doctor Search, and Appointment Booking.

## Features Implemented

### Backend (Node.js + Express + MongoDB)
- **User Authentication & Profile Management**
  - JWT-based authentication
  - User registration and login
  - Profile management (name, phone)
  - Password hashing with bcrypt

- **Doctor Management**
  - Doctor model with specialization, location, available slots
  - Search and filter doctors by location and specialization
  - Dummy data seeding with 8 doctors

- **Appointment System**
  - Book appointments with doctors
  - View user appointments
  - Cancel appointments
  - Status tracking (Booked, Cancelled, Completed)

### Frontend (React + Tailwind CSS)
- **Authentication Pages**
  - Login page with form validation
  - Registration page with password confirmation
  - Protected routes with authentication context

- **User Dashboard**
  - Profile management
  - Quick stats
  - Recent appointments overview
  - Navigation to main features

- **Doctor Listing**
  - Search doctors by location and specialization
  - Doctor cards with ratings and available slots
  - Responsive design with Tailwind CSS

- **Appointment Booking**
  - Select date and time slots
  - Add notes for appointment
  - Form validation and error handling

- **My Appointments**
  - View all user appointments
  - Cancel appointments
  - Status-based actions
  - Book again functionality

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables

### Frontend
- **React** - UI library with functional components and hooks
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Project Structure

```
CARE-SOUL-TEAM/
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── db/
│   │   ├── connect.js
│   │   └── seedDoctors.js
│   └── index.js
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DoctorListing.tsx
│   │   │   ├── BookAppointment.tsx
│   │   │   └── MyAppointments.tsx
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── doctorService.js
│   │   │   ├── appointmentService.js
│   │   │   └── userService.js
│   │   └── App.tsx
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js installed on your system
- MongoDB installed and running
- Git for version control

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```
   MONGODB_URI=mongodb://localhost:2707/caresoul
   JWT_SECRET=your_jwt_secret_key_here
   PORT=8000
   ```

4. **Seed the database with doctors**
   ```bash
   node db/seedDoctors.js
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   
   Server will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173` (or similar Vite port)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/search?location=&specialization=` - Search doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/my` - Get user appointments
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `GET /api/appointments/:id` - Get appointment by ID

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Usage

1. **Register a new account** or login with existing credentials
2. **Navigate to Dashboard** to view profile and quick stats
3. **Find Doctors** using the search and filter functionality
4. **Book Appointments** by selecting doctor, date, and time
5. **Manage Appointments** from the My Appointments page

## Features for Future Enhancement

- Email verification for user registration
- Doctor profile management
- Appointment reminders
- Payment integration
- Video consultation integration
- Prescription management
- Health records
- Multi-language support

## Contributing

This codebase is designed to be modular and easily extensible. The structure allows for easy integration of additional modules like:
- Pharmacy management
- Lab tests
- Emergency services
- Health insurance integration

## License

This project is for educational purposes and demonstration of MERN stack capabilities.
