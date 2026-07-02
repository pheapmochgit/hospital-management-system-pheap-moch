import React, { useState, useEffect } from 'react';
import { authAPI, doctorAPI, patientAPI } from '../services/api';

function ProfilePage({ user, onUpdateUser }) {
  const [profile, setProfile] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || '',
    bloodGroup: user.bloodGroup || '',
  });
  const [doctorProfile, setDoctorProfile] = useState({
    qualification: '',
    experience: '',
    consultationFee: '',
    departmentName: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [patientRecord, setPatientRecord] = useState(null);
  const [doctorRecord, setDoctorRecord] = useState(null);

  useEffect(() => {
    setProfile({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      bloodGroup: user.bloodGroup || '',
    });

    const loadPatientRecord = async () => {
      try {
        if (user?.id) {
          const res = await patientAPI.getByUserId(user.id).catch(() => ({ data: null }));
          setPatientRecord(res.data || null);
        }
      } catch (e) {
        console.warn('Failed to load patient record', e);
      }
    };

    const loadDoctorRecord = async () => {
      try {
        if (user?.id) {
          const res = await doctorAPI.getByUserId(user.id).catch(() => ({ data: null }));
          const doctor = res.data || null;
          setDoctorRecord(doctor);
          setDoctorProfile({
            qualification: doctor?.qualification || '',
            experience: doctor?.experience != null ? String(doctor.experience) : '',
            consultationFee: doctor?.consultationFee != null ? String(doctor.consultationFee) : '',
            departmentName: doctor?.departmentName || '',
          });
        }
      } catch (e) {
        console.warn('Failed to load doctor record', e);
      }
    };

    loadPatientRecord();
    loadDoctorRecord();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorProfileChange = (e) => {
    const { name, value } = e.target;
    setDoctorProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!profile.fullName.trim() || !profile.email.trim() || !profile.phone.trim() || !profile.address.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);

    try {
      const response = await authAPI.updateUser(user.id, profile);
      if (response.data) {
        let updatedDoctor = doctorRecord;

        if (user.role === 'DOCTOR' && doctorRecord?.id) {
          const doctorPayload = {
            ...doctorRecord,
            qualification: doctorProfile.qualification,
            experience: Number(doctorProfile.experience) || 0,
            consultationFee: Number(doctorProfile.consultationFee) || 0,
            departmentName: doctorProfile.departmentName,
          };
          const doctorRes = await doctorAPI.update(doctorRecord.id, doctorPayload);
          updatedDoctor = doctorRes.data;
          setDoctorRecord(updatedDoctor);
        }

        onUpdateUser({ ...response.data, role: user.role });
        setMessage('Profile updated successfully.');
        if (updatedDoctor) {
          setDoctorProfile({
            qualification: updatedDoctor.qualification || '',
            experience: updatedDoctor.experience != null ? String(updatedDoctor.experience) : '',
            consultationFee: updatedDoctor.consultationFee != null ? String(updatedDoctor.consultationFee) : '',
            departmentName: updatedDoctor.departmentName || '',
          });
        }
      }
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>My Profile</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '24px' }}>View and edit your profile details.</p>

        <div style={{ marginBottom: '12px' }}>
          <strong>
            {user.role === 'DOCTOR' ? 'Doctor ID:' : user.role === 'PATIENT' ? 'Patient ID:' : 'Admin ID:'}
          </strong>{' '}
          {user.role === 'DOCTOR'
            ? doctorRecord?.id || '—'
            : user.role === 'PATIENT'
            ? patientRecord?.id || '—'
            : user.id || '—'}
          {(user.role === 'DOCTOR' ? doctorRecord?.id : user.role === 'PATIENT' ? patientRecord?.id : user.id) && (
            <button
              onClick={() => {
                try {
                  const idToCopy = user.role === 'DOCTOR'
                    ? doctorRecord?.id
                    : user.role === 'PATIENT'
                    ? patientRecord?.id
                    : user.id;
                  navigator.clipboard.writeText(String(idToCopy));
                  alert('ID copied to clipboard');
                } catch (e) {
                  console.warn('Clipboard not available', e);
                }
              }}
              style={{ marginLeft: '8px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
            >
              Copy ID
            </button>
          )}
        </div>

        {message && <div style={{ background: '#e8f8f5', color: '#0f5132', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
        {error && <div style={{ background: '#f8d7da', color: '#842029', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Full Name</label>
            <input
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              placeholder="Full name"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Email</label>
            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              type="email"
              placeholder="Email address"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Phone</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Phone number"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Address</label>
              <input
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Address"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
                required
              />
            </div>
          </div>

          {user.role === 'DOCTOR' && (
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
              <h2 style={{ marginBottom: '16px', color: '#2c3e50' }}>Doctor Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Qualification</label>
                  <input
                    name="qualification"
                    value={doctorProfile.qualification}
                    onChange={handleDoctorProfileChange}
                    placeholder="Qualification"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Department</label>
                  <input
                    name="departmentName"
                    value={doctorProfile.departmentName}
                    onChange={handleDoctorProfileChange}
                    placeholder="Department"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Experience (years)</label>
                  <input
                    name="experience"
                    value={doctorProfile.experience}
                    onChange={handleDoctorProfileChange}
                    type="number"
                    min="0"
                    placeholder="Experience"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Consultation Fee</label>
                  <input
                    name="consultationFee"
                    value={doctorProfile.consultationFee}
                    onChange={handleDoctorProfileChange}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Consultation fee"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Date of Birth</label>
              <input
                name="dateOfBirth"
                value={profile.dateOfBirth}
                onChange={handleChange}
                type="date"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Blood Group</label>
              <input
                name="bloodGroup"
                value={profile.bloodGroup}
                onChange={handleChange}
                placeholder="A+, B-, O+"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dfe6ea' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '160px',
              padding: '12px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#1e3c72',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
