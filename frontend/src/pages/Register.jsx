import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { normalizeRole, getDashboardPath } from '../utils/roleUtils';

function Register({ onLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [department, setDepartment] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !phone.trim() ||
      !address.trim() ||
      !dateOfBirth ||
      !gender ||
      !bloodGroup.trim()
    ) {
      setError('Please fill in all fields.');
      return false;
    }

    if (!role) {
      setError('Please select a role.');
      return false;
    }

    if (role === 'DOCTOR') {
      if (!qualification.trim() || !experience.trim() || !consultationFee.trim() || !department.trim()) {
        setError('Please provide qualification, experience, consultation fee, and department for doctor registration.');
        return false;
      }
      if (Number.isNaN(Number(experience)) || Number(experience) < 0) {
        setError('Please enter a valid experience value.');
        return false;
      }
      if (Number.isNaN(Number(consultationFee)) || Number(consultationFee) < 0) {
        setError('Please enter a valid consultation fee.');
        return false;
      }
    }

    const allowedRoles = ['PATIENT', 'DOCTOR'];
    if (!allowedRoles.includes(role)) {
      setError('Please select a valid role.');
      return false;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const selectedRole = normalizeRole(role);
      const response = await authAPI.register({
        fullName,
        email,
        password,
        phone,
        address,
        role: selectedRole,
        qualification: role === 'DOCTOR' ? qualification : undefined,
        experience: role === 'DOCTOR' ? Number(experience) : undefined,
        consultationFee: role === 'DOCTOR' ? Number(consultationFee) : undefined,
        department: role === 'DOCTOR' ? department : undefined,
        dateOfBirth: dateOfBirth || '',
        gender: gender || '',
        bloodGroup: bloodGroup || '',
        createdAt: new Date().toISOString(),
      });

      if (response.data) {
        const userData = {
          ...response.data,
          role: normalizeRole(response.data.role),
        };
        onLogin(userData);

        // Notify other app components that user counts should refresh
        window.dispatchEvent(new Event('dashboardCountsUpdated'));
        localStorage.setItem('dashboardCountsUpdated', Date.now().toString());

        if (userData.role === 'PATIENT') {
          navigate('/?from=register');
        } else {
          navigate(getDashboardPath(userData.role));
        }
      }
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      if (apiMessage && apiMessage.toLowerCase().includes('email')) {
        setError('This email is already registered. Please login instead.');
      } else {
        setError('Registration failed. Please try again or login if you already have an account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '450px' }}>
        
        <h1 style={{ textAlign: 'center', color: '#1e3c72', marginBottom: '30px', fontSize: '28px' }}>
          Create Account
        </h1>
        
        {error && (
          <div style={{ background: '#f8d7da', color: '#842029', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* ✅ IMPORTANT FIX HERE */}
        <form onSubmit={handleRegister} autoComplete="off">

          <div style={{ marginBottom: '16px', color: '#7f8c8d', fontSize: '14px' }}>
            Select the role first, then complete the form fields for that role.
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '12px' }}
            >
              <option value="">Select role</option>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              name="reg-fullname"
              id="reg-fullname"
              autoComplete="off"
              style={{ width: '100%', padding: '12px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              name="reg-email"
              id="reg-email"
              autoComplete="new-email"
              style={{ width: '100%', padding: '12px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              name="reg-password"
              id="reg-password"
              autoComplete="new-password"
              style={{ width: '100%', padding: '12px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="off"
              name="reg-phone"
              style={{ width: '100%', padding: '12px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              autoComplete="off"
              name="reg-address"
              style={{ width: '100%', padding: '12px', minHeight: '80px' }}
            />
          </div>

          {role === 'DOCTOR' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label>Qualification</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  required
                  name="reg-qualification"
                  style={{ width: '100%', padding: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  name="reg-department"
                  style={{ width: '100%', padding: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>Experience (years)</label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  min="0"
                  name="reg-experience"
                  style={{ width: '100%', padding: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>Consultation Fee</label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  name="reg-fee"
                  style={{ width: '100%', padding: '12px' }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              name="reg-dob"
              style={{ width: '100%', padding: '12px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              name="reg-gender"
              style={{ width: '100%', padding: '12px' }}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Blood Group</label>
            <input
              type="text"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              placeholder="A+, B-, O+, etc."
              name="reg-blood-group"
              style={{ width: '100%', padding: '12px' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#1e3c72', color: 'white' }}>
            {loading ? 'Registering...' : 'Register'}
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link to="/login">Login</Link>
        </div>

      </div>
    </div>
  );
}

export default Register;