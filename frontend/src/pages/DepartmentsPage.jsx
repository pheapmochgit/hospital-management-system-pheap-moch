import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../services/api';

function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading departments:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await departmentAPI.delete(id);
        setDepartments(departments.filter(d => d.id !== id));
        alert('Department deleted successfully');
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Failed to delete department');
      }
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (department) => {
    setEditingId(department.id);
    setFormData({
      name: department.name,
      description: department.description,
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
        await departmentAPI.update(editingId, formData);
        alert('Department updated successfully');
        loadDepartments();
      } else {
        await departmentAPI.create(formData);
        alert('Department added successfully');
        loadDepartments();
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Failed to save department: ' + (error.response?.data?.message || error.message));
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
        <h1 style={{ color: '#2c3e50', fontSize: '28px' }}>Departments</h1>
        <button onClick={handleAddClick} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
          Add Department
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>{editingId ? 'Edit Department' : 'Add Department'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Department Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }}
                  placeholder="e.g., Cardiology"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box', minHeight: '100px', fontFamily: 'Arial, sans-serif' }}
                  placeholder="Enter department description"
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
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Department Name</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Description</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={dept.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '15px' }}>{index + 1}</td>
                <td style={{ padding: '15px' }}><strong>{dept.name}</strong></td>
                <td style={{ padding: '15px' }}>{dept.description ? dept.description.substring(0, 100) + '...' : 'N/A'}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleEditClick(dept)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                  <button onClick={() => handleDelete(dept.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DepartmentsPage;
