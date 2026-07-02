import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDoctorProfileById } from '../data/doctors';

function DoctorProfilePage() {
  const { id } = useParams();
  const doctor = getDoctorProfileById(id);

  if (!doctor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f8ff', padding: '24px' }}>
        <h2 style={{ color: '#0f4c81' }}>Doctor profile not found</h2>
        <Link to="/" style={{ color: '#1e88e5', marginTop: '12px', fontWeight: '600' }}>Back to home</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8ff', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '20px', boxShadow: '0 12px 40px rgba(15, 76, 129, 0.12)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #1e88e5 100%)', color: 'white', padding: '30px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '32px' }}>{doctor.name}</h1>
          <p style={{ margin: 0, fontSize: '18px', opacity: 0.95 }}>{doctor.specialty}</p>
        </div>

        <div style={{ padding: '30px', display: 'grid', gap: '16px' }}>
          <p style={{ margin: 0, color: '#475569' }}><strong>Department:</strong> {doctor.department}</p>
          <p style={{ margin: 0, color: '#475569' }}><strong>Qualification:</strong> {doctor.qualification}</p>
          <p style={{ margin: 0, color: '#475569' }}><strong>Experience:</strong> {doctor.experience} years</p>
          <p style={{ margin: 0, color: '#475569' }}><strong>Consultation Fee:</strong> $ {doctor.consultationFee}</p>
          <p style={{ margin: 0, color: '#475569' }}><strong>Availability:</strong> {doctor.availability}</p>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>{doctor.description}</p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Link to={`/book-appointment/${doctor.id}`} style={{ background: '#1e88e5', color: 'white', padding: '10px 16px', borderRadius: '999px', textDecoration: 'none', fontWeight: '600' }}>Book Appointment</Link>
            <Link to="/" style={{ border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 16px', borderRadius: '999px', textDecoration: 'none', fontWeight: '600' }}>Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfilePage;
