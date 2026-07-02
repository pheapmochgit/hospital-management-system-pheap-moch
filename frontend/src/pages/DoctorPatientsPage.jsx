import React, { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI, patientAPI } from '../services/api';

function DoctorPatientsPage({ user }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        if (!user?.id) {
          setPatients([]);
          setLoading(false);
          return;
        }

        const normalizeId = (id) => String(id ?? '');
        const doctorRes = await doctorAPI.getAll();
        const doctorRecord = (doctorRes.data || []).find((doc) => normalizeId(doc.userId) === normalizeId(user.id) || normalizeId(doc.user_id) === normalizeId(user.id));
        const doctorId = doctorRecord?.id;

        if (!doctorId) {
          setPatients([]);
          setLoading(false);
          return;
        }

        const appointments = await appointmentAPI.getByDoctor(doctorId).catch(() => ({ data: [] }));
        const uniquePatientIds = [...new Set((appointments.data || []).map((apt) => apt.patientId))];
        const patientsRes = await patientAPI.getAll().catch(() => ({ data: [] }));
        const patientMap = (patientsRes.data || []).reduce((map, patient) => {
          map[patient.id] = patient;
          return map;
        }, {});

        const appointmentCount = (appointments.data || []).reduce((count, apt) => {
          count[apt.patientId] = (count[apt.patientId] || 0) + 1;
          return count;
        }, {});

        const patientList = uniquePatientIds.map((id) => ({
          ...(patientMap[id] || { id, name: `Patient ${id}` }),
          appointmentCount: appointmentCount[id] || 0,
        }));
        setPatients(patientList);
      } catch (error) {
        console.error('Error loading doctor patients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [user.id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading patients...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>My Patients</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Patients assigned to your care via appointments.</p>

      {patients.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d' }}>
          No patients are assigned to your account yet.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#2c3e50', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>Patient ID</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Visits</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '16px' }}>{patient.id}</td>
                  <td style={{ padding: '16px' }}>{patient.name || patient.email || `Patient ${patient.id}`}</td>
                  <td style={{ padding: '16px' }}>{patient.appointmentCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DoctorPatientsPage;
