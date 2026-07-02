import React, { useState, useEffect, useCallback } from 'react';
import { appointmentAPI, doctorAPI, patientAPI } from '../services/api';

function DoctorAppointmentsPage({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadAppointments = useCallback(async () => {
    try {
      const doctorRes = await doctorAPI.getByUserId(user.id).catch(() => ({ data: null }));
      const doctorRecord = doctorRes.data;
      const doctorId = doctorRecord?.id;

      if (!doctorId) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      const [appointmentsRes, patientsRes] = await Promise.all([
        appointmentAPI.getByDoctor(doctorId).catch(() => ({ data: [] })),
        patientAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const patients = (patientsRes.data || []).reduce((map, patient) => {
        const label = patient.name || patient.email || `Patient ${patient.id}`;
        if (patient.id != null) map[patient.id] = label;
        if (patient.userId != null) map[patient.userId] = label;
        return map;
      }, {});

      setPatientMap(patients);
      setAppointments(appointmentsRes.data || []);
    } catch (error) {
      console.error('Error loading doctor appointments:', error);
    }
  }, [user.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadAppointments();
      setLoading(false);
    };

    loadData();
  }, [loadAppointments]);

  const handleAppointmentAction = async (appointmentId, status) => {
    setActionLoading(true);
    setMessage('');
    try {
      await appointmentAPI.update(appointmentId, { status });
      setMessage(`Appointment ${status === 'SCHEDULED' ? 'accepted' : 'rejected'} successfully.`);
      await loadAppointments();
      window.dispatchEvent(new Event('doctorAppointmentsUpdated'));
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setMessage('Failed to update appointment status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading appointments...</div>;

  const getWhenLabel = (dateString) => {
    const today = new Date().toISOString().slice(0, 10);
    if (dateString === today) return 'Today';
    if (dateString > today) return 'Upcoming';
    return 'Past';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>Doctor Appointments</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Appointments assigned to you as the logged-in doctor.</p>

      {message && <div style={{ background: '#e8f0fe', color: '#1e3a8a', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px' }}>{message}</div>}
      {appointments.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          No appointments found for your account.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#2c3e50', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Patient</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>When</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Reason</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '16px' }}>{apt.id}</td>
                  <td style={{ padding: '16px' }}>{patientMap[apt.patientId] || `Patient ${apt.patientId}`}</td>
                  <td style={{ padding: '16px' }}>{apt.date}</td>
                  <td style={{ padding: '16px' }}>{apt.time}</td>
                  <td style={{ padding: '16px' }}>{getWhenLabel(apt.date)}</td>
                  <td style={{ padding: '16px' }}>{apt.reason}</td>
                  <td style={{ padding: '16px' }}>{apt.status}</td>
                  <td style={{ padding: '16px' }}>
                    {apt.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleAppointmentAction(apt.id, 'SCHEDULED')}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          Accept
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleAppointmentAction(apt.id, 'CANCELLED')}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span>{apt.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointmentsPage;
