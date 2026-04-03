import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./button"
import { CareSOULLogo } from "./care-soul-logo"
import { NotificationCenter } from "./notification-center"
import { useTheme } from "../theme-provider"
import { useAuth } from "../../contexts/AuthContext"
import { authService } from "../../services/authService"
import { LogOut, User, Settings } from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const getAuthButtons = () => {
    if (isAuthenticated && user) {
      return (
        <>
          {/* User Menu */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-secondary/50">
              <User className="w-4 h-4 text-foreground/70" />
              <span className="text-sm font-medium text-foreground">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </>
      )
    } else {
      return (
        <>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </>
      )
    }
  }

  const getMobileAuthButtons = () => {
    if (isAuthenticated && user) {
      return (
        <>
          <div className="flex items-center gap-2 px-4 py-2 border-t border-border mt-4">
            <div className="flex items-center gap-2 flex-1">
              <User className="w-4 h-4 text-foreground/70" />
              <span className="text-sm font-medium text-foreground">{user.name}</span>
            </div>
          </div>
          
          <div className="flex gap-2 px-4 pb-4">
            <Button variant="ghost" size="sm" className="flex-1 gap-2">
              <Settings className="w-4 h-4" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </>
      )
    } else {
      return (
        <div className="flex gap-2 mt-4 px-4">
          <Button variant="ghost" size="sm" className="flex-1" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button size="sm" className="flex-1" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      )
    }
  }

  // Don't show navbar for admin users (they have their own special navbar)
  if (isAuthenticated && user?.role === 'admin') {
    return null;
  }

  return (
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
            {isAuthenticated ? (
              // Authenticated user navigation
              [
                { href: "/", label: "Home" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/doctors", label: "Find Doctors" },
                { href: "/my-appointments", label: "My Appointments" },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground/70 hover:text-blue-nav transition-all duration-300 ease-out text-sm font-medium relative group py-1"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-nav to-blue-accent group-hover:w-full transition-all duration-300 ease-out rounded-full" />
                </Link>
              ))
            ) : (
              // Public navigation
              [
                { href: "/", label: "Home" },
                { href: "/patient-portal", label: "Patient Portal" },
                { href: "/doctors", label: "Find Doctors" },
                { href: "/demo", label: "Demo" },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground/70 hover:text-blue-nav transition-all duration-300 ease-out text-sm font-medium relative group py-1"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-nav to-blue-accent group-hover:w-full transition-all duration-300 ease-out rounded-full" />
                </Link>
              ))
            )}
            {isAuthenticated && user?.role === "admin" && (
              <Link
                to="/admin"
                className="text-foreground/70 hover:text-blue-nav transition-all duration-300 ease-out text-sm font-medium relative group py-1"
              >
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-nav to-blue-accent group-hover:w-full transition-all duration-300 ease-out rounded-full" />
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <NotificationCenter />
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2.5 rounded-lg hover:bg-white/10 active:bg-white/[0.15] transition-all duration-300 ease-out text-foreground hover:shadow-sm active:scale-95"
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
            
            {/* Dynamic Auth Buttons */}
            {getAuthButtons()}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-all duration-200"
              aria-label="Toggle theme"
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-surface-secondary rounded-lg transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2 pt-4">
              {isAuthenticated ? (
                // Authenticated user navigation
                [
                  { href: "/", label: "Home" },
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/doctors", label: "Find Doctors" },
                  { href: "/my-appointments", label: "My Appointments" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-4 py-2 text-text-secondary hover:text-foreground hover:bg-surface-secondary rounded-lg transition-all duration-200 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                // Public navigation
                [
                  { href: "/", label: "Home" },
                  { href: "/patient-portal", label: "Patient Portal" },
                  { href: "/doctors", label: "Find Doctors" },
                  { href: "/demo", label: "🎨 Demo" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-4 py-2 text-text-secondary hover:text-foreground hover:bg-surface-secondary rounded-lg transition-all duration-200 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))
              )}
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-text-secondary hover:text-foreground hover:bg-surface-secondary rounded-lg transition-all duration-200 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              
              {/* Dynamic Mobile Auth Buttons */}
              {getMobileAuthButtons()}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
