import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { doctorProfileService } from "../../services/doctorProfileService"

interface ConsultationItem {
  id: string
  patient: string
  time: string
  type: string
  status: string
  emergency: boolean
  appointmentId?: string
}

export default function Consultations() {
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState<ConsultationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true)
        const response = await doctorProfileService.getAppointments()
        const appts = response.data || []
        const mapped = appts.map((apt: any) => ({
          id: String(apt._id || apt.id || ""),
          appointmentId: String(apt._id || apt.id || ""),
          patient: apt.userId?.name || apt.patientName || "Unknown Patient",
          time: apt.time || "--:--",
          type: apt.consultationType || "Video Call",
          status: apt.status === "Booked" ? "Scheduled" : apt.status,
          emergency: Boolean(apt.isEmergency),
        }))
        setConsultations(mapped)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load consultations")
      } finally {
        setLoading(false)
      }
    }

    fetchConsultations()
  }, [])

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    const todayCount = consultations.filter((item) => item.id && item.status).length
    const activeCount = consultations.filter((item) => item.status === "In Progress").length
    const emergencyCount = consultations.filter((item) => item.emergency).length
    const completedCount = consultations.filter((item) => item.status === "Completed").length
    return { todayCount, activeCount, emergencyCount, completedCount }
  }, [consultations])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Consultations</h2>
        <p className="text-text-secondary mb-6">Manage video consultations and emergency calls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎥</div>
              <p className="text-2xl font-bold text-green-700">{stats.todayCount}</p>
              <p className="text-sm text-green-600">Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-2xl font-bold text-blue-700">{stats.activeCount}</p>
              <p className="text-sm text-blue-600">Active</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🚨</div>
              <p className="text-2xl font-bold text-red-700">{stats.emergencyCount}</p>
              <p className="text-sm text-red-600">Emergency</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-2xl font-bold text-purple-700">{stats.completedCount}</p>
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

      {loading ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">Loading consultations...</p>
        </div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">No consultations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className={
              consultation.emergency ? "border-red-200 bg-red-50" : ""
            }>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      consultation.emergency ? "bg-red-100" : "bg-primary/10"
                    }`}>
                      {consultation.type === "Video Call" && "🎥"}
                      {consultation.type === "Emergency Call" && "🚨"}
                    </div>
                    <div>
                      <h4 className="font-semibold">{consultation.patient}</h4>
                      <p className="text-sm text-text-secondary">
                        {consultation.type} • {consultation.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      consultation.status === "Active" ? "bg-red-100 text-red-700" :
                      consultation.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {consultation.status}
                    </span>
                    {consultation.appointmentId && consultation.status === "Scheduled" && (
                      <Button size="sm" onClick={() => navigate(`/doctor/consultation/${consultation.appointmentId}`)}>Start Call</Button>
                    )}
                    {consultation.appointmentId && consultation.status === "In Progress" && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/consultation/${consultation.appointmentId}`)}>Join Call</Button>
                    )}
                    {consultation.status === "Active" && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">Emergency</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              🎥 Start New Consultation
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              📞 Schedule Call
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              📋 View History
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              ⚙️ Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
