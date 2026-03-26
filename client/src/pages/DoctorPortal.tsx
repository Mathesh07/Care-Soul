import { useState } from "react"
import { Navbar } from "../components/ui/navbar"
import { Footer } from "../components/ui/footer"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import DoctorNav from "../components/doctor/doctor-nav"
import AppointmentsList from "../components/doctor/appointments-list"
import PatientSummary from "../components/doctor/patient-summary"
import Consultations from "../components/doctor/consultations"

export default function DoctorPortal() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "appointments" | "patients" | "consultations">("dashboard")

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 bg-surface">
        <DoctorNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-lg p-8">
                <h1 className="text-3xl font-bold mb-2">Welcome, Dr. Priya Sharma</h1>
                <p className="opacity-90">
                  Manage your appointments, patient records, and consultations efficiently in one dashboard.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Today's Appointments</p>
                        <p className="text-3xl font-bold mt-2">5</p>
                      </div>
                      <div className="text-3xl">📅</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Active Consultations</p>
                        <p className="text-3xl font-bold mt-2">2</p>
                      </div>
                      <div className="text-3xl">🎥</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Total Patients</p>
                        <p className="text-3xl font-bold mt-2">284</p>
                      </div>
                      <div className="text-3xl">👥</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-text-secondary text-sm font-medium">Pending Records</p>
                        <p className="text-3xl font-bold mt-2">8</p>
                      </div>
                      <div className="text-3xl">📋</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Schedule and Pending Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Appointments */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-4">Today's Appointments</h2>
                  <div className="space-y-3">
                    {[
                      {
                        patient: "Rajesh Patel",
                        time: "9:30 AM",
                        type: "General Checkup",
                        status: "scheduled",
                      },
                      {
                        patient: "Anjali Desai",
                        time: "10:45 AM",
                        type: "Follow-up",
                        status: "scheduled",
                      },
                      {
                        patient: "Vikram Singh",
                        time: "2:00 PM",
                        type: "Consultation",
                        status: "ongoing",
                      },
                      {
                        patient: "Priya Nair",
                        time: "3:30 PM",
                        type: "General Checkup",
                        status: "scheduled",
                      },
                      {
                        patient: "Arjun Verma",
                        time: "4:45 PM",
                        type: "Follow-up",
                        status: "scheduled",
                      },
                    ].map((apt, i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold">{apt.patient}</h4>
                              <p className="text-sm text-text-secondary mb-2">{apt.type}</p>
                              <p className="text-sm font-medium">{apt.time}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                                  apt.status === "ongoing" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {apt.status === "ongoing" ? "In Progress" : "Scheduled"}
                              </span>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Pending Items */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        Start Consultation
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        Add Prescription
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        Upload Report
                      </Button>
                      <Button className="w-full justify-start bg-transparent" variant="outline">
                        Message Patient
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pending Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-warning/15 rounded-lg border border-warning/40">
                        <p className="text-sm font-medium text-foreground/90">3 prescriptions to review</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                        <p className="text-sm font-medium text-foreground/90">5 lab results to check</p>
                      </div>
                      <div className="p-3 bg-accent/25 rounded-lg border border-accent/50">
                        <p className="text-sm font-medium text-foreground/90">2 messages from patients</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointments" && <AppointmentsList />}
          {activeTab === "patients" && <PatientSummary />}
          {activeTab === "consultations" && <Consultations />}
        </main>
      </div>

      <Footer />
    </div>
  )
}
