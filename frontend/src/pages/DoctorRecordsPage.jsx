import React, { useState, useEffect, useCallback } from 'react';
import { reportAPI, patientAPI, appointmentAPI, doctorAPI } from '../services/api';

function DoctorRecordsPage({ user }) {
  const [records, setRecords] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [patientList, setPatientList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [form, setForm] = useState({ patientId: '', reportType: '', date: '', description: '', fileContent: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [doctorId, setDoctorId] = useState(null);

  const loadRecords = useCallback(async () => {
    try {
      const doctorRes = await doctorAPI.getAll();
      const doctorRecord = (doctorRes.data || []).find((doc) => doc.userId === user.id || doc.user_id === user.id);
      const resolvedDoctorId = doctorRecord?.id;
      setDoctorId(resolvedDoctorId);

      if (!resolvedDoctorId) {
        setRecords([]);
        setPatientList([]);
        setLoading(false);
        return;
      }

      const [appointmentsRes, reportsRes, patientsRes] = await Promise.all([
        appointmentAPI.getByDoctor(resolvedDoctorId).catch(() => ({ data: [] })),
        reportAPI.getAll().catch(() => ({ data: [] })),
        patientAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const patientMap = (patientsRes.data || []).reduce((map, patient) => {
        map[patient.id] = patient.name || patient.email || `Patient ${patient.id}`;
        return map;
      }, {});

      const doctorPatientIds = new Set((appointmentsRes.data || []).map((apt) => apt.patientId));
      const filteredRecords = (reportsRes.data || []).filter((record) => doctorPatientIds.has(record.patientId));
      const doctorPatients = (patientsRes.data || []).filter((patient) => doctorPatientIds.has(patient.id));

      setPatientMap(patientMap);
      setPatientList(doctorPatients);
      setRecords(filteredRecords);
    } catch (error) {
      console.error('Error loading doctor records:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.patientId || !form.reportType || !form.date) {
      setError('Please select a patient, report type, and date.');
      return;
    }

    try {
      if (editingRecordId) {
        await reportAPI.update(editingRecordId, {
          patientId: Number(form.patientId),
          reportType: form.reportType,
          description: form.description,
          date: form.date,
          fileContent: form.fileContent,
        });
        setMessage('Medical record updated successfully.');
      } else {
        await reportAPI.create({
          patientId: Number(form.patientId),
          reportType: form.reportType,
          description: form.description,
          date: form.date,
          fileContent: form.fileContent,
        });
        setMessage('Medical record created successfully.');
      }

      setForm({ patientId: '', reportType: '', date: '', description: '', fileContent: '' });
      setEditingRecordId(null);
      setShowForm(false);
      await loadRecords();
    } catch (err) {
      console.error('Error saving record:', err);
      setError('Unable to save the medical record.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading medical records...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#2c3e50', marginBottom: '4px' }}>Medical Records</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Records created for your patients.</p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 18px', borderRadius: '10px', cursor: 'pointer' }}
        >
          {showForm ? 'Hide Form' : 'Add Medical Record'}
        </button>
      </div>

      {message && <div style={{ background: '#e6fffa', color: '#0f766e', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreateRecord} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <label style={{ display: 'block' }}>
              Patient
              <select
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
              >
                <option value="">Select patient</option>
                {patientList.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name || patient.email || `Patient ${patient.id}`}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'block' }}>
              Report Type
              <input
                type="text"
                value={form.reportType}
                onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
                placeholder="e.g. MRI, Blood Test"
              />
            </label>

            <label style={{ display: 'block' }}>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
              />
            </label>

            <label style={{ display: 'block' }}>
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="4"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
                placeholder="Write the report details here"
              />
            </label>

            <label style={{ display: 'block' }}>
              File Content / Notes
              <textarea
                value={form.fileContent}
                onChange={(e) => setForm({ ...form, fileContent: e.target.value })}
                rows="3"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
                placeholder="Optional file path or notes"
              />
            </label>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 18px', borderRadius: '10px', cursor: 'pointer' }}>
                {editingRecordId ? 'Update Record' : 'Save Record'}
              </button>
              {editingRecordId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ patientId: '', reportType: '', date: '', description: '', fileContent: '' });
                    setEditingRecordId(null);
                    setShowForm(false);
                    setError('');
                    setMessage('');
                  }}
                  style={{ background: '#e5e7eb', color: '#111827', border: 'none', padding: '12px 18px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {records.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d' }}>
          {doctorId ? 'No medical records are available yet for your patients.' : 'No doctor profile found for the logged-in user.'}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#2c3e50', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>Patient</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '16px' }}>{patientMap[record.patientId] || `Patient ${record.patientId}`}</td>
                  <td style={{ padding: '16px' }}>{record.reportType}</td>
                  <td style={{ padding: '16px' }}>{record.date}</td>
                  <td style={{ padding: '16px' }}>{record.description || 'No description'}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setForm({
                          patientId: String(record.patientId),
                          reportType: record.reportType || '',
                          date: record.date || '',
                          description: record.description || '',
                          fileContent: record.fileContent || '',
                        });
                        setEditingRecordId(record.id);
                        setShowForm(true);
                        setMessage('');
                        setError('');
                      }}
                      style={{ background: '#1e40af', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DoctorRecordsPage;
