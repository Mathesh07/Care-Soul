import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Stethoscope, Activity, LogOut, Home, TrendingUp, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { appointmentService } from '../services/appointmentService';
import { Navbar } from '../components/ui/navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
  };
  date: string;
  time: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = authService.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      if (response.success) {
        setAppointments(response.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUpcomingAppointments = () => {
    return appointments.filter(apt => 
      apt.status === 'Booked' && new Date(apt.date) >= new Date()
    ).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 mb-8 shadow-premium-md">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80 font-semibold mb-3">Patient Overview</p>
              <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-base md:text-lg text-foreground/70 mt-2">Track appointments, health activities, and emergency actions from one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" onClick={() => navigate('/patient/doctors')}>
                <Calendar className="h-4 w-4" />
                Book Appointment
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/patient/emergency')}>
                <Activity className="h-4 w-4" />
                Emergency
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="lg:col-span-1 border-border/60 shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Total Appointments</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{appointments.length}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 border-border/60 shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Upcoming</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{getUpcomingAppointments()}</p>
                </div>
                <div className="p-3 bg-accent/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 border-border/60 shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/60">Member Since</p>
                  <p className="text-lg font-bold text-foreground mt-2">{new Date(user?.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
                </div>
                <div className="p-3 bg-secondary/40 rounded-xl">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Appointments Section */}
          <div className="lg:col-span-2">
            <Card className="border-border/60 shadow-premium-sm">
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Your last 3 appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <ul className="space-y-4">
                    {appointments.map(apt => (
                      <li key={apt._id} className="flex items-center justify-between p-4 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors duration-200">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-xl">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Dr. {apt.doctorId.name}</p>
                            <p className="text-sm text-foreground/70">{apt.doctorId.specialization}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{formatDate(apt.date)}</p>
                          <p className="text-xs text-foreground/60">{apt.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-foreground/60 py-8">No appointments yet.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/patient/my-appointments')}>
                  View All Appointments
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
