import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { doctorProfileService } from "../services/doctorProfileService"
import UnifiedDoctorNavbar from "../components/doctor/unified-doctor-navbar"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

interface DoctorProfileData {
  name: string
  email: string
  phone?: string
  specialization?: string
  location?: string
  experience?: string
  availableSlots?: string[]
  bio?: string
}

export default function DoctorProfile() {
  const [profile, setProfile] = useState<DoctorProfileData | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [location, setLocation] = useState("")
  const [experience, setExperience] = useState("")
  const [availableSlots, setAvailableSlots] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role !== "doctor") {
      navigate("/doctor/dashboard")
      return
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await doctorProfileService.getProfile()
        if (response.success) {
          setProfile(response.data)
          setName(response.data?.name || "")
          setPhone(response.data?.phone || "")
          setSpecialization(response.data?.specialization || "")
          setLocation(response.data?.location || "")
          setExperience(response.data?.experience || "")
          setAvailableSlots((response.data?.availableSlots || []).join(", "))
          setBio(response.data?.bio || "")
        } else {
          setError(response.message || "Failed to load profile")
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [navigate, user?.role])

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setSaving(true)
      setError("")
      setSuccess("")
      const slots = availableSlots
        .split(",")
        .map((slot) => slot.trim())
        .filter(Boolean)
      const response = await doctorProfileService.updateProfile({
        name,
        phone,
        specialization,
        location,
        experience,
        availableSlots: slots,
        bio
      })
      if (response.success) {
        setProfile(response.data)
        setSuccess("Profile updated successfully")
      } else {
        setError(response.message || "Failed to update profile")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <UnifiedDoctorNavbar activeTab="dashboard" setActiveTab={() => {}} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="border-border/60 shadow-premium-sm">
          <CardHeader>
            <CardTitle>Doctor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
                {success}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  placeholder="Doctor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Email</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-foreground/70 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(event) => setSpecialization(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  placeholder="Specialization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">City / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Experience</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  placeholder="e.g., 10 years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Available Slots (comma-separated)</label>
                <input
                  type="text"
                  value={availableSlots}
                  onChange={(event) => setAvailableSlots(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  placeholder="09:00, 10:30, 14:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="w-full min-h-[120px] rounded-lg border border-border bg-background px-4 py-2 focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  placeholder="Short professional bio"
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
