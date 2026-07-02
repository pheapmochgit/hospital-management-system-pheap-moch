import React, { useState, useEffect } from 'react';
import { prescriptionAPI, patientAPI } from '../services/api';

function PatientPrescriptionsPage({ user }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const userIdNumber = Number(userId);
        const patientRes = await patientAPI.getByUserId(userId).catch(() => ({ data: null }));
        const patientId = Number(patientRes.data?.id || userId);

        let prescriptionsRes = await prescriptionAPI.getByPatient(patientId).catch(() => ({ data: [] }));
        if ((prescriptionsRes.data || []).length === 0 && patientId !== userIdNumber) {
          const fallbackRes = await prescriptionAPI.getByPatient(userIdNumber).catch(() => ({ data: [] }));
          if ((fallbackRes.data || []).length > 0) {
            prescriptionsRes = fallbackRes;
          }
        }
        setPrescriptions(prescriptionsRes.data || []);
      } catch (error) {
        console.error('Error loading patient prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, [userId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading prescriptions...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>Prescriptions</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Your current prescriptions are listed below.</p>

      {prescriptions.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          No prescriptions are available for this account.
        </div>
      ) : (
        <div className="card-table">
          <table className="data-table data-table__rounded">
            <thead className="data-table__head">
              <tr>
                <th className="data-table__th">Doctor</th>
                <th className="data-table__th">Medication</th>
                <th className="data-table__th">Dosage</th>
                <th className="data-table__th">Date</th>
                <th className="data-table__th">Status</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} className="data-table__row">
                  <td className="data-table__td">{prescription.doctorName || `Doctor ${prescription.doctorId}`}</td>
                  <td className="data-table__td">{prescription.medication}</td>
                  <td className="data-table__td">{prescription.dosage}</td>
                  <td className="data-table__td">{prescription.date}</td>
                  <td className="data-table__td">{prescription.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientPrescriptionsPage;
