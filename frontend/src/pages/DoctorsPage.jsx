import React, { useState, useEffect } from 'react';
import { doctorAPI, departmentAPI } from '../services/api';

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    departmentId: '',
    qualification: '',
    experience: '',
    consultationFee: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadDoctors();
    loadDepartments();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await doctorAPI.getAll();
      setDoctors(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await doctorAPI.delete(id);
        setDoctors(doctors.filter(d => d.id !== id));
        alert('Doctor deleted successfully');
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor');
      }
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      departmentId: '',
      qualification: '',
      experience: '',
      consultationFee: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (doctor) => {
    setEditingId(doctor.id);
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      departmentId: doctor.departmentId,
      qualification: doctor.qualification,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
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
    setFormError('');

    if (!formData.name || !formData.email || !formData.departmentId || !formData.qualification || !formData.experience || !formData.consultationFee) {
      setFormError('Please fill in all required fields.');
      return;
    }


    try {
      if (editingId) {
        await doctorAPI.update(editingId, formData);
        alert('Doctor updated successfully');
      } else {
        await doctorAPI.create(formData);
        alert('Doctor added successfully');
      }
      loadDoctors();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving doctor:', error);
      const backendMessage = error.response?.data?.error || error.response?.data?.message;
      setFormError(backendMessage || 'Failed to save doctor.');
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
        <h1 style={{ color: '#2c3e50', fontSize: '28px' }}>Doctors</h1>
        <button onClick={handleAddClick} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
          Add Doctor
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>{editingId ? 'Edit Doctor' : 'Add Doctor'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="Enter doctor name"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="Enter doctor email"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Department:</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Qualification:</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="e.g., MD Cardiology"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Experience (Years):</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="e.g., 15"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Consultation Fee:</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleFormChange}
                  required
                  step="0.01"
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="e.g., 500"
                />
              </div>
              {formError && (
                <div style={{ marginBottom: '15px', color: '#c0392b', fontWeight: '600' }}>
                  {formError}
                </div>
              )}
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
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Department</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Qualification</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Experience</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Fee</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '15px' }}>{doctor.id}</td>
                <td style={{ padding: '15px' }}>{doctor.name || '—'}</td>
                <td style={{ padding: '15px' }}>{doctor.email || '—'}</td>
                <td style={{ padding: '15px' }}>{doctor.departmentName || doctor.departmentId || '—'}</td>
                <td style={{ padding: '15px' }}>{doctor.qualification}</td>
                <td style={{ padding: '15px' }}>{doctor.experience}</td>
                <td style={{ padding: '15px' }}>$ {doctor.consultationFee.toFixed(2)}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleEditClick(doctor)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                  <button onClick={() => handleDelete(doctor.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DoctorsPage;
