import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { normalizeRole, getDashboardPath } from '../utils/roleUtils';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const userData = {
        ...response.data,
        role: normalizeRole(response.data.role),
      };
      onLogin(userData);
      navigate(getDashboardPath(userData.role));
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '400px'
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
          Hospital Login
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

        <form onSubmit={handleLogin} autoComplete="off">
          {/* EMAIL */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="new-username"
              name="username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #bdc3c7',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              name="password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #bdc3c7',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* BUTTON */}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '15px',
            color: '#7f8c8d'
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: '#1e3c72', textDecoration: 'none' }}
          >
            Register
          </Link>
        </div>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #bdc3c7' }}>
          <p style={{ textAlign: 'center', marginBottom: '15px', fontWeight: '500' }}>Admin Login</p>
          <Link
            to="/admin-login"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;