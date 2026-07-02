import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';

function PatientRecordsPage({ user }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const patientRes = await patientAPI.getByUserId(userId).catch(() => ({ data: null }));
        setPatient(patientRes.data || null);
      } catch (error) {
        console.error('Error loading patient record:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [userId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading health records...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>Health Records</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Your personal health record details are shown below.</p>

      {!patient ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          No patient record found for this account.
        </div>
      ) : (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ color: '#2c3e50', margin: 0, fontSize: '22px' }}>Patient Profile</h2>
            <p style={{ color: '#6b7280', margin: '6px 0 0 0' }}>Verified medical profile information.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            <div style={{ padding: '18px', borderRadius: '12px', background: '#f8fafc' }}>
              <p style={{ margin: '0 0 10px 0', color: '#475569', fontWeight: '700' }}>Record Details</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Medical Record ID:</strong> {patient.id || 'N/A'}</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>User Account ID:</strong> {patient.userId || 'N/A'}</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Created:</strong> {patient.createdAt || 'N/A'}</p>
            </div>

            <div style={{ padding: '18px', borderRadius: '12px', background: '#f8fafc' }}>
              <p style={{ margin: '0 0 10px 0', color: '#475569', fontWeight: '700' }}>Personal Info</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Name:</strong> {patient.name || 'N/A'}</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Email:</strong> {patient.email || 'N/A'}</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Phone:</strong> {patient.phone || 'N/A'}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginTop: '24px' }}>
            <div style={{ padding: '18px', borderRadius: '12px', background: '#f8fafc' }}>
              <p style={{ margin: '0 0 10px 0', color: '#475569', fontWeight: '700' }}>Health Details</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Date of Birth:</strong> {patient.dateOfBirth || 'N/A'}</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Gender:</strong> {patient.gender || 'N/A'}</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Blood Group:</strong> {patient.bloodGroup || 'N/A'}</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Allergies:</strong> {patient.allergies || 'None recorded'}</p>
            </div>

            <div style={{ padding: '18px', borderRadius: '12px', background: '#f8fafc' }}>
              <p style={{ margin: '0 0 10px 0', color: '#475569', fontWeight: '700' }}>Medical Summary</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Chronic Conditions:</strong> {patient.chronicConditions || 'None recorded'}</p>
              <p style={{ margin: '8px 0', color: '#2c3e50' }}><strong>Medical History:</strong> {patient.medicalHistory || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientRecordsPage;
