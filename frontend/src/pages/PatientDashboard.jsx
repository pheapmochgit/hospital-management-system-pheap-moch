import React, { useState, useEffect, useMemo } from 'react';
import { appointmentAPI, reportAPI, patientAPI } from '../services/api';
import { getDisplayName } from '../utils/userDisplay';

function PatientDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [patientRecord, setPatientRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  const profileDisplay = useMemo(
    () => ({
      dateOfBirth: patientRecord?.dateOfBirth || user.dateOfBirth || 'Not provided',
      gender: patientRecord?.gender || user.gender || 'Not provided',
      bloodGroup: patientRecord?.bloodGroup || user.bloodGroup || 'Not provided',
    }),
    [patientRecord, user.dateOfBirth, user.gender, user.bloodGroup]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const patientRes = await patientAPI.getByUserId(userId).catch(() => ({ data: null }));
        const patient = patientRes.data;
        setPatientRecord(patient || null);
        const patientId = patient?.id ? Number(patient.id) : null;

        let patientAppointments = [];
        let patientReports = [];

        if (patientId) {
          const [appointmentsRes, reportsRes] = await Promise.all([
            appointmentAPI.getByPatient(patientId).catch(() => ({ data: [] })),
            reportAPI.getByPatient(patientId).catch(() => ({ data: [] })),
          ]);

          patientAppointments = appointmentsRes.data || [];
          patientReports = reportsRes.data || [];
        }

        setAppointments(patientAppointments.slice(0, 5));
        setReports(patientReports.slice(0, 5));
      } catch (error) {
        console.error('Error loading patient dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading patient dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-topbar">
        <div className="dashboard-topbar-content">
          <div>
            <p className="dashboard-hero-subtitle">Patient panel</p>
            <h1 className="dashboard-hero-title">Welcome, {patientRecord?.name || getDisplayName(user)}</h1>
            <p className="dashboard-hero-copy">View your latest summary and appointments.</p>
          </div>
        </div>
      </section>

      <section className="dashboard-summary-grid" style={{ marginTop: '18px' }}>
        {[
          { label: 'Date of Birth', value: profileDisplay.dateOfBirth },
          { label: 'Gender', value: profileDisplay.gender },
          { label: 'Blood Group', value: profileDisplay.bloodGroup },
          { label: 'Appointments', value: appointments.length },
          { label: 'Reports', value: reports.length },
        ].map((item) => (
          <div key={item.label} className="dashboard-card">
            <div className="dashboard-card-head">
              <p className="dashboard-card-label">{item.label}</p>
            </div>
            <p className="dashboard-card-value">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="dashboard-section dashboard-table-section" style={{ marginTop: '20px' }}>
        <div className="dashboard-section-header">
          <div>
            <h2>Recent Appointments</h2>
            <p className="dashboard-section-copy">Your latest appointments are listed below.</p>
          </div>
          <span className="dashboard-section-count">{appointments.length} shown</span>
        </div>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.id}</td>
                  <td>{apt.date || '-'}</td>
                  <td>{apt.time || '-'}</td>
                  <td>
                    <span className={`dashboard-badge ${apt.status?.toLowerCase() || ''}`}>{apt.status || 'Unknown'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default PatientDashboard;
