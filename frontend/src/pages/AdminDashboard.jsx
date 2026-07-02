import { useCallback, useEffect, useState } from 'react';
import { appointmentAPI, authAPI, departmentAPI, doctorAPI, patientAPI, reportAPI } from '../services/api';
import { getDisplayName } from '../utils/userDisplay';

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalDepartments: 0,
    totalAppointments: 0,
    totalReports: 0,
  });
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersCountRes, doctorsCountRes, patientsCountRes, departmentsCountRes, appointmentsCountRes, reportsCountRes, doctorsRes, appointmentsRes] = await Promise.all([
        authAPI.getCount(),
        doctorAPI.getCount(),
        patientAPI.getCount(),
        departmentAPI.getCount(),
        appointmentAPI.getCount(),
        reportAPI.getCount(),
        doctorAPI.getAll(),
        appointmentAPI.getAll(),
      ]);

      setStats({
        totalUsers: usersCountRes.data || 0,
        totalDoctors: doctorsCountRes.data || 0,
        totalPatients: patientsCountRes.data || 0,
        totalDepartments: departmentsCountRes.data || 0,
        totalAppointments: appointmentsCountRes.data || 0,
        totalReports: reportsCountRes.data || 0,
      });

      setRecentDoctors((doctorsRes.data || []).slice(-5).reverse());
      setRecentAppointments((appointmentsRes.data || []).slice(-10).reverse());
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleFocus = () => {
      loadDashboardData();
    };

    const handleCountsUpdated = () => {
      loadDashboardData();
    };

    const handleStorage = (event) => {
      if (event.key === 'dashboardCountsUpdated') {
        loadDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('dashboardCountsUpdated', handleCountsUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('dashboardCountsUpdated', handleCountsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadDashboardData]);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const welcomeName = getDisplayName(user);

  return (
    <div className="dashboard-page">
      <section className="dashboard-topbar">
        <div className="dashboard-topbar-content">
          <div>
            <p className="dashboard-hero-subtitle">Admin panel</p>
            <h1 className="dashboard-hero-title">Welcome, {welcomeName}</h1>
            <p className="dashboard-hero-copy">Manage doctors, patients, appointments, departments and reports from a central.</p>
          </div>

          <div className="dashboard-actions">
            <button type="button" className="dashboard-button dashboard-button-secondary" onClick={loadDashboardData}>
              Refresh counts
            </button>
            <button
              type="button"
              className="dashboard-button dashboard-button-danger"
              disabled={resetting}
              onClick={async () => {
                if (!window.confirm('Reset all non-admin data and preserve admin access?')) return;
                setResetting(true);
                setResetMessage('');
                try {
                  await authAPI.resetData();
                  await loadDashboardData();
                  setResetMessage('Application data has been reset successfully.');
                } catch (error) {
                  console.error('Reset failed:', error);
                  setResetMessage('Reset failed. See console for details.');
                } finally {
                  setResetting(false);
                }
              }}
            >
              { ' Reset app data'}
            </button>
          </div>
        </div>

      </section>

      {resetMessage && <div className="dashboard-notice">{resetMessage}</div>}

      <section className="dashboard-summary-grid">
        {[
          { label: 'All users', value: stats.totalUsers, accent: '#2563eb' },
          { label: 'Doctors', value: stats.totalDoctors, accent: '#0ea5e9' },
          { label: 'Patients', value: stats.totalPatients, accent: '#16a34a' },
          { label: 'Appointments', value: stats.totalAppointments, accent: '#f97316' },
          { label: 'Departments', value: stats.totalDepartments, accent: '#8b5cf6' },
          { label: 'Reports', value: stats.totalReports, accent: '#0f766e' },
        ].map((item) => (
          <div key={item.label} className="dashboard-card">
            <div className="dashboard-card-head">
              <p className="dashboard-card-label">{item.label}</p>
              <div className="dashboard-pill" style={{ backgroundColor: `${item.accent}15`, color: item.accent }}>{item.label.charAt(0)}</div>
            </div>
            <p className="dashboard-card-value">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-section dashboard-table-section">
          <div className="dashboard-section-header">
            <div>
              <h2>Recent doctors</h2>
              <p className="dashboard-section-copy">Latest doctor records and experience summary.</p>
            </div>
            <span className="dashboard-section-count">{recentDoctors.length} shown</span>
          </div>

          {recentDoctors.length === 0 ? (
            <div className="dashboard-empty">No doctors registered yet.</div>
          ) : (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Experience</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>{doctor.id}</td>
                      <td>{doctor.name || `Doctor ${doctor.id}`}</td>
                      <td>{doctor.departmentName || doctor.departmentId || 'Unassigned'}</td>
                      <td>{doctor.experience != null ? `${doctor.experience} yrs` : 'Not set'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section dashboard-table-section">
          <div className="dashboard-section-header">
            <div>
              <h2>Recent appointments</h2>
              <p className="dashboard-section-copy">Latest appointment activity from your hospital system.</p>
            </div>
            <span className="dashboard-section-count">{recentAppointments.length} shown</span>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="dashboard-empty">No recent appointments found.</div>
          ) : (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>
                      <td>{appointment.patientName || `Patient ${appointment.patientId || '-'}`}</td>
                      <td>{appointment.doctorName || `Doctor ${appointment.doctorId || '-'}`}</td>
                      <td>{appointment.date || '-'}</td>
                      <td>{appointment.time || '-'}</td>
                      <td>
                        <span className={`dashboard-badge ${appointment.status?.toLowerCase() || ''}`}>{appointment.status || 'Unknown'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
