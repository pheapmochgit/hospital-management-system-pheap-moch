import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportAPI.getAll();
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading reports:', error);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '28px' }}>Medical Reports</h1>
        <button style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
          Add Report
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Patient ID</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Report Type</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Description</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>File</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '15px' }}>{report.patientId}</td>
                <td style={{ padding: '15px' }}>{report.reportType}</td>
                <td style={{ padding: '15px' }}>{report.description ? report.description.substring(0, 50) + '...' : 'N/A'}</td>
                <td style={{ padding: '15px' }}>{report.date}</td>
                <td style={{ padding: '15px' }}>
                  <button style={{ background: '#27ae60', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>View File</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;
