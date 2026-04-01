/**
 * @deprecated Use RoleBasedNavbar or DoctorNavbar instead
 * This component is kept for backward compatibility only
 * See: components/ui/role-based-navbar.tsx
 */
interface DoctorNavProps {
  activeTab: "dashboard" | "appointments" | "patients" | "prescriptions" | "health-records" | "payments" | "consultations"
  setActiveTab: (tab: "dashboard" | "appointments" | "patients" | "prescriptions" | "health-records" | "payments" | "consultations") => void
}

export default function DoctorNav({ activeTab, setActiveTab }: DoctorNavProps) {
  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: "🏠" },
    { id: "appointments" as const, label: "Appointments", icon: "📅" },
    { id: "patients" as const, label: "My Patients", icon: "👥" },
    { id: "prescriptions" as const, label: "Prescriptions", icon: "💊" },
    { id: "health-records" as const, label: "Health Records", icon: "📋" },
    { id: "payments" as const, label: "Payments", icon: "💰" },
    { id: "consultations" as const, label: "Consultations", icon: "🎥" },
  ]

  return (
    <div className="bg-surface border-b border-border overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-foreground"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
