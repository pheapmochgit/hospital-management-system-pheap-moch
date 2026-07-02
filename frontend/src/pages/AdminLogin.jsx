import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function AdminLogin({ onLogin }) {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminEmail.trim() || !adminPassword) {
      setError('Please enter both admin email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.adminLogin(adminEmail, adminPassword);
      const userData = {
        ...response.data,
        role: 'ADMIN',
      };
      onLogin(userData);
      navigate('/admin');
    } catch (err) {
      setError('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGmailLogin = () => {
    // Gmail OAuth login implementation
    //  set up OAuth 2.0 credentials in Google Cloud Console
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '450px'
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#1e3c72',
            marginBottom: '30px',
            fontSize: '28px'
          }}
        >
          Admin Dashboard
        </h1>

        {error && (
          <div
            style={{
              background: '#f8d7da',
              color: '#842029',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        {/* Gmail Login Option */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={handleGmailLogin}
            type="button"
            style={{
              width: '100%',
              padding: '12px',
              background: '#4285F4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span>📧</span> Login with Gmail
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px', color: '#7f8c8d' }}>
          OR
        </div>

        {/*  Admin Login */}
        <form onSubmit={handleAdminLogin} autoComplete="off">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Admin Email
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              autoComplete="new-username"
              name="admin-email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #bdc3c7',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Admin Password
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              autoComplete="new-password"
              name="admin-password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #bdc3c7',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#1e3c72',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            color: '#7f8c8d'
          }}
        >
          <Link
            to="/login"
            style={{ color: '#1e3c72', textDecoration: 'none' }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
