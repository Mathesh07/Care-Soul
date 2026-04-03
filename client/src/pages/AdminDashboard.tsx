import { useState, useEffect } from 'react';
import { Users, Calendar, Activity, AlertTriangle, CheckCircle, Trash2, Check, X, Stethoscope } from 'lucide-react';
import AdminNavbar from '../components/admin/admin-navbar';
import { adminService } from '../services/adminService';

// TypeScript interfaces define the "shape" of data
interface Stats {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  activeEmergencies: number;
  recentUsers: User[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  yearsOfExperience: number;
  address: string;
  isDocterVerifiedByAdmin: boolean;
  doctorVerificationRequestDate: string;
  accountStatus: string;
}

interface Appointment {
  _id: string;
  userId: { name: string; email: string };
  doctorId: { name: string; specialization: string };
  date: string;
  time: string;
  status: string;
}

const AdminDashboard = () => {
  // State for each tab's data
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'appointments' | 'doctor-verification'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [verificationNotes, setVerificationNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadStats();
  }, []);

  // Load different data based on active tab
  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'appointments') loadAppointments();
    if (activeTab === 'doctor-verification') loadDoctorVerification();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const response = await adminService.getStats();
      if (response.success) setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      if (response.success) setUsers(response.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await adminService.getAllAppointments();
      if (response.success) setAppointments(response.data);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  const loadDoctorVerification = async () => {
    try {
      const [pendingRes, verifiedRes] = await Promise.all([
        adminService.getPendingDoctors(),
        adminService.getVerifiedDoctors()
      ]);
      if (pendingRes.success) setPendingDoctors(pendingRes.data);
      if (verifiedRes.success) setVerifiedDoctors(verifiedRes.data);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const handleApproveDoctor = async (doctorId: string) => {
    try {
      const notes = verificationNotes[doctorId] || '';
      await adminService.approveDoctor(doctorId, notes);
      // Reload doctor verification data
      await loadDoctorVerification();
      alert('Doctor approved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve doctor');
    }
  };

  const handleRejectDoctor = async (doctorId: string) => {
    const reason = rejectionReason[doctorId];
    if (!reason) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await adminService.rejectDoctor(doctorId, reason);
      // Reload doctor verification data
      await loadDoctorVerification();
      alert('Doctor rejected successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject doctor');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(userId);
      // Remove from local state (no need to refetch)
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'overview' || tab === 'users' || tab === 'appointments' || tab === 'doctor-verification') {
      setActiveTab(tab);
    }
  };

  // Tab button component
  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon?: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
        activeTab === id 
          ? 'border-primary text-primary' 
          : 'border-transparent text-foreground/60 hover:text-foreground'
      }`}
    >
      {Icon && <span>{Icon}</span>}
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AdminNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="border-b border-border mb-6 flex gap-4 overflow-x-auto">
          <TabButton id="overview" label="Overview" />
          <TabButton id="users" label="Users" />
          <TabButton id="appointments" label="Appointments" />
          <TabButton id="doctor-verification" label="Doctor Verification" icon={<Stethoscope className="h-4 w-4" />} />
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Each card shows one stat */}
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
                { label: 'Total Doctors', value: stats.totalDoctors, icon: Activity, color: 'green' },
                { label: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: 'purple' },
                { label: 'Active Emergencies', value: stats.activeEmergencies, icon: AlertTriangle, color: 'red' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card rounded-lg p-4 shadow-sm border border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground/60">{label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
                    </div>
                    <Icon className={`h-8 w-8 text-${color}-500`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Users Table */}
            <div className="bg-card rounded-lg shadow-sm border border-border/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Recent Registrations</h2>
              </div>
              <table className="w-full">
                <thead className="bg-foreground/5">
                  <tr>
                    {['Name', 'Email', 'Joined'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {stats.recentUsers.map(user => (
                    <tr key={user._id} className="hover:bg-foreground/5">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground/70">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-foreground/70">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-card rounded-lg shadow-sm border border-border/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">All Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-foreground/5">
                  <tr>
                    {['Name', 'Email', 'Role', 'Verified', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-foreground/5">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground/70">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isVerified 
                          ? <CheckCircle className="h-5 w-5 text-green-500" />
                          : <span className="text-foreground/50 text-sm">Pending</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCTOR VERIFICATION TAB */}
        {activeTab === 'doctor-verification' && (
          <div className="space-y-6">
            {/* Pending Doctors Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Pending Doctor Applications ({pendingDoctors.length})
                </h2>
              </div>
              {pendingDoctors.length === 0 ? (
                <div className="px-6 py-8 text-center text-foreground/60">
                  <p>No pending doctor applications</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-foreground/5">
                      <tr>
                        {['Name', 'Email', 'Phone', 'Specialization', 'Experience', 'Applied On', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {pendingDoctors.map(doctor => (
                        <tr key={doctor._id} className="hover:bg-foreground/5">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{doctor.name}</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">{doctor.email}</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">{doctor.phone}</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">{doctor.specialization}</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">{doctor.yearsOfExperience} years</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">
                            {new Date(doctor.doctorVerificationRequestDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveDoctor(doctor._id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center gap-1 text-xs font-medium"
                                title="Approve doctor"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                              <details className="group">
                                <summary className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium">
                                  <X className="h-3 w-3" /> Reject
                                </summary>
                                <div className="absolute top-full right-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-3 z-10 w-48">
                                  <textarea
                                    placeholder="Rejection reason..."
                                    value={rejectionReason[doctor._id] || ''}
                                    onChange={(e) => setRejectionReason(prev => ({...prev, [doctor._id]: e.target.value}))}
                                    className="w-full px-2 py-1 border border-border rounded text-xs resize-none"
                                    rows={3}
                                  />
                                  <button
                                    onClick={() => handleRejectDoctor(doctor._id)}
                                    className="mt-2 w-full px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                                  >
                                    Confirm Rejection
                                  </button>
                                </div>
                              </details>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Verified Doctors Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-green-50 to-emerald-50">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Verified Doctors ({verifiedDoctors.length})
                </h2>
              </div>
              {verifiedDoctors.length === 0 ? (
                <div className="px-6 py-8 text-center text-foreground/60">
                  <p>No verified doctors yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-foreground/5">
                      <tr>
                        {['Name', 'Email', 'Specialization', 'Experience', 'Verified On'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {verifiedDoctors.map(doctor => (
                        <tr key={doctor._id} className="hover:bg-foreground/5">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{doctor.name}</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">{doctor.email}</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">{doctor.specialization}</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">{doctor.yearsOfExperience} years</td>
                          <td className="px-6 py-4 text-sm text-foreground/70">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;