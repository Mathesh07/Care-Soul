import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { CareSOULLogo } from "../ui/care-soul-logo"
import { NotificationCenter } from "../ui/notification-center"
import { useTheme } from "../theme-provider"
import { useAuth } from "../../contexts/AuthContext"
import { LogOut, User } from "lucide-react"

interface UnifiedDoctorNavbarProps {
  activeTab: "dashboard" | "appointments" | "patients" | "records" | "operations"
  setActiveTab: (tab: "dashboard" | "appointments" | "patients" | "records" | "operations") => void
}

export default function UnifiedDoctorNavbar({ activeTab, setActiveTab }: UnifiedDoctorNavbarProps) {
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
    navigate('/login')
  }

  const tabs = [
    { id: "dashboard" as const, label: "Dashboard" },
    { id: "appointments" as const, label: "Appointments" },
    { id: "patients" as const, label: "My Patients" },
    { id: "records" as const, label: "Records" },
    { id: "operations" as const, label: "Operations" },
  ]

  const handleTabClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId)
    navigate({ hash: tabId })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* Doctor Navbar (single-row like patient navbar) */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] backdrop-blur-xl bg-card/50 shadow-navy-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single Row */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo Section */}
            <Link to="/doctor-dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-nav group-hover:text-blue-nav-light transition-all duration-300 ease-out transform group-hover:scale-105 group-hover:shadow-glow-blue">
                <CareSOULLogo />
              </div>
              <span className="font-bold text-foreground text-lg hidden sm:inline group-hover:text-blue-nav transition-all duration-300 ease-out whitespace-nowrap">
                CARE SOUL
              </span>
            </Link>

            {/* Center: Tab Navigation */}
            <div className="hidden md:flex items-center justify-center gap-7 flex-1 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`text-foreground/70 hover:text-blue-nav transition-all duration-300 ease-out text-sm font-medium relative group py-1 ${
                    activeTab === tab.id ? "text-blue-nav" : ""
                  }`}
                >
                  {tab.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-nav to-blue-accent transition-all duration-300 ease-out rounded-full ${
                      activeTab === tab.id ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Right: Notifications, User Info, Sign Out */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <NotificationCenter />
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2.5 rounded-lg hover:bg-surface-secondary/80 active:bg-surface-secondary transition-all duration-300 ease-out text-foreground hover:shadow-sm active:scale-95"
                aria-label="Toggle theme"
                title={mounted ? `Switch to ${theme === "light" ? "dark" : "light"} mode` : "Toggle theme"}
              >
                {!mounted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : theme === "light" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-secondary/50">
                <User className="w-4 h-4 text-foreground/70" />
                <span className="text-sm font-medium text-foreground">{user?.name || "Doctor"}</span>
              </div>
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
            <div className="px-4 py-3 space-y-3 max-h-96 overflow-y-auto">
              {/* Mobile Tabs */}
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleTabClick(tab.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:text-foreground hover:bg-surface-secondary/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* User Info and Sign Out */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary/50">
                <User className="w-4 h-4 text-foreground/70" />
                <span className="text-sm font-medium text-foreground">{user?.name || "Doctor"}</span>
              </div>
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
    </>
  )
}
