import { useEffect, useMemo, useState } from 'react';
import { useDoctorStore } from '../../stores/doctorStore';
import { useAppointmentStore } from '../../stores/appointmentStore';

type ConsultationType = 'VIDEO' | 'AUDIO' | 'CHAT';

interface AppointmentBookingFlowProps {
  doctorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function formatDateDisplay(value: string): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

export default function AppointmentBookingFlow({
  doctorId,
  onClose,
  onSuccess,
}: AppointmentBookingFlowProps) {
  const {
    selectedDoctor,
    availableSlots,
    fetchSlots,
    selectDoctor,
  } = useDoctorStore((state) => ({
    selectedDoctor: state.selectedDoctor,
    availableSlots: state.availableSlots,
    fetchSlots: state.fetchSlots,
    selectDoctor: state.selectDoctor,
  }));

  const { book, error: appointmentError } = useAppointmentStore((state) => ({
    book: state.book,
    error: state.error,
  }));

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('VIDEO');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    void selectDoctor(doctorId);
  }, [doctorId, selectDoctor]);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setError(null);

    if (!date) return;

    setIsLoading(true);
    try {
      await fetchSlots(doctorId, date);
    } finally {
      setIsLoading(false);
    }
  };

  const goToConfirm = () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and slot before continuing.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleSubmitBooking = async () => {
    setIsLoading(true);
    setError(null);

    const beforeCount = useAppointmentStore.getState().appointments.length;

    try {
      await book({
        doctorId,
        date: selectedDate,
        timeSlot: selectedSlot,
        symptoms,
        consultationType,
      });

      const afterCount = useAppointmentStore.getState().appointments.length;
      if (afterCount > beforeCount) {
        setCurrentStep(3);
      } else {
        setError(appointmentError || 'Failed to book appointment. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const doctorName = (selectedDoctor?.name as string | undefined) || 'Selected Doctor';
  const doctorFee =
    typeof selectedDoctor?.consultationFee === 'number' ? selectedDoctor.consultationFee : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Book Appointment</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 flex items-center gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 ${currentStep >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              1. Date & Slot
            </span>
            <span className={`rounded-full px-3 py-1 ${currentStep >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              2. Confirm
            </span>
            <span className={`rounded-full px-3 py-1 ${currentStep >= 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              3. Success
            </span>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Select Date</label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => void handleDateChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Available Slots</p>
                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading available slots...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-gray-500">No slots available for selected date.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          selectedSlot === slot
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={goToConfirm}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p><span className="font-medium">Doctor:</span> {doctorName}</p>
                <p><span className="font-medium">Date:</span> {formatDateDisplay(selectedDate)}</p>
                <p><span className="font-medium">Slot:</span> {selectedSlot}</p>
                <p><span className="font-medium">Fee:</span> Rs. {doctorFee}</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Consultation Type</label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="VIDEO">VIDEO</option>
                  <option value="AUDIO">AUDIO</option>
                  <option value="CHAT">CHAT</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Symptoms (optional)</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Describe symptoms..."
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmitBooking()}
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Appointment Booked!</h3>

              <div className="mx-auto max-w-md rounded-lg border border-green-200 bg-green-50 p-4 text-left text-sm text-gray-700">
                <p><span className="font-medium">Doctor:</span> {doctorName}</p>
                <p><span className="font-medium">Date:</span> {formatDateDisplay(selectedDate)}</p>
                <p><span className="font-medium">Slot:</span> {selectedSlot}</p>
                <p><span className="font-medium">Type:</span> {consultationType}</p>
                {symptoms ? <p><span className="font-medium">Symptoms:</span> {symptoms}</p> : null}
              </div>

              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
