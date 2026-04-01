import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { StatusBadge } from "../ui/status-badge"
import { doctorProfileService } from "../../services/doctorProfileService"

interface Appointment {
  _id: string
  patientName?: string
  userId: { name: string; email: string; phone?: string }
  doctorId: { name: string; specialization: string }
  date: string
  time: string
  status: string
  notes?: string
}

interface Stats {
  totalAppointments: number
  todayAppointments: number
  pendingAppointments: number
  completedAppointments: number
}

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await doctorProfileService.getAppointments()
      
      if (response.success) {
        const appts = response.data || []
        setAppointments(appts)
        
        // Calculate stats
        const today = new Date().toISOString().split('T')[0]
        const todayAppts = appts.filter((apt: Appointment) => apt.date === today)
        const pendingAppts = appts.filter((apt: Appointment) => apt.status === 'Booked')
        const completedAppts = appts.filter((apt: Appointment) => apt.status === 'Completed')
        
        setStats({
          totalAppointments: appts.length,
          todayAppointments: todayAppts.length,
          pendingAppointments: pendingAppts.length,
          completedAppointments: completedAppts.length
        })
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err)
      setError(err.response?.data?.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">All Appointments</h2>
        <p className="text-text-secondary mb-6">Manage and view all your patient appointments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <div className="text-3xl mb-2">✅</div>
              <p className="text-2xl font-bold text-green-700">{stats.todayAppointments}</p>
              <p className="text-sm text-green-600">Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <p className="text-2xl font-bold text-yellow-700">{stats.pendingAppointments}</p>
              <p className="text-sm text-yellow-600">Pending</p>
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
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        👤
                      </div>
                      <div>
                        <h4 className="font-semibold">{apt.userId?.name || 'Unknown'}</h4>
                        <p className="text-sm text-text-secondary">
                          {formatDate(apt.date)} at {apt.time}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={fetchAppointments}>Refresh</Button>
      </div>
    </div>
  )
}
