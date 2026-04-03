import { APPOINTMENT_STATUS } from "../../lib/types"

interface StatusBadgeProps {
  status: typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case APPOINTMENT_STATUS.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case APPOINTMENT_STATUS.BOOKED:
        return "bg-green-100 text-green-800 border-green-200"
      case APPOINTMENT_STATUS.COMPLETED:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case APPOINTMENT_STATUS.CANCELLED:
      case APPOINTMENT_STATUS.REJECTED:
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case APPOINTMENT_STATUS.PENDING:
        return "Pending"
      case APPOINTMENT_STATUS.BOOKED:
        return "Booked"
      case APPOINTMENT_STATUS.COMPLETED:
        return "Completed"
      case APPOINTMENT_STATUS.CANCELLED:
        return "Cancelled"
      case APPOINTMENT_STATUS.REJECTED:
        return "Rejected"
      default:
        return "Unknown"
    }
  }

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyles(
        status
      )}`}
    >
      {getStatusText(status)}
    </span>
  )
}
