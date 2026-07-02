import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../services/api';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll();
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await appointmentAPI.delete(id);
        setAppointments(appointments.filter(a => a.id !== id));
        alert('Appointment deleted successfully');
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '28px' }}>Appointments</h1>
        <button style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
          Add Appointment
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Patient ID</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Doctor ID</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Time</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Reason</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '15px' }}>{apt.id}</td>
                <td style={{ padding: '15px' }}>{apt.patientId}</td>
                <td style={{ padding: '15px' }}>{apt.doctorId}</td>
                <td style={{ padding: '15px' }}>{apt.date}</td>
                <td style={{ padding: '15px' }}>{apt.time}</td>
                <td style={{ padding: '15px' }}>{apt.reason}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: apt.status === 'COMPLETED' ? '#d4edda' : apt.status === 'SCHEDULED' ? '#cfe2ff' : '#f8d7da',
                    color: apt.status === 'COMPLETED' ? '#155724' : apt.status === 'SCHEDULED' ? '#084298' : '#842029',
                  }}>
                    {apt.status}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <button style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                  <button onClick={() => handleDelete(apt.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AppointmentsPage;
