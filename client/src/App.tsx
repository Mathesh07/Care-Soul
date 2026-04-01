import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { RoleProvider } from "./components/role-provider"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import VerifyOtp from "./pages/VerifyOtp"
import PatientPortal from "./pages/PatientPortal"
import DoctorDashboard from "./pages/DoctorDashboard"
import Demo from "./pages/Demo"
import Dashboard from "./pages/Dashboard"
import DoctorListing from "./pages/DoctorListing"
import BookAppointment from "./pages/BookAppointment"
import MyAppointments from "./pages/MyAppointments"
import VideoConsultation from "./pages/VideoConsultation"
import EmergencyPage from "./pages/EmergencyPage"
import NotificationsPage from "./pages/NotificationsPage"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RoleProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/demo" element={<Demo />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/doctor-dashboard" element={
                    <ProtectedRoute>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/book-appointment/:doctorId" element={
                    <ProtectedRoute>
                      <BookAppointment />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-appointments" element={
                    <ProtectedRoute>
                      <MyAppointments />
                    </ProtectedRoute>
                  } />
                  <Route path="/doctors" element={
                    <ProtectedRoute>
                      <DoctorListing />
                    </ProtectedRoute>
                  } />
                  <Route path="/emergency" element={
                    <ProtectedRoute>
                      <EmergencyPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/consultation/:appointmentId" element={
                    <ProtectedRoute>
                      <VideoConsultation />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient-portal" element={
                    <ProtectedRoute>
                      <PatientPortal />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </RoleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
