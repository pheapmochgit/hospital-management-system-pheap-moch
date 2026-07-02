import React, { useState, useEffect } from 'react';
import { reportAPI, patientAPI, doctorAPI } from '../services/api';

function PatientReportsPage({ user }) {
  const [reports, setReports] = useState([]);
  const [doctorMap, setDoctorMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    const loadReports = async () => {
      try {
        const userIdNumber = Number(userId);
        const patientRes = await patientAPI.getByUserId(userId).catch(() => ({ data: null }));
        const patientId = Number(patientRes.data?.id || userId);

        let reportsRes = await reportAPI.getByPatient(patientId).catch(() => ({ data: [] }));
        // also load doctors for name mapping
        const doctorsRes = await doctorAPI.getAll().catch(() => ({ data: [] }));
        const map = new Map();
        (doctorsRes.data || []).forEach((d) => {
          if (d.id != null) map.set(String(d.id), d.name);
          if (d.userId != null) map.set(String(d.userId), d.name);
          if (d.user_id != null) map.set(String(d.user_id), d.name);
        });
        setDoctorMap(map);
        console.log('PatientReports: doctorMap=', JSON.stringify(Array.from(map.entries())));
        if ((reportsRes.data || []).length === 0 && patientId !== userIdNumber) {
          const fallbackRes = await reportAPI.getByPatient(userIdNumber).catch(() => ({ data: [] }));
          if ((fallbackRes.data || []).length > 0) {
            reportsRes = fallbackRes;
          }
        }
        // attempt per-report fallback: fetch doctor names for any missing ids
        const reportsData = reportsRes.data || [];
        const missingIds = Array.from(new Set(
          reportsData
            .map((r) => r.doctorId || r.doctor_user_id || r.doctorUserId || r.doctor_id)
            .filter((id) => id != null && !map.has(String(id)))
        ));

        if (missingIds.length > 0) {
          const fetched = await Promise.all(
            missingIds.map((id) => doctorAPI.getById(id).catch(() => ({ data: null })))
          );
          fetched.forEach((res, idx) => {
            const id = missingIds[idx];
            if (res && res.data && res.data.name) {
              map.set(String(id), res.data.name);
            }
          });
          setDoctorMap(new Map(map));
        }

        console.log('PatientReports: reportsData=', JSON.stringify(reportsData));
        console.log('PatientReports: doctorMapEntries=', JSON.stringify(Array.from(map.entries())));

        setReports(reportsData);
      } catch (error) {
        console.error('Error loading patient reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [userId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading medical reports...</div>;
  const hasDoctorColumn = reports.some(r => (
    r.doctorName || (r.doctor && r.doctor.name) || r.doctorId || r.doctor_user_id || r.doctorUserId || r.doctor_id
  ));

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>Medical Reports</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Your available reports are listed here.</p>

      {reports.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          No reports are available for this account.
        </div>
      ) : (
        <div className="card-table">
          <table className="data-table data-table__rounded">
            <thead className="data-table__head">
              <tr>
                {hasDoctorColumn && <th className="data-table__th">Doctor</th>}
                <th className="data-table__th">Date</th>
                <th className="data-table__th">Type</th>
                <th className="data-table__th">Description</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="data-table__row">
                  {hasDoctorColumn && (
                    <td className="data-table__td">
                      {report.doctorName
                        || (report.doctor && report.doctor.name)
                        || doctorMap.get(String(report.doctorId))
                        || doctorMap.get(String(report.doctor_user_id))
                        || doctorMap.get(String(report.doctorUserId))
                        || doctorMap.get(String(report.doctor_id))
                        || '—'}
                    </td>
                  )}
                  <td className="data-table__td">{report.date || 'N/A'}</td>
                  <td className="data-table__td">{report.reportType}</td>
                  <td className="data-table__td">{report.description || 'No description'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientReportsPage;
