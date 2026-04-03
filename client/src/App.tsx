import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { RoleProvider } from "./components/role-provider"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import VerifyOtp from "./pages/VerifyOtp"
import DoctorDashboard from "./pages/DoctorDashboard"
import DoctorProfile from "./pages/DoctorProfile"
import Demo from "./pages/Demo"
import Dashboard from "./pages/Dashboard"
import DoctorListing from "./pages/DoctorListing"
import BookAppointment from "./pages/BookAppointment"
import MyAppointments from "./pages/MyAppointments"
import VideoConsultation from "./pages/VideoConsultation"
import EmergencyPage from "./pages/EmergencyPage"
import NotificationsPage from "./pages/NotificationsPage"
import AdminDashboard from "./pages/AdminDashboard"
import Profile from "./pages/Profile"

function LegacyPatientAppointmentRedirect() {
  const { doctorId } = useParams()
  return <Navigate to={`/patient/book-appointment/${doctorId || ""}`} replace />
}

function LegacyPatientConsultationRedirect() {
  const { appointmentId } = useParams()
  return <Navigate to={`/patient/consultation/${appointmentId || ""}`} replace />
}

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
                  <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
                  <Route path="/patient/dashboard" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient/profile" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient/book-appointment/:doctorId" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <BookAppointment />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient/my-appointments" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <MyAppointments />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient/doctors" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <DoctorListing />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient/emergency" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <EmergencyPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient/consultation/:appointmentId" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <VideoConsultation />
                    </ProtectedRoute>
                  } />
                  <Route path="/patient/notifications" element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
                  <Route path="/doctor/dashboard" element={
                    <ProtectedRoute allowedRoles={["doctor"]}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/doctor/:tab" element={
                    <ProtectedRoute allowedRoles={["doctor"]}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/doctor/profile" element={
                    <ProtectedRoute allowedRoles={["doctor"]}>
                      <DoctorProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/doctor/consultation/:appointmentId" element={
                    <ProtectedRoute allowedRoles={["doctor"]}>
                      <VideoConsultation />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  {/* Legacy route redirects */}
                  <Route path="/dashboard" element={<Navigate to="/patient/dashboard" replace />} />
                  <Route path="/profile" element={<Navigate to="/patient/profile" replace />} />
                  <Route path="/book-appointment/:doctorId" element={<LegacyPatientAppointmentRedirect />} />
                  <Route path="/my-appointments" element={<Navigate to="/patient/my-appointments" replace />} />
                  <Route path="/doctors" element={<Navigate to="/patient/doctors" replace />} />
                  <Route path="/emergency" element={<Navigate to="/patient/emergency" replace />} />
                  <Route path="/consultation/:appointmentId" element={<LegacyPatientConsultationRedirect />} />
                  <Route path="/notifications" element={<Navigate to="/patient/notifications" replace />} />
                  <Route path="/doctor-dashboard" element={<Navigate to="/doctor/dashboard" replace />} />
                  <Route path="/doctor-profile" element={<Navigate to="/doctor/profile" replace />} />
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
