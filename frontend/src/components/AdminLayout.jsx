import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDisplayName } from '../utils/userDisplay';
import { normalizeRole } from '../utils/roleUtils';

function AdminLayout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = user || {};

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname.includes(path);

  const getSidebarMenu = () => {
    // ============================================
    // ADMIN MENU
    // ============================================
    const normalizedRole = normalizeRole(currentUser.role);

    if (normalizedRole === 'ADMIN') {
      return [
        { label: '📊 Dashboard', path: '/admin' },
        { label: '� Profile', path: '/admin/profile' },
        { label: '�👨‍⚕️ Doctors', path: '/admin/doctors' },
        { label: '👥 Patients', path: '/admin/patients' },
        { label: '📅 Appointments', path: '/admin/appointments' },
        { label: '🏥 Departments', path: '/admin/departments' },
        { label: '📋 Reports', path: '/admin/reports' },
      ];
    }
    
    // ============================================
    // DOCTOR MENU
    // ============================================
    else if (normalizedRole === 'DOCTOR') {
      return [
        { label: '📊 Dashboard', path: '/doctor' },
        { label: '👤 Profile', path: '/doctor/profile' },
        { label: '⏱️ My Schedule', path: '/doctor/schedule' },
        { label: '👥 My Patients', path: '/doctor/patients' },
        { label: '📅 Appointments', path: '/doctor/appointments' },
        { label: '📄 Medical Records', path: '/doctor/records' },
        { label: '💊 Prescriptions', path: '/doctor/prescriptions' },
      ];
    }
    
    // ============================================
    // PATIENT MENU
    // ============================================
    else if (normalizedRole === 'PATIENT') {
      return [
        { label: '📊 Dashboard', path: '/patient' },
        { label: '� Profile', path: '/patient/profile' },
        { label: '�📅 My Appointments', path: '/patient/appointments' },
        { label: '📋 Medical Reports', path: '/patient/reports' },
        { label: '📄 Health Records', path: '/patient/records' },
        { label: '👨‍⚕️ My Doctors', path: '/patient/doctors' },
        { label: '💊 Prescriptions', path: '/patient/prescriptions' },
      ];
    }
    
    return [];
  };

  const getPanelTitle = () => {
    const normalizedRole = normalizeRole(currentUser.role);
    if (normalizedRole === 'ADMIN') return 'Admin Panel';
    if (normalizedRole === 'DOCTOR') return 'Doctor Panel';
    if (normalizedRole === 'PATIENT') return 'Patient Panel';
    return 'Panel';
  };

  const sidebarMenu = getSidebarMenu();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
      
      {/* ============================================ */}
      {/* LEFT SIDEBAR */}
      {/* ============================================ */}
      <div 
        style={{ 
          width: '250px', 
          background: '#2c3e50', 
          color: 'white', 
          padding: '20px 0', 
          overflowY: 'auto',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        }}
      >
        {/* Panel Title */}
        <div style={{ 
          padding: '15px 20px 20px 20px', 
          borderBottom: '2px solid #34495e',
          marginBottom: '10px',
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '0.5px',
          }}>
            {getPanelTitle()}
          </h2>
          <p style={{ 
            fontSize: '12px', 
            color: '#95a5a6',
            margin: '5px 0 0 0',
          }}>
            Welcome, {getDisplayName(currentUser)}
          </p>
        </div>

        {/* Navigation Menu */}
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
        }}>
          {sidebarMenu.length > 0 ? (
            sidebarMenu.map((item) => (
              <li
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: isActive(item.path) ? '4px solid #3498db' : '4px solid transparent',
                  backgroundColor: isActive(item.path) ? '#34495e' : 'transparent',
                  color: isActive(item.path) ? '#3498db' : '#ecf0f1',
                  fontWeight: isActive(item.path) ? '600' : '400',
                  margin: '2px 0',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = '#34495e';
                    e.currentTarget.style.color = '#3498db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ecf0f1';
                  }
                }}
              >
                <span style={{ 
                  color: 'inherit', 
                  textDecoration: 'none', 
                  display: 'block',
                  fontSize: '14px',
                }}>
                  {item.label}
                </span>
              </li>
            ))
          ) : (
            <li style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>
              No menu items available
            </li>
          )}
        </ul>
      </div>

      {/* ============================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================ */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        backgroundColor: '#ecf0f1',
      }}>
        
        {/* ============================================ */}
        {/* TOP HEADER / NAVBAR */}
        {/* ============================================ */}
        <div style={{ 
          background: 'white', 
          padding: '15px 30px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #bdc3c7',
        }}>
          {/* Left: Hospital Title */}
          <h1 style={{ 
            color: '#2c3e50', 
            fontSize: '22px', 
            margin: 0,
            fontWeight: 'bold',
          }}>
            Hospital Management System
          </h1>

          {/* Right: User Info & Logout */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            alignItems: 'center',
          }}>
            {/* User Info */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                color: '#7f8c8d', 
                fontSize: '13px',
                margin: '0 0 3px 0',
              }}>
                Welcome back!
              </p>
              <p style={{ 
                color: '#2c3e50', 
                fontSize: '14px',
                fontWeight: '600',
                margin: 0,
              }}>
                {getDisplayName(currentUser)}
              </p>
              <p style={{ 
                color: '#3498db', 
                fontSize: '12px',
                margin: '2px 0 0 0',
              }}>
                {normalizeRole(currentUser.role) || 'USER'}
              </p>
            </div>

            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              style={{ 
                background: '#3498db', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2980b9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3498db';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              🏠 Home
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{ 
                background: '#e74c3c', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#c0392b';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#e74c3c';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* PAGE CONTENT / MAIN SECTION */}
        {/* ============================================ */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '30px',
          backgroundColor: '#ecf0f1',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
