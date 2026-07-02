import React, { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI } from '../services/api';

function PatientAppointmentsPage({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const userIdNumber = Number(userId);
        const patientRes = await patientAPI.getByUserId(userId).catch(() => ({ data: null }));
        const resolvedPatientId = Number(patientRes.data?.id || userId);

        let appointmentsRes = await appointmentAPI.getByPatient(resolvedPatientId).catch(() => ({ data: [] }));
        if ((appointmentsRes.data || []).length === 0 && resolvedPatientId !== userIdNumber) {
          const fallbackRes = await appointmentAPI.getByPatient(userIdNumber).catch(() => ({ data: [] }));
          if ((fallbackRes.data || []).length > 0) {
            appointmentsRes = fallbackRes;
          }
        }
        setAppointments(appointmentsRes.data || []);
      } catch (error) {
        console.error('Error loading patient appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [userId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your appointments...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>My Appointments</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Your booked appointments appear below.</p>

      {appointments.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          No appointments found for this account.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#2c3e50', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Doctor</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '16px' }}>{apt.id}</td>
                  <td style={{ padding: '16px' }}>{apt.date}</td>
                  <td style={{ padding: '16px' }}>{apt.time}</td>
                  <td style={{ padding: '16px' }}>{apt.doctorName || `Doctor ${apt.doctorId}`}</td>
                  <td style={{ padding: '16px' }}>{apt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientAppointmentsPage;
