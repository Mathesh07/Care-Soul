import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, X, CheckCircle, AlertCircle, Loader, Video } from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
import { Navbar } from '../components/ui/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

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
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'Cancelled':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      case 'Completed':
        return 'bg-green-500/10 text-green-600 border border-green-500/20';
      default:
        return 'bg-foreground/5 text-foreground/70 border border-border/50';
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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'Booked' && new Date(apt.date) >= new Date()
  );
  
  const pastAppointments = appointments.filter(apt => 
    apt.status !== 'Booked' || new Date(apt.date) < new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
            <Loader className="h-8 w-8 text-primary animate-spin" />
          </div>
          <p className="text-foreground/70 font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Appointments</h1>
            <p className="text-foreground/60 mt-2">Manage and track all your healthcare appointments</p>
          </div>
          <Button onClick={() => navigate('/doctors')} size="lg" className="gap-2">
            <Calendar className="h-4 w-4" />
            Book New
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError('')} className="text-destructive hover:text-destructive/80 font-bold">×</button>
          </div>
        )}

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-accent/10 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-foreground/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No appointments found</h3>
              <p className="text-foreground/60 mb-6">You haven't booked any appointments yet</p>
              <Button onClick={() => navigate('/doctors')}>Find a Doctor</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-8 bg-primary rounded-full"/>
                  <h2 className="text-2xl font-bold text-foreground">Upcoming</h2>
                  <span className="text-sm font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {upcomingAppointments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment._id}
                      appointment={appointment}
                      onCancel={handleCancelAppointment}
                      onBook={() => navigate(`/book-appointment/${appointment.doctorId._id}`)}
                      onJoinCall={() => navigate(`/consultation/${appointment._id}`)}
                      isCancelling={cancellingId === appointment._id}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-8 bg-foreground/30 rounded-full"/>
                  <h2 className="text-2xl font-bold text-foreground">Past</h2>
                  <span className="text-sm font-semibold px-3 py-1 bg-foreground/5 text-foreground/70 rounded-full">
                    {pastAppointments.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment._id}
                      appointment={appointment}
                      onCancel={handleCancelAppointment}
                      onBook={() => navigate(`/book-appointment/${appointment.doctorId._id}`)}
                      onJoinCall={() => navigate(`/consultation/${appointment._id}`)}
                      isCancelling={cancellingId === appointment._id}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function AppointmentCard({
  appointment,
  onCancel,
  onBook,
  onJoinCall,
  isCancelling,
  getStatusColor,
  getStatusIcon,
  formatDate
}: {
  appointment: Appointment;
  onCancel: (id: string) => void;
  onBook: () => void;
  onJoinCall: () => void;
  isCancelling: boolean;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  formatDate: (date: string) => string;
}) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <div className={`flex items-center w-fit gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            <span>{appointment.status}</span>
          </div>
        </div>

        <div className="flex-1 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-1">
            {appointment.doctorId.name}
          </h3>
          <p className="text-sm text-foreground/60 font-medium mb-3">{appointment.doctorId.specialization}</p>
          
          <div className="flex items-center gap-2 text-sm text-foreground/70 mb-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-primary/60" />
            {appointment.doctorId.location}
          </div>
        </div>

        <div className="space-y-2 mb-4 py-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <span className="text-sm font-medium text-foreground">{appointment.time}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="mb-4 p-3 bg-foreground/5 rounded-lg">
            <p className="text-xs text-foreground/60 font-semibold uppercase mb-1">Notes</p>
            <p className="text-sm text-foreground/70">{appointment.notes}</p>
          </div>
        )}
      </CardContent>

      <div className="border-t border-border/50 p-4 space-y-2">
        {appointment.status === 'Booked' && (
          <>
            <Button
              onClick={onJoinCall}
              className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              <Video className="h-4 w-4" />
              Join Video Call
            </Button>
            <Button
              onClick={() => onCancel(appointment._id)}
              disabled={isCancelling}
              variant="destructive"
              className="w-full"
            >
              {isCancelling ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : 'Cancel Appointment'}
            </Button>
          </>
        )}
        
        {(appointment.status === 'Cancelled' || appointment.status === 'Completed') && (
          <Button onClick={onBook} className="w-full">
            {appointment.status === 'Cancelled' ? 'Book Again' : 'Book Another'}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default MyAppointments;
