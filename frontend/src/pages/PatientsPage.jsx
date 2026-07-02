import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.getAll();
      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await patientAPI.delete(id);
        setPatients(patients.filter(p => p.id !== id));
        alert('Patient deleted successfully');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient');
      }
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      userId: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (patient) => {
    setEditingId(patient.id);
    setFormData({
      userId: patient.userId,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
    });
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await patientAPI.update(editingId, formData);
        alert('Patient updated successfully');
        loadPatients();
      } else {
        await patientAPI.create(formData);
        alert('Patient added successfully');
        loadPatients();
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '28px' }}>Patients</h1>
        <button onClick={handleAddClick} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
          Add Patient
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>{editingId ? 'Edit Patient' : 'Add Patient'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>User ID:</label>
                <input
                  type="number"
                  name="userId"
                  value={formData.userId}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="Enter user ID"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Date of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Gender:</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Blood Group:</label>
                <input
                  type="text"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="e.g., O+, B-, A+"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleCancel} style={{ background: '#95a5a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Date of Birth</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Gender</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Blood Group</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '15px' }}>{patient.id}</td>
                <td style={{ padding: '15px' }}>{patient.name || 'N/A'}</td>
                <td style={{ padding: '15px' }}>{patient.dateOfBirth}</td>
                <td style={{ padding: '15px' }}>{patient.gender}</td>
                <td style={{ padding: '15px' }}>{patient.bloodGroup}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleEditClick(patient)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                  <button onClick={() => handleDelete(patient.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientsPage;
