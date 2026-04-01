/**
 * @deprecated Use RoleBasedNavbar or PatientNavbar instead
 * This component is kept for backward compatibility only
 * See: components/ui/role-based-navbar.tsx
 */
interface PatientNavProps {
  activeTab: "dashboard" | "appointments" | "records" | "emergency"
  setActiveTab: (tab: "dashboard" | "appointments" | "records" | "emergency") => void
}

export default function PatientNav({ activeTab, setActiveTab }: PatientNavProps) {
  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: "🏠" },
    { id: "appointments" as const, label: "Appointments", icon: "📅" },
    { id: "records" as const, label: "Health Records", icon: "📋" },
    { id: "emergency" as const, label: "Emergency", icon: "🚨" },
  ]

  return (
    <div className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto">
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
