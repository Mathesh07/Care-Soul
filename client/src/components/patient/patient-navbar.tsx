import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { CareSOULLogo } from "../ui/care-soul-logo"
import { NotificationCenter } from "../ui/notification-center"
import { useTheme } from "../theme-provider"
import { useAuth } from "../../contexts/AuthContext"
import { LogOut, User } from "lucide-react"

interface PatientNavbarProps {
  activeTab: "dashboard" | "appointments" | "records" | "emergency"
  setActiveTab: (tab: "dashboard" | "appointments" | "records" | "emergency") => void
}

export default function PatientNavbar({ activeTab, setActiveTab }: PatientNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: "🏠" },
    { id: "appointments" as const, label: "Appointments", icon: "📅" },
    { id: "records" as const, label: "Health Records", icon: "📋" },
    { id: "emergency" as const, label: "Emergency", icon: "🚨" },
  ]

  return (
    <>
      {/* Main Navbar Header */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] backdrop-blur-xl bg-card/50 shadow-navy-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-nav group-hover:text-blue-nav-light transition-all duration-300 ease-out transform group-hover:scale-105 group-hover:shadow-glow-blue">
                <CareSOULLogo />
              </div>
              <span className="font-bold text-foreground text-lg hidden sm:inline group-hover:text-blue-nav transition-all duration-300 ease-out">
                CARE SOUL
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-7">
              <Link
                to="/patient/dashboard"
                className="text-foreground/70 hover:text-blue-nav transition-all duration-300 ease-out text-sm font-medium relative group py-1"
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-nav to-blue-accent group-hover:w-full transition-all duration-300 ease-out rounded-full" />
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <NotificationCenter />
              <Link
                to="/patient/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-secondary/50 hover:bg-surface-secondary/70 transition-all duration-200"
              >
                <User className="w-4 h-4 text-foreground/70" />
                <span className="text-sm font-medium text-foreground">{user?.name || "Patient"}</span>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-secondary transition-all duration-300 ease-out"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/patient/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary/50 hover:bg-surface-secondary/70 transition-all duration-200"
              >
                <User className="w-4 h-4 text-foreground/70" />
                <span className="text-sm font-medium text-foreground">{user?.name || "Patient"}</span>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Patient-Specific Tab Navigation */}
      <div className="bg-surface border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-foreground"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
