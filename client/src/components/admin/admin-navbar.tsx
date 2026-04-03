import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react'
import { Button } from '../ui/button'

export default function AdminNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-lg">CareSoul</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Administrator
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 py-4">
            <div className="space-y-1">
              {/* Mobile User Info */}
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Administrator
                  </p>
                </div>
              </div>
              
              {/* Mobile Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
