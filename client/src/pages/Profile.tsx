import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { userService } from "../services/userService"
import { useAuth } from "../contexts/AuthContext"
import { Navbar } from "../components/ui/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

interface ProfileData {
  name: string
  email: string
  phone?: string
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role !== "patient") {
      navigate("/patient/dashboard")
      return
    }

    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await userService.getProfile()
        if (response.success) {
          setProfile(response.data)
          setName(response.data?.name || "")
          setPhone(response.data?.phone || "")
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
      const response = await userService.updateProfile({ name, phone })
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
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="border-border/60 shadow-premium-sm">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
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
                  placeholder="Your name"
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
