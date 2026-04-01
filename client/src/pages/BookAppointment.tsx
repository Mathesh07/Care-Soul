import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, Star, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Stethoscope } from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import { Navbar } from '../components/ui/navbar';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  location: string;
  availableSlots: string[];
  experience?: string;
  rating?: number;
}

const BookAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const normalizeTimeSlot = (slot: string) => {
    const trimmed = slot.trim();
    if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return trimmed;
    const hour = Number(match[1]);
    const minute = match[2];
    const period = match[3].toUpperCase();
    const normalizedHour = period === 'PM'
      ? (hour === 12 ? 12 : hour + 12)
      : (hour === 12 ? 0 : hour);
    return `${String(normalizedHour).padStart(2, '0')}:${minute}`;
  };

  const isSlotInPast = (slot: string) => {
    if (!selectedDate) return false;
    const normalized = normalizeTimeSlot(slot);
    if (!/^\d{2}:\d{2}$/.test(normalized)) return false;
    const [h, m] = normalized.split(':').map(Number);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (selectedDate !== todayStr) return false;
    const slotTime = new Date(now);
    slotTime.setHours(h, m, 0, 0);
    return slotTime < now;
  };

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getDoctorById(doctorId!);
      if (response.success) {
        setDoctor(response.data);
      } else {
        setError('Doctor not found');
      }
    } catch (err) {
      setError('Error fetching doctor details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');
      
      const appointmentData = {
        doctorId: doctorId!,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim()
      };

      const response = await appointmentService.createAppointment(appointmentData);
      
      if (response.success) {
        setSuccess('Appointment booked successfully!');
        setTimeout(() => {
          navigate('/my-appointments');
        }, 2000);
      } else {
        setError(response.message || 'Failed to book appointment');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error booking appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Doctor not found</h3>
          <button
            onClick={() => navigate('/doctors')}
            className="text-primary hover:text-primary/80"
          >
            Back to doctor list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/doctors')}
          className="flex items-center text-foreground/70 hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Book Appointment</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Information */}
          <div className="bg-card border border-border/60 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Doctor Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-foreground/40 mr-3 mt-1" />
                <div>
                  <p className="font-medium text-foreground">{doctor.name}</p>
                  <p className="text-foreground/70">{doctor.specialization}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-foreground/40 mr-3" />
                <span className="text-foreground/70">{doctor.location}</span>
              </div>
              
              {doctor.experience && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-foreground/40 mr-3" />
                  <span className="text-foreground/70">{doctor.experience} experience</span>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-foreground/80 mb-2">Available Time Slots:</p>
                <div className="grid grid-cols-3 gap-2">
                  {doctor.availableSlots.map((slot, index) => (
                    <div key={index} className="bg-foreground/5 text-foreground/70 text-xs px-2 py-1 rounded text-center">
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-card border border-border/60 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Booking Details</h2>
            
            <form onSubmit={handleBooking} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Select Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                >
                  <option value="">Select a time slot</option>
                  {doctor.availableSlots.map((slot, index) => (
                    <option
                      key={index}
                      value={normalizeTimeSlot(slot)}
                      disabled={isSlotInPast(slot)}
                    >
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Any symptoms or specific concerns..."
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
