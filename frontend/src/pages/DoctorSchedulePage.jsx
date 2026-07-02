import React, { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI, patientAPI } from '../services/api';

function DoctorSchedulePage({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        if (!userId) {
          setSchedule([]);
          setPatientMap({});
          setLoading(false);
          return;
        }

        const doctorRes = await doctorAPI.getByUserId(userId).catch(() => ({ data: null }));
        const doctorRecord = doctorRes.data;
        const doctorId = doctorRecord?.id;

        if (!doctorId) {
          setSchedule([]);
          setPatientMap({});
          setLoading(false);
          return;
        }

        const [appointmentsRes, patientsRes] = await Promise.all([
          appointmentAPI.getByDoctor(doctorId).catch(() => ({ data: [] })),
          patientAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const patients = (patientsRes.data || []).reduce((map, patient) => {
          const label = patient.name || patient.email || `Patient ${patient.id}`;
          if (patient.id != null) map[patient.id] = label;
          if (patient.userId != null) map[patient.userId] = label;
          return map;
        }, {});

        const acceptedAppointments = (appointmentsRes.data || [])
          .filter((apt) => apt.status === 'SCHEDULED')
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

        const today = new Date().toISOString().slice(0, 10);
        const todayAppointments = acceptedAppointments.filter((apt) => apt.date === today).length;
        const upcomingAppointments = acceptedAppointments.filter((apt) => apt.date > today).length;

        setPatientMap(patients);
        setSchedule(acceptedAppointments);
        setTodayCount(todayAppointments);
        setUpcomingCount(upcomingAppointments);
      } catch (error) {
        console.error('Error loading schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [userId]);

  const getWhenLabel = (dateString) => {
    const today = new Date().toISOString().slice(0, 10);
    if (dateString === today) return 'Today';
    if (dateString > today) return 'Upcoming';
    return 'Past';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading schedule...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>Doctor Schedule</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Your accepted appointments and schedule.</p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '18px', borderRadius: '12px', flex: '1 1 160px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#7f8c8d' }}>Today</p>
          <p style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>{todayCount}</p>
        </div>
        <div style={{ background: 'white', padding: '18px', borderRadius: '12px', flex: '1 1 160px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#7f8c8d' }}>Upcoming</p>
          <p style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: '700', color: '#16a34a' }}>{upcomingCount}</p>
        </div>
      </div>

      {schedule.length === 0 ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', color: '#7f8c8d' }}>
          No schedule entries are available yet.
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#2c3e50', color: 'white' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>When</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Patient</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Appointment ID</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                  <td style={{ padding: '16px' }}>{item.date}</td>
                  <td style={{ padding: '16px' }}>{item.time}</td>
                  <td style={{ padding: '16px' }}>{getWhenLabel(item.date)}</td>
                  <td style={{ padding: '16px' }}>{patientMap[item.patientId] || `Patient ${item.patientId}`}</td>
                  <td style={{ padding: '16px' }}>{item.id}</td>
                  <td style={{ padding: '16px' }}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DoctorSchedulePage;
