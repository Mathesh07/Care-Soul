import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { doctorProfileService } from "../../services/doctorProfileService"

interface HealthRecord {
  _id: string
  patientId: string
  title: string
  recordType: string
  description: string
  vitals: {
    bloodPressure?: string
    heartRate?: string
    temperature?: string
    weight?: string
    height?: string
  }
  diagnosis?: string
  testResults?: string
  recommendations?: string
  status: string
  createdAt: string
}

export default function HealthRecordsManagement() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [newRecord, setNewRecord] = useState({
    patientId: '',
    appointmentId: '',
    recordType: 'consultation_notes' as const,
    title: '',
    description: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    diagnosis: '',
    testResults: '',
    recommendations: ''
  })

  useEffect(() => {
    setLoading(false)
  }, [])

  const loadRecords = async () => {
    if (!selectedPatient) {
      setError('Please enter a patient ID to load records')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await doctorProfileService.getPatientHealthRecords(selectedPatient)
      if (response.success) {
        setRecords(response.data || [])
      } else {
        setRecords([])
        setError(response.message || 'Failed to load health records')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load health records')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRecord = async () => {
    try {
      const response = await doctorProfileService.createHealthRecord(newRecord)
      
      if (response.success) {
        setShowForm(false)
        setNewRecord({
          patientId: '',
          appointmentId: '',
          recordType: 'consultation_notes',
          title: '',
          description: '',
          vitals: {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            weight: '',
            height: ''
          },
          diagnosis: '',
          testResults: '',
          recommendations: ''
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create health record')
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Health Records</h2>
          <p className="text-text-secondary">Create and manage patient health records</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Record'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Health Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Patient ID</label>
                  <input
                    type="text"
                    value={newRecord.patientId}
                    onChange={(e) => setNewRecord({...newRecord, patientId: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2"
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Record Type</label>
                  <select
                    value={newRecord.recordType}
                    onChange={(e) => setNewRecord({...newRecord, recordType: e.target.value as any})}
                    className="w-full border border-border rounded-lg px-3 py-2"
                  >
                    <option value="consultation_notes">Consultation Notes</option>
                    <option value="lab_report">Lab Report</option>
                    <option value="medical_test">Medical Test</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="follow_up">Follow Up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  placeholder="Record title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Detailed description"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">Vitals (Optional)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newRecord.vitals.bloodPressure}
                    onChange={(e) => setNewRecord({...newRecord, vitals: {...newRecord.vitals, bloodPressure: e.target.value}})}
                    className="border border-border rounded px-2 py-1 text-sm"
                    placeholder="BP (e.g., 120/80)"
                  />
                  <input
                    type="text"
                    value={newRecord.vitals.heartRate}
                    onChange={(e) => setNewRecord({...newRecord, vitals: {...newRecord.vitals, heartRate: e.target.value}})}
                    className="border border-border rounded px-2 py-1 text-sm"
                    placeholder="Heart Rate (bpm)"
                  />
                  <input
                    type="text"
                    value={newRecord.vitals.temperature}
                    onChange={(e) => setNewRecord({...newRecord, vitals: {...newRecord.vitals, temperature: e.target.value}})}
                    className="border border-border rounded px-2 py-1 text-sm"
                    placeholder="Temperature (°C)"
                  />
                  <input
                    type="text"
                    value={newRecord.vitals.weight}
                    onChange={(e) => setNewRecord({...newRecord, vitals: {...newRecord.vitals, weight: e.target.value}})}
                    className="border border-border rounded px-2 py-1 text-sm"
                    placeholder="Weight (kg)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Diagnosis</label>
                <textarea
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Diagnosis details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Recommendations</label>
                <textarea
                  value={newRecord.recommendations}
                  onChange={(e) => setNewRecord({...newRecord, recommendations: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Treatment recommendations"
                />
              </div>

              <Button onClick={handleCreateRecord} className="w-full">
                Create Record
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

      <Card>
        <CardHeader>
          <CardTitle>Load Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="flex-1 border border-border rounded-lg px-3 py-2"
              placeholder="Enter patient ID"
            />
            <Button onClick={loadRecords} disabled={loading}>Load Records</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8 text-text-secondary">Loading health records...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          No health records available
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record._id}>
              <CardHeader>
                <CardTitle>{record.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">{record.description}</p>
                <p className="text-xs text-text-secondary mt-2">{formatDate(record.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
