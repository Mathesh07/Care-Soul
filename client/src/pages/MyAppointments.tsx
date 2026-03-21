import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, X, CheckCircle, AlertCircle } from 'lucide-react';
import { appointmentService } from '../services/appointmentService';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  location: string;
}

interface Appointment {
  _id: string;
  doctorId: Doctor;
  date: string;
  time: string;
  status: 'Booked' | 'Cancelled' | 'Completed';
  notes: string;
  createdAt: string;
}

const MyAppointments = () => {
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments();
      if (response.success) {
        setAppointments(response.data);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      setError('');
      
      const response = await appointmentService.cancelAppointment(appointmentId);
      
      if (response.success) {
        fetchAppointments();
      } else {
        setError(response.message || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error cancelling appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Booked':
        return 'bg-blue-100 text-blue-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Booked':
        return <Calendar className="h-4 w-4" />;
      case 'Cancelled':
        return <X className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <button
            onClick={() => navigate('/doctors')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Book New Appointment
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">You haven't booked any appointments yet</p>
            <button
              onClick={() => navigate('/doctors')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{appointment.status}</span>
                    </div>
                  </div>

                  {/* Doctor Information */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {appointment.doctorId.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{appointment.doctorId.specialization}</p>
                    <div className="flex items-center text-gray-600 text-sm mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {appointment.doctorId.location}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{appointment.time}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    {appointment.status === 'Booked' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancellingId === appointment._id}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel Appointment'}
                      </button>
                    )}
                    
                    {appointment.status === 'Cancelled' && (
                      <button
                        onClick={() => navigate(`/book-appointment/${appointment.doctorId._id}`)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                      >
                        Book Again
                      </button>
                    )}
                    
                    {appointment.status === 'Completed' && (
                      <button
                        onClick={() => navigate(`/book-appointment/${appointment.doctorId._id}`)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                      >
                        Book Another Appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
