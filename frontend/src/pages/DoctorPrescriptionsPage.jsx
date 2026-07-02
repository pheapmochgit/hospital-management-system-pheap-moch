import React, { useState, useEffect, useCallback } from 'react';
import { prescriptionAPI, doctorAPI, patientAPI, appointmentAPI } from '../services/api';

function DoctorPrescriptionsPage({ user }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [form, setForm] = useState({ patientId: '', medication: '', dosage: '', instructions: '', date: '', status: 'ACTIVE' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const userId = user?.id;

  const loadPrescriptions = useCallback(async () => {
    try {
      if (!userId) {
        setPrescriptions([]);
        setPatientMap({});
        setPatients([]);
        setDoctorId(null);
        return;
      }

      const doctorRes = await doctorAPI.getByUserId(userId).catch(() => ({ data: null }));
      const doctorRecord = doctorRes.data;
      const resolvedDoctorId = doctorRecord?.id;
      setDoctorId(resolvedDoctorId);

      if (!resolvedDoctorId) {
        setPrescriptions([]);
        setPatientMap({});
        setPatients([]);
        return;
      }

      const [prescriptionsRes, patientsRes, appointmentsRes] = await Promise.all([
        prescriptionAPI.getByDoctor(resolvedDoctorId).catch(() => ({ data: [] })),
        patientAPI.getAll().catch(() => ({ data: [] })),
        appointmentAPI.getByDoctor(resolvedDoctorId).catch(() => ({ data: [] })),
      ]);

      const patients = (patientsRes.data || []).reduce((map, patient) => {
        map[patient.id] = patient.name || patient.email || `Patient ${patient.id}`;
        return map;
      }, {});

      const doctorPatientIds = new Set((appointmentsRes.data || []).map((apt) => apt.patientId));
      const doctorPatients = (patientsRes.data || []).filter((patient) => doctorPatientIds.has(patient.id));

      setPatientMap(patients);
      setPatients(doctorPatients);
      setPrescriptions(prescriptionsRes.data || []);
    } catch (error) {
      console.error('Error loading doctor prescriptions:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadPrescriptions();
      setLoading(false);
    };

    loadData();
  }, [loadPrescriptions]);

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.patientId || !form.medication || !form.dosage || !form.date) {
      setError('Please fill in patient, medication, dosage, and date.');
      return;
    }

    try {
      if (editingPrescriptionId) {
        await prescriptionAPI.update(editingPrescriptionId, {
          patientId: Number(form.patientId),
          doctorId: doctorId,
          medication: form.medication,
          dosage: form.dosage,
          instructions: form.instructions,
          date: form.date,
          status: form.status,
        });
        setMessage('Prescription updated successfully.');
      } else {
        await prescriptionAPI.create({
          patientId: Number(form.patientId),
          doctorId: doctorId,
          medication: form.medication,
          dosage: form.dosage,
          instructions: form.instructions,
          date: form.date,
          status: form.status,
        });
        setMessage('Prescription added successfully.');
      }
      setForm({ patientId: '', medication: '', dosage: '', instructions: '', date: '', status: 'ACTIVE' });
      setEditingPrescriptionId(null);
      setShowForm(false);
      await loadPrescriptions();
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError('Unable to save prescription.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading prescriptions...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#2c3e50', marginBottom: '4px' }}>Prescriptions</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Prescriptions written by you are listed below.</p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 18px', borderRadius: '10px', cursor: 'pointer' }}
        >
          {showForm ? 'Hide Form' : 'Add Prescription'}
        </button>
      </div>

      {message && <div style={{ background: '#ecfdf5', color: '#065f46', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleCreatePrescription} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <label style={{ display: 'block' }}>
              Patient
              <select
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name || patient.email || `Patient ${patient.id}`}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'block' }}>
              Medication
              <input
                type="text"
                value={form.medication}
                onChange={(e) => setForm({ ...form, medication: e.target.value })}
                placeholder="Medication name"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
              />
            </label>

            <label style={{ display: 'block' }}>
              Dosage
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="Dosage instructions"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
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
              Instructions
              <textarea
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                rows="4"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px' }}
                placeholder="Dosage and patient instructions"
              />
            </label>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 18px', borderRadius: '10px', cursor: 'pointer' }}>
                {editingPrescriptionId ? 'Update Prescription' : 'Save Prescription'}
              </button>
              {editingPrescriptionId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ patientId: '', medication: '', dosage: '', instructions: '', date: '', status: 'ACTIVE' });
                    setEditingPrescriptionId(null);
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

      {prescriptions.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {doctorId ? 'No prescriptions found for your account.' : 'No doctor profile found for the logged-in user.'}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#2c3e50', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>Patient</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Medication</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Dosage</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '16px' }}>{patientMap[prescription.patientId] || prescription.patientName || `Patient ${prescription.patientId}`}</td>
                  <td style={{ padding: '16px' }}>{prescription.medication}</td>
                  <td style={{ padding: '16px' }}>{prescription.dosage}</td>
                  <td style={{ padding: '16px' }}>{prescription.date}</td>
                  <td style={{ padding: '16px' }}>{prescription.status}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setForm({
                          patientId: prescription.patientId ? String(prescription.patientId) : '',
                          medication: prescription.medication || '',
                          dosage: prescription.dosage || '',
                          instructions: prescription.instructions || '',
                          date: prescription.date || '',
                          status: prescription.status || 'ACTIVE',
                        });
                        setEditingPrescriptionId(prescription.id);
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

export default DoctorPrescriptionsPage;
