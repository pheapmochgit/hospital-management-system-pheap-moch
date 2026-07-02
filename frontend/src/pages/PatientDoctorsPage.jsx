import React, { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI, patientAPI } from '../services/api';

function PatientDoctorsPage({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const userIdNumber = Number(userId);
        const patientRes = await patientAPI.getByUserId(userId).catch(() => ({ data: null }));
        const patientId = Number(patientRes.data?.id || userId);

        let appointmentRes = await appointmentAPI.getByPatient(patientId).catch(() => ({ data: [] }));
        if ((appointmentRes.data || []).length === 0 && patientId !== userIdNumber) {
          const fallbackRes = await appointmentAPI.getByPatient(userIdNumber).catch(() => ({ data: [] }));
          if ((fallbackRes.data || []).length > 0) {
            appointmentRes = fallbackRes;
          }
        }
        const doctorIds = [...new Set((appointmentRes.data || []).map((apt) => apt.doctorId))];

        const doctorsRes = await doctorAPI.getAll().catch(() => ({ data: [] }));
        const patientDoctors = (doctorsRes.data || []).filter((doc) => doctorIds.includes(doc.id));

        setDoctors(patientDoctors);
      } catch (error) {
        console.error('Error loading patient doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [userId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading doctors...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>My Doctors</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Doctors who have appointments with you.</p>

      {doctors.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          No assigned doctors found yet.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#2c3e50', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>Doctor ID</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Qualification</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Experience</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Fee</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '16px' }}>{doctor.id}</td>
                  <td style={{ padding: '16px' }}>{doctor.qualification}</td>
                  <td style={{ padding: '16px' }}>{doctor.experience} years</td>
                  <td style={{ padding: '16px' }}>$ {doctor.consultationFee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientDoctorsPage;
