import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { RoleProvider } from "./components/role-provider"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import PatientPortal from "./pages/PatientPortal"
import DoctorPortal from "./pages/DoctorPortal"
import AdminPanel from "./pages/AdminPanel"
import Demo from "./pages/Demo"
import Dashboard from "./pages/Dashboard"
import DoctorListing from "./pages/DoctorListing"
import BookAppointment from "./pages/BookAppointment"
import MyAppointments from "./pages/MyAppointments"

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
                <Route path="/patient" element={<PatientPortal />} />
                <Route path="/doctor" element={<DoctorPortal />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/demo" element={<Demo />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/doctors" element={
                  <ProtectedRoute>
                    <DoctorListing />
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
                
                {/* Redirect root to login for unauthenticated users */}
                <Route path="*" element={<Login />} />
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
