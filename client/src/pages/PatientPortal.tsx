import { useState } from "react"
import { Navbar } from "../components/ui/navbar"
import { Footer } from "../components/ui/footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { StatusBadge } from "../components/ui/status-badge"
import { EmergencyMode } from "../components/ui/emergency-mode"
import { AvailabilityCalendar } from "../components/ui/availability-calendar"
import { HealthHighlights } from "../components/ui/health-highlights"
import PatientNav from "../components/patient/patient-nav"
import AppointmentBooking from "../components/patient/appointment-booking"
import HealthRecords from "../components/patient/health-records"
import { sampleAppointments } from "../lib/sample-data"
import { APPOINTMENT_STATUS } from "../lib/types"

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "appointments" | "records" | "emergency">("dashboard")

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 bg-surface">
        <PatientNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              {/* Welcome Section */}
              <div className="bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white rounded-xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Welcome back, Sarah</h1>
                <p className="opacity-95 text-white/90 leading-relaxed">
                  Your health, our priority. Manage your appointments and medical records in one place.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Next Appointment</p>
                        <p className="text-2xl font-bold mt-2">Jan 22, 2026</p>
                        <p className="text-sm text-text-secondary mt-1">Dr. Priya Sharma - General Checkup</p>
                        <div className="mt-2">
                          <StatusBadge status={APPOINTMENT_STATUS.APPROVED} />
                        </div>
                      </div>
                      <div className="text-3xl">📅</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Health Records</p>
                        <p className="text-2xl font-bold mt-2">12</p>
                        <p className="text-sm text-text-secondary mt-1">Documents & Prescriptions</p>
                      </div>
                      <div className="text-3xl">📋</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-slide-up" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Last Checkup</p>
                        <p className="text-2xl font-bold mt-2">Dec 15, 2025</p>
                        <p className="text-sm text-text-secondary mt-1">All vitals normal</p>
                      </div>
                      <div className="text-3xl">✓</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Highlights Image Strip */}
              <div className="animate-slide-up" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
                <HealthHighlights autoplayInterval={5000} />
              </div>

              {/* Emergency Mode Section */}
              <div className="animate-slide-up" style={{animationDelay: '0.5s', animationFillMode: 'both'}}>
                <h2 className="text-2xl font-bold text-foreground/95 mb-4">Emergency Assistance</h2>
                <EmergencyMode />
              </div>

              {/* Recent Appointments */}
              <div className="animate-slide-up" style={{animationDelay: '0.6s', animationFillMode: 'both'}}>
                <h2 className="text-2xl font-bold text-foreground/95 mb-4">Recent Appointments</h2>
                <div className="space-y-4">
                  {sampleAppointments.slice(0, 3).map((apt) => (
                    <Card key={apt.id} className="hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold">{apt.doctorName}</h4>
                            <p className="text-sm text-text-secondary">{apt.type}</p>
                            <p className="text-sm mt-2">
                              {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {apt.time}
                            </p>
                          </div>
                          <StatusBadge status={apt.status} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Doctor Availability */}
              <div className="animate-slide-up" style={{animationDelay: '0.7s', animationFillMode: 'both'}}>
                <h2 className="text-2xl font-bold text-foreground/95 mb-4">Dr. Priya Sharma's Availability</h2>
                <Card>
                  <CardContent className="pt-6">
                    <AvailabilityCalendar />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "appointments" && <AppointmentBooking />}
          {activeTab === "records" && <HealthRecords />}

          {activeTab === "emergency" && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-destructive border-2">
                <CardContent className="space-y-6 p-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-destructive mb-2">Emergency Services</h2>
                    <p className="text-muted-foreground">Get immediate medical assistance</p>
                  </div>

                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <p className="text-sm text-destructive">
                      If you're experiencing a life-threatening emergency, please call emergency services immediately or
                      visit the nearest hospital.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button size="lg" className="w-full bg-destructive hover:bg-destructive/90 h-12 text-lg">
                      Call Emergency Services
                    </Button>
                    <Button size="lg" variant="outline" className="w-full h-12 text-lg bg-transparent">
                      Connect with On-Call Doctor
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                    <div>
                      <p className="text-sm font-semibold text-primary">Ambulance</p>
                      <p className="text-2xl font-bold mt-1">102</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">Police</p>
                      <p className="text-2xl font-bold mt-1">100</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
