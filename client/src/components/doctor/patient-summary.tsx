import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { doctorProfileService } from "../../services/doctorProfileService"

export default function PatientSummary() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await doctorProfileService.getAppointments()
        const appts = response.data || []
        const byPatient = new Map<string, any>()

        appts.forEach((apt: any) => {
          const patient = apt.userId || {}
          const patientId = String(patient._id || patient.id || apt.patientId || "")
          if (!patientId) return
          const existing = byPatient.get(patientId)
          const lastVisit = apt.date || existing?.lastVisit
          byPatient.set(patientId, {
            id: patientId,
            name: patient.name || "Unknown",
            lastVisit,
            status: existing?.status || "Active",
          })
        })

        setPatients(Array.from(byPatient.values()))
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load patients")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const stats = useMemo(() => {
    const total = patients.length
    return {
      total,
      active: total,
      needsReview: 0,
      stable: total,
    }
  }, [patients])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">My Patients</h2>
        <p className="text-text-secondary mb-6">View and manage your patient records and treatment plans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-2xl font-bold text-green-700">{stats.total}</p>
              <p className="text-sm text-green-600">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
              <p className="text-sm text-blue-600">Active Cases</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-2xl font-bold text-yellow-700">{stats.needsReview}</p>
              <p className="text-sm text-yellow-600">Need Review</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-2xl font-bold text-purple-700">{stats.stable}</p>
              <p className="text-sm text-purple-600">Stable</p>
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
          <CardTitle>Recent Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No patients found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        👤
                      </div>
                      <div>
                        <h4 className="font-semibold">{patient.name}</h4>
                        <p className="text-sm text-text-secondary">
                          Last visit: {patient.lastVisit || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {patient.status}
                    </span>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline">Load More Patients</Button>
      </div>
    </div>
  )
}
