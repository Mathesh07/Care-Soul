import { Star } from 'lucide-react';

interface DoctorCardDoctor {
  _id: string;
  name: string;
  specialization: string;
  rating: number;
  totalConsultations: number;
  consultationFee: number;
  isAvailableNow: boolean;
  languages: string[];
  experience: number;
  bio: string;
}

interface DoctorCardProps {
  doctor: DoctorCardDoctor;
  onBook: (doctorId: string) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {getInitials(doctor.name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
            <p className="text-sm text-gray-500">{doctor.specialization}</p>
          </div>
        </div>

        {doctor.isAvailableNow && (
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            Available Now
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{doctor.rating.toFixed(1)}</span>
        <span className="text-gray-400">({doctor.totalConsultations} consultations)</span>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
        <span>{doctor.experience} years experience</span>
        <span className="font-semibold">Rs. {doctor.consultationFee}</span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-gray-600">{doctor.bio}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {doctor.languages.map((language) => (
          <span
            key={`${doctor._id}-${language}`}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
          >
            {language}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onBook(doctor._id)}
        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Book Appointment
      </button>
    </div>
  );
}

export function DoctorCardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-200" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-gray-200" />
      </div>

      <div className="mt-4 h-4 w-40 rounded bg-gray-200" />
      <div className="mt-3 h-4 w-full rounded bg-gray-200" />
      <div className="mt-3 h-4 w-4/5 rounded bg-gray-200" />

      <div className="mt-3 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-200" />
        <div className="h-6 w-20 rounded-full bg-gray-200" />
        <div className="h-6 w-14 rounded-full bg-gray-200" />
      </div>

      <div className="mt-5 h-10 w-full rounded-lg bg-gray-200" />
    </div>
  );
}
