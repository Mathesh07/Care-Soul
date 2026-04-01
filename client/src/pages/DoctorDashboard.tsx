import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import UnifiedDoctorNavbar from '../components/doctor/unified-doctor-navbar'
import AppointmentsList from '../components/doctor/appointments-list'
import Consultations from '../components/doctor/consultations'
import PatientSummary from '../components/doctor/patient-summary'
import PrescriptionManagement from '../components/doctor/prescription-management'
import HealthRecordsManagement from '../components/doctor/health-records-management'
import PaymentManagement from '../components/doctor/payment-management'
import { Card, CardContent } from '../components/ui/card'
import { doctorProfileService } from '../services/doctorProfileService'

interface DashboardStats {
  totalAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  totalPrescriptions: number
  totalHealthRecords: number
  totalPatients: number
  totalEarnings: number
  rating: number
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'patients' | 'records' | 'operations'>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isValidTab = (tab: string): tab is typeof activeTab => (
    [
      'dashboard',
      'appointments',
      'patients',
      'records',
      'operations',
    ] as const
  ).includes(tab as any)

  useEffect(() => {
    if (user?.role !== 'doctor') {
      navigate('/login')
      return
    }
    
    fetchDashboardStats()
  }, [user, navigate])

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash && isValidTab(hash) && hash !== activeTab) {
      setActiveTab(hash)
    }
  }, [location.hash, activeTab])

  useEffect(() => {
    if (!location.hash) {
      window.history.replaceState(null, '', `${location.pathname}#${activeTab}`)
    }
  }, [activeTab, location.pathname, location.hash])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await doctorProfileService.getDashboardStats()
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user || user.role !== 'doctor') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">You must be logged in as a doctor to access this page</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <UnifiedDoctorNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome, Dr. {user?.name}</h1>
                  <p className="text-text-secondary">Here's your practice overview</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
                >
                  Logout
                </button>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-text-secondary">Loading dashboard...</p>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">📅</div>
                        <p className="text-2xl font-bold text-blue-700">{stats.totalAppointments}</p>
                        <p className="text-sm text-blue-600">Total Appointments</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">⏭️</div>
                        <p className="text-2xl font-bold text-green-700">{stats.upcomingAppointments}</p>
                        <p className="text-sm text-green-600">Upcoming</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">✓</div>
                        <p className="text-2xl font-bold text-purple-700">{stats.completedAppointments}</p>
                        <p className="text-sm text-purple-600">Completed</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">👥</div>
                        <p className="text-2xl font-bold text-orange-700">{stats.totalPatients}</p>
                        <p className="text-sm text-orange-600">Total Patients</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">💊</div>
                        <p className="text-2xl font-bold text-yellow-700">{stats.totalPrescriptions}</p>
                        <p className="text-sm text-yellow-600">Prescriptions</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-cyan-50 border-cyan-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">📋</div>
                        <p className="text-2xl font-bold text-cyan-700">{stats.totalHealthRecords}</p>
                        <p className="text-sm text-cyan-600">Health Records</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">💰</div>
                        <p className="text-2xl font-bold text-emerald-700">${stats.totalEarnings.toFixed(2)}</p>
                        <p className="text-sm text-emerald-600">Total Earnings</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-pink-50 border-pink-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl mb-2">⭐</div>
                        <p className="text-2xl font-bold text-pink-700">{stats.rating.toFixed(1)}</p>
                        <p className="text-sm text-pink-600">Rating</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && <AppointmentsList />}

          {/* Records Tab (Prescriptions + Health Records) */}
          {activeTab === 'records' && (
            <div className="space-y-8">
              <PrescriptionManagement />
              <HealthRecordsManagement />
            </div>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && <PatientSummary />}

          {/* Operations Tab (Payments + Consultations) */}
          {activeTab === 'operations' && (
            <div className="space-y-8">
              <PaymentManagement />
              <Consultations />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
