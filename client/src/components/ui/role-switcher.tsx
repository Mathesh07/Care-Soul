import { Button } from "./button"
import { Card, CardContent } from "./card"
import { useRole } from "../role-provider"
import { USER_ROLE } from "../../lib/types"

export function RoleSwitcher() {
  const { setCurrentRole, currentRole } = useRole()

  const roles = [
    { id: USER_ROLE.PATIENT, label: "Patient", icon: "👤", description: "Book appointments, view records" },
    { id: USER_ROLE.DOCTOR, label: "Doctor", icon: "👨‍⚕️", description: "Manage patients, consultations" },
    { id: USER_ROLE.ADMIN, label: "Admin", icon: "⚙️", description: "System management" },
  ]

  return (
    <Card className="inline-block">
      <CardContent className="p-4">
        <div className="flex gap-2">
          {roles.map((role) => (
            <Button
              key={role.id}
              variant={currentRole === role.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentRole(role.id)}
              className="flex items-center gap-2"
            >
              <span>{role.icon}</span>
              <span>{role.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
