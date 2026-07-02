import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { appointmentAPI, doctorAPI, patientAPI } from '../services/api';
import { getDisplayName } from '../utils/userDisplay';

function BookAppointmentPage({ user }) {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId || '');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientRecord, setPatientRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await doctorAPI.getAll();
        setDoctors(response.data || []);
        // if there is no doctorId in the route params, default to first doctor
        if (!doctorId && response.data && response.data.length > 0) {
          setSelectedDoctorId(response.data[0].id);
        }
      } catch (err) {
        console.error('Error loading doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, [doctorId]);

  useEffect(() => {
    // Load patient info: for patients, load their record; for doctors, load patients list
    const loadPatients = async () => {
      try {
        if (user?.role === 'DOCTOR') {
          const res = await patientAPI.getAll();
          setPatients(res.data || []);
          const params = new URLSearchParams(window.location.search);
          const paramPatientId = params.get('patientId');
          if (paramPatientId) {
            setSelectedPatientId(String(paramPatientId));
            try {
              const p = await patientAPI.getById(paramPatientId);
              setPatientRecord(p.data || null);
            } catch (e) {
              console.warn('Could not load patient by id from query param', e);
            }
          } else if (res.data && res.data.length > 0) {
            setSelectedPatientId(String(res.data[0].id));
            setPatientRecord(res.data[0]);
          }
        } else if (user) {
          const pr = await patientAPI.getByUserId(user.id).catch(() => ({ data: null }));
          setPatientRecord(pr.data || null);
          if (pr?.data?.id) setSelectedPatientId(pr.data.id);
        }
      } catch (err) {
        console.error('Error loading patients:', err);
      }
    };
    loadPatients();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please log in first to book an appointment.');
      return;
    }
    if (!selectedDoctorId || !date || !time || !reason) {
      setError('Please fill in all fields.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (date < today) {
      setError('Appointment date must be today or later.');
      return;
    }

    try {
      let patientId = user.id;

      // If doctor is booking, use selectedPatientId (must be set)
      if (user?.role === 'DOCTOR') {
        if (!selectedPatientId) {
          setError('Please select a patient to book for.');
          return;
        }
        patientId = Number(selectedPatientId);
      } else {
        try {
          const patientResponse = await patientAPI.getByUserId(user.id);
          if (patientResponse?.data?.id) {
            patientId = Number(patientResponse.data.id);
          } else {
            patientId = Number(user.id);
          }
        } catch (patientErr) {
          console.warn('Could not resolve patient record, falling back to user id:', patientErr);
          patientId = Number(user.id);
        }
      }

      await appointmentAPI.create({
        patientId,
        doctorId: Number(selectedDoctorId),
        date,
        time,
        reason,
        status: 'SCHEDULED',
      });
      setSuccess('Appointment booked successfully.');
      setDate('');
      setTime('');
      setReason('');
      setTimeout(() => navigate('/patient/appointments'), 1500);
    } catch (err) {
      console.error('Booking failed:', err);
      const message = err?.response?.data?.message || err?.message || 'Unable to book appointment. Please try again.';
      const details = err?.response?.data?.details || err?.response?.data || '';
      setError(details ? `${message} ${typeof details === 'string' ? details : JSON.stringify(details)}` : message);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading doctors...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8ff', padding: '40px 24px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 12px 40px rgba(15, 76, 129, 0.12)' }}>
        <h1 style={{ color: '#0f4c81', marginBottom: '10px' }}>Book Appointment</h1>
        <div style={{ background: '#eef5ff', border: '1px solid #d6e7ff', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ color: '#0f4c81', fontWeight: '800', fontSize: '16px', marginBottom: '8px' }}>
            Patient Information
          </div>
          {
            // If doctor is booking, allow selecting a patient and show that patient's info
          }
          {user?.role === 'DOCTOR' ? (
            <>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                Select patient
                <select
                  value={selectedPatientId}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSelectedPatientId(val);
                    if (val) {
                      try {
                        const p = await patientAPI.getById(val);
                        setPatientRecord(p.data || null);
                      } catch (err) {
                        console.warn('Failed to load patient', err);
                      }
                    } else {
                      setPatientRecord(null);
                    }
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', marginTop: '8px' }}
                >
                  <option value="">-- Select patient --</option>
                  {(patients || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name || p.email || `Patient ${p.id}`}</option>
                  ))}
                </select>
              </label>

              <div style={{ color: '#0f4c81', fontWeight: '700', fontSize: '15px' }}>
                {patientRecord ? (patientRecord.name || patientRecord.email) : 'No patient selected'}
              </div>
              <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
                {patientRecord?.email ? `Email: ${patientRecord.email}` : 'Email: Not provided'}
              </div>
              <div style={{ color: '#475569', fontSize: '14px', marginTop: '2px' }}>
                {patientRecord?.phone ? `Phone: ${patientRecord.phone}` : 'Phone: Not provided'}
              </div>
            </>
          ) : (
            <>
              <div style={{ color: '#0f4c81', fontWeight: '700', fontSize: '15px' }}>
                {patientRecord ? (patientRecord.name || getDisplayName(user)) : getDisplayName(user)}
              </div>
              <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
                {patientRecord?.email || user?.email ? `Email: ${patientRecord?.email || user.email}` : 'Email: Not provided'}
              </div>
              <div style={{ color: '#475569', fontSize: '14px', marginTop: '2px' }}>
                {patientRecord?.phone || user?.phone ? `Phone: ${patientRecord?.phone || user.phone}` : 'Phone: Not provided'}
              </div>
            </>
          )}
          <div style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>
            This booking will be created for the logged-in patient. No ID entry is required.
          </div>
        </div>

        {error && <div style={{ background: '#ffdddd', color: '#842029', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ background: '#ddffdd', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '18px' }}>
            <label style={{ display: 'block', color: '#334155', fontWeight: '600' }}>
              Select doctor
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '8px' }}
              >
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name} — {doctor.qualification}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'block', color: '#334155', fontWeight: '600' }}>
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '8px' }}
              />
            </label>

            <label style={{ display: 'block', color: '#334155', fontWeight: '600' }}>
              Time
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '8px' }}
              />
            </label>

            <label style={{ display: 'block', color: '#334155', fontWeight: '600' }}>
              Reason for visit
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '8px' }}
              />
            </label>

            <button type="submit" style={{ background: '#1e88e5', color: 'white', border: 'none', padding: '14px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookAppointmentPage;
