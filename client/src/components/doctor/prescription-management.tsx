import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { doctorProfileService } from "../../services/doctorProfileService"

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface Prescription {
  _id: string
  patientId: { name: string; email: string }
  appointmentId: string
  medications: Medication[]
  notes: string
  status: string
  issuedAt: string
}

export default function PrescriptionManagement() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newPrescription, setNewPrescription] = useState({
    appointmentId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  })

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await doctorProfileService.getPrescriptions()
      
      if (response.success) {
        setPrescriptions(response.data || [])
      }
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err)
      setError(err.response?.data?.message || 'Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrescription = async () => {
    try {
      const response = await doctorProfileService.createPrescription(newPrescription)
      
      if (response.success) {
        setShowForm(false)
        setNewPrescription({
          appointmentId: '',
          medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
          notes: ''
        })
        fetchPrescriptions()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create prescription')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Prescription Management</h2>
          <p className="text-text-secondary">Create and manage patient prescriptions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Prescription'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Prescription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Appointment ID</label>
                <input
                  type="text"
                  value={newPrescription.appointmentId}
                  onChange={(e) => setNewPrescription({...newPrescription, appointmentId: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  placeholder="Enter appointment ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Medications</label>
                {newPrescription.medications.map((med, idx) => (
                  <div key={idx} className="space-y-2 p-3 border border-border rounded-lg mb-2">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => {
                        const updated = [...newPrescription.medications]
                        updated[idx].name = e.target.value
                        setNewPrescription({...newPrescription, medications: updated})
                      }}
                      placeholder="Medication name"
                      className="w-full border border-border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => {
                        const updated = [...newPrescription.medications]
                        updated[idx].dosage = e.target.value
                        setNewPrescription({...newPrescription, medications: updated})
                      }}
                      placeholder="Dosage (e.g., 500mg)"
                      className="w-full border border-border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => {
                        const updated = [...newPrescription.medications]
                        updated[idx].frequency = e.target.value
                        setNewPrescription({...newPrescription, medications: updated})
                      }}
                      placeholder="Frequency (e.g., Twice daily)"
                      className="w-full border border-border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => {
                        const updated = [...newPrescription.medications]
                        updated[idx].duration = e.target.value
                        setNewPrescription({...newPrescription, medications: updated})
                      }}
                      placeholder="Duration (e.g., 5 days)"
                      className="w-full border border-border rounded px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Additional notes for patient"
                />
              </div>

              <Button onClick={handleCreatePrescription} className="w-full">
                Create Prescription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">No prescriptions created yet</p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <Card key={prescription._id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{prescription.patientId?.name || 'Unknown Patient'}</h3>
                      <p className="text-sm text-text-secondary">{prescription.patientId?.email}</p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      prescription.status === 'issued' ? 'bg-green-100 text-green-700' : ''
                    }`}>
                      {prescription.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Medications:</h4>
                    <div className="space-y-1 text-sm">
                      {prescription.medications.map((med, idx) => (
                        <div key={idx} className="text-text-secondary">
                          {med.name} - {med.dosage} ({med.frequency}, {med.duration})
                        </div>
                      ))}
                    </div>
                  </div>

                  {prescription.notes && (
                    <div>
                      <h4 className="font-medium mb-1">Notes:</h4>
                      <p className="text-sm text-text-secondary">{prescription.notes}</p>
                    </div>
                  )}

                  <p className="text-xs text-text-secondary">
                    Issued: {formatDate(prescription.issuedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
