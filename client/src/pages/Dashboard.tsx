import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Clock, Stethoscope, Activity, LogOut, Edit, Home } from 'lucide-react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { appointmentService } from '../services/appointmentService';
import { Navbar } from '../components/ui/navbar';
import ApiTest from '../components/ApiTest';

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
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    const userData = authService.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
    fetchRecentAppointments();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setUser(response.data);
        setProfileData({
          name: response.data.name,
          phone: response.data.phone || ''
        });
      }
    } catch (err) {
      setError('Error fetching user data');
    }
  };

  const fetchRecentAppointments = async () => {
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      const response = await userService.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data);
        setEditingProfile(false);
        authService.setAuthData(authService.getToken()!, response.data);
      } else {
        setError('Failed to update profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Test Component for Debugging */}
        <div className="mb-8">
          <ApiTest />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>

              {editingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileData({
                          name: user?.name || '',
                          phone: user?.phone || ''
                        });
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  
                  {user?.phone && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {user.phone}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Member since:</span> {formatDate(user?.createdAt || '')}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">Total Appointments</span>
                  </div>
                  <span className="font-semibold text-gray-900">{appointments.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Upcoming</span>
                  </div>
                  <span className="font-semibold text-gray-900">{getUpcomingAppointments()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/doctors')}
                  className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Find Doctors
                </button>
                
                <button
                  onClick={() => navigate('/my-appointments')}
                  className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  My Appointments
                </button>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
                <button
                  onClick={() => navigate('/my-appointments')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View All
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                  <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                  <button
                    onClick={() => navigate('/doctors')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Find a Doctor
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.doctorId.name}</h4>
                          <p className="text-sm text-gray-600">{appointment.doctorId.specialization}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(appointment.date)}
                            <Clock className="h-4 w-4 ml-3 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'Booked' ? 'bg-blue-100 text-blue-700' :
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
