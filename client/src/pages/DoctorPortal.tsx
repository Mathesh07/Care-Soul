import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import DoctorCard, { DoctorCardSkeleton } from "../components/doctors/DoctorCard"
import AppointmentBookingFlow from "../components/appointments/AppointmentBookingFlow"
import { useDoctorStore } from "../stores/doctorStore"

export default function DoctorPortal() {
  const [specialization, setSpecialization] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available">("all")
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)

  const { doctors, isLoading, error, search } = useDoctorStore((state) => ({
    doctors: state.doctors,
    isLoading: state.isLoading,
    error: state.error,
    search: state.search,
  }))

  const filters = useMemo(() => {
    const nextFilters: Record<string, unknown> = {}
    if (specialization.trim()) {
      nextFilters.specialization = specialization.trim()
    }
    if (availabilityFilter === "available") {
      nextFilters.isAvailableNow = true
    }
    return nextFilters
  }, [specialization, availabilityFilter])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void search(filters)
    }, 500)

    return () => clearTimeout(timeout)
  }, [filters, search])

  const normalizedDoctors = useMemo(
    () =>
      doctors.map((rawDoctor) => ({
        _id: String(rawDoctor._id ?? rawDoctor.id ?? ""),
        name: String(rawDoctor.name ?? "Unknown Doctor"),
        specialization: String(rawDoctor.specialization ?? "General"),
        rating: Number(rawDoctor.rating ?? 0),
        totalConsultations: Number(rawDoctor.totalConsultations ?? 0),
        consultationFee: Number(rawDoctor.consultationFee ?? 0),
        isAvailableNow: Boolean(rawDoctor.isAvailableNow),
        languages: Array.isArray(rawDoctor.languages)
          ? rawDoctor.languages.map((language) => String(language))
          : [],
        experience: Number(rawDoctor.experience ?? 0),
        bio: String(rawDoctor.bio ?? ""),
      })),
    [doctors]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Find Doctors</h1>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Search by specialization"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as "all" | "available")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="available">Available Now</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <DoctorCardSkeleton key={`doctor-card-skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {normalizedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBook={(doctorId) => setSelectedDoctorId(doctorId)}
              />
            ))}
          </div>
        )}

        {!isLoading && normalizedDoctors.length === 0 ? (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
            No doctors found for the selected filters.
          </div>
        ) : null}
      </main>

      {selectedDoctorId ? (
        <AppointmentBookingFlow
          doctorId={selectedDoctorId}
          onClose={() => setSelectedDoctorId(null)}
          onSuccess={() => toast.success("Appointment booked successfully")}
        />
      ) : null}
      </div>
  )
}
