import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MessageSquare, Phone, Video } from 'lucide-react';
import { useAppointmentStore } from '../stores/appointmentStore';

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled';

type AppointmentItem = {
  _id?: string;
  id?: string;
  doctorId?: { _id?: string; id?: string; name?: string; specialization?: string } | string;
  doctor?: { _id?: string; id?: string; name?: string; specialization?: string };
  date?: string;
  timeSlot?: string;
  time?: string;
  status?: string;
  consultationType?: string;
  [key: string]: unknown;
};

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function normalizeStatus(status: string | undefined): string {
  return (status || 'PENDING').toUpperCase();
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function consultationIcon(type: string | undefined) {
  switch ((type || '').toUpperCase()) {
    case 'VIDEO':
      return <Video className="h-4 w-4" />;
    case 'AUDIO':
      return <Phone className="h-4 w-4" />;
    case 'CHAT':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Video className="h-4 w-4" />;
  }
}

function getDoctorMeta(appointment: AppointmentItem) {
  const doctor =
    (typeof appointment.doctorId === 'object' ? appointment.doctorId : undefined) ||
    appointment.doctor;

  return {
    name: doctor?.name || 'Doctor',
    specialization: doctor?.specialization || 'General',
  };
}

function AppointmentCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
      <div className="mb-2 h-5 w-40 rounded bg-gray-200" />
      <div className="mb-4 h-4 w-28 rounded bg-gray-200" />
      <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
      <div className="mb-4 h-4 w-24 rounded bg-gray-200" />
      <div className="h-9 w-36 rounded bg-gray-200" />
    </div>
  );
}

export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const appointments = useAppointmentStore((state) => state.appointments as AppointmentItem[]);
  const isLoading = useAppointmentStore((state) => state.isLoading);
  const error = useAppointmentStore((state) => state.error);
  const fetchMyAppointments = useAppointmentStore((state) => state.fetchMyAppointments);
  const cancel = useAppointmentStore((state) => state.cancel);

  useEffect(() => {
    void fetchMyAppointments();
  }, [fetchMyAppointments]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    if (activeTab === 'all') return appointments;

    if (activeTab === 'completed') {
      return appointments.filter((item) => normalizeStatus(item.status) === 'COMPLETED');
    }

    if (activeTab === 'cancelled') {
      return appointments.filter((item) => normalizeStatus(item.status) === 'CANCELLED');
    }

    return appointments.filter((item) => {
      const status = normalizeStatus(item.status);
      const appointmentDate = item.date ? new Date(item.date) : null;
      const isFuture = appointmentDate ? appointmentDate >= now : false;
      return (status === 'PENDING' || status === 'CONFIRMED') && isFuture;
    });
  }, [activeTab, appointments]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">My Appointments</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-4">
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-lg font-medium text-gray-900">No appointments yet</p>
            <Link
              to="/doctors"
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Find Doctors
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const id = String(appointment._id || appointment.id || '');
              const { name, specialization } = getDoctorMeta(appointment);
              const status = normalizeStatus(appointment.status);
              const timeSlot = String(appointment.timeSlot || appointment.time || '-');
              const dateText = appointment.date
                ? new Date(appointment.date).toLocaleDateString()
                : '-';

              return (
                <div
                  key={id || `${name}-${dateText}-${timeSlot}`}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-500">{specialization}</p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{dateText}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {consultationIcon(appointment.consultationType as string | undefined)}
                      <span>{String(appointment.consultationType || 'VIDEO')}</span>
                    </div>
                  </div>

                  {status === 'PENDING' && id ? (
                    <button
                      type="button"
                      onClick={() => void cancel(id, 'Patient cancelled')}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
