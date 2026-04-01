import { useAuth } from "../../contexts/AuthContext"
import DoctorNavbar from "../doctor/doctor-navbar"
import PatientNavbar from "../patient/patient-navbar"

interface RoleBasedNavbarProps {
  activeTab?: string
  setActiveTab?: (tab: any) => void
  isDoctorPortal?: boolean
  isPatientPortal?: boolean
}

/**
 * RoleBasedNavbar automatically renders the correct navbar based on user role
 * Prevents mismatch when refreshing pages
 * 
 * Priority:
 * 1. isDoctorPortal flag -> always show doctor navbar
 * 2. isPatientPortal flag -> always show patient navbar
 * 3. Fallback to user.role from auth context
 * 4. During loading, show loading placeholder to prevent wrong navbar
 */
export default function RoleBasedNavbar({ 
  activeTab = 'dashboard', 
  setActiveTab = () => {},
  isDoctorPortal = false,
  isPatientPortal = false,
}: RoleBasedNavbarProps) {
  const { user, loading } = useAuth()

  // Show loading state while auth context is initializing
  // This prevents showing the wrong navbar on page refresh
  if (loading) {
    return (
      <div className="sticky top-0 z-50 h-16 bg-card/50 backdrop-blur-xl border-b border-white/[0.08] flex items-center justify-center">
        <div className="animate-pulse text-foreground/50">Loading...</div>
      </div>
    )
  }

  // If page explicitly marks itself as doctor portal, show doctor navbar
  // (Page component should handle role protection separately)
  if (isDoctorPortal) {
    return (
      <DoctorNavbar 
        activeTab={activeTab as any} 
        setActiveTab={setActiveTab} 
      />
    )
  }

  // If page explicitly marks itself as patient portal, show patient navbar
  // (Page component should handle role protection separately)
  if (isPatientPortal) {
    return (
      <PatientNavbar 
        activeTab={activeTab as any} 
        setActiveTab={setActiveTab} 
      />
    )
  }

  // Fallback to user's actual role
  if (user?.role === 'doctor') {
    return (
      <DoctorNavbar 
        activeTab={activeTab as any} 
        setActiveTab={setActiveTab} 
      />
    )
  }

  // Default to patient navbar
  return (
    <PatientNavbar 
      activeTab={activeTab as any} 
      setActiveTab={setActiveTab} 
    />
  )
}
