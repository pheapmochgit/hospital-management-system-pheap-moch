import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorsPage from './pages/DoctorsPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ReportsPage from './pages/ReportsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import ProfilePage from './pages/ProfilePage';
import DoctorSchedulePage from './pages/DoctorSchedulePage';
import DoctorPatientsPage from './pages/DoctorPatientsPage';
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage';
import DoctorRecordsPage from './pages/DoctorRecordsPage';
import DoctorPrescriptionsPage from './pages/DoctorPrescriptionsPage';
import PatientAppointmentsPage from './pages/PatientAppointmentsPage';
import PatientReportsPage from './pages/PatientReportsPage';
import PatientRecordsPage from './pages/PatientRecordsPage';
import PatientDoctorsPage from './pages/PatientDoctorsPage';
import PatientPrescriptionsPage from './pages/PatientPrescriptionsPage';
import AdminLayout from './components/AdminLayout';
import { normalizeRole, getDashboardPath } from './utils/roleUtils';
import { getStoredUser, persistUser, clearStoredUser } from './utils/authSession';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = getStoredUser();
    if (!storedUser) return null;
    return {
      ...storedUser,
      role: normalizeRole(storedUser?.role),
    };
  });

  const handleLogin = (userData) => {
    const normalizedUser = {
      ...userData,
      role: normalizeRole(userData?.role),
    };
    setUser(normalizedUser);
    persistUser(normalizedUser);
  };

  const handleLogout = () => {
    setUser(null);
    clearStoredUser();
  };

  const normalizedRole = user ? normalizeRole(user.role) : null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/doctor-profile/:id" element={<DoctorProfilePage />} />
        <Route path="/book-appointment/:doctorId?" element={<BookAppointmentPage user={user} />} />

        {user && normalizedRole === 'ADMIN' && (
          <Route path="/admin/*" element={
            <AdminLayout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<AdminDashboard user={user} />} />
                <Route path="/profile" element={<ProfilePage user={user} onUpdateUser={handleLogin} />} />
                <Route path="/doctors" element={<DoctorsPage user={user} />} />
                <Route path="/patients" element={<PatientsPage user={user} />} />
                <Route path="/appointments" element={<AppointmentsPage user={user} />} />
                <Route path="/departments" element={<DepartmentsPage user={user} />} />
                <Route path="/reports" element={<ReportsPage user={user} />} />
              </Routes>
            </AdminLayout>
          } />
        )}

        {user && normalizedRole === 'DOCTOR' && (
          <Route path="/doctor/*" element={
            <AdminLayout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<DoctorDashboard user={user} />} />
                <Route path="profile" element={<ProfilePage user={user} onUpdateUser={handleLogin} />} />
                <Route path="schedule" element={<DoctorSchedulePage user={user} />} />
                <Route path="patients" element={<DoctorPatientsPage user={user} />} />
                <Route path="appointments" element={<DoctorAppointmentsPage user={user} />} />
                <Route path="records" element={<DoctorRecordsPage user={user} />} />
                <Route path="prescriptions" element={<DoctorPrescriptionsPage user={user} />} />
              </Routes>
            </AdminLayout>
          } />
        )}

        {user && normalizedRole === 'PATIENT' && (
          <Route path="/patient/*" element={
            <AdminLayout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<PatientDashboard user={user} />} />
                <Route path="profile" element={<ProfilePage user={user} onUpdateUser={handleLogin} />} />
                <Route path="appointments" element={<PatientAppointmentsPage user={user} />} />
                <Route path="reports" element={<PatientReportsPage user={user} />} />
                <Route path="records" element={<PatientRecordsPage user={user} />} />
                <Route path="doctors" element={<PatientDoctorsPage user={user} />} />
                <Route path="prescriptions" element={<PatientPrescriptionsPage user={user} />} />
              </Routes>
            </AdminLayout>
          } />
        )}

        <Route path="/*" element={user ? <Navigate to={getDashboardPath(normalizedRole)} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
