import React, { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI, patientAPI, reportAPI, prescriptionAPI } from '../services/api';
import { getDisplayName } from '../utils/userDisplay';

function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordCount, setRecordCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const getDateLabel = (dateString) => {
    const today = new Date().toISOString().slice(0, 10);
    if (dateString === today) return 'Today';
    if (dateString > today) return 'Upcoming';
    return 'Past';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!user?.id) {
          setAppointments([]);
          setProfile(null);
          setPatientCount(0);
          setUpcomingCount(0);
          setTodayCount(0);
          setRecordCount(0);
          setPrescriptionCount(0);
          setLoading(false);
          return;
        }

        const doctorRes = await doctorAPI.getByUserId(user.id).catch(() => ({ data: null }));
        const matchedDoctor = doctorRes.data;
        const doctorRecordId = matchedDoctor?.id ?? null;

        if (!doctorRecordId) {
          setAppointments([]);
          setProfile(matchedDoctor);
          setPatientCount(0);
          setUpcomingCount(0);
          setTodayCount(0);
          setRecordCount(0);
          setPrescriptionCount(0);
          setLoading(false);
          return;
        }

        const [appointmentsRes, reportsRes, prescriptionsRes, patientsRes] = await Promise.all([
          appointmentAPI.getByDoctor(doctorRecordId).catch(() => ({ data: [] })),
          reportAPI.getByDoctor(doctorRecordId).catch(() => ({ data: [] })),
          prescriptionAPI.getByDoctor(doctorRecordId).catch(() => ({ data: [] })),
          patientAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const appointments = appointmentsRes.data || [];
        const reports = reportsRes.data || [];
        const prescriptions = prescriptionsRes.data || [];
        const patients = patientsRes.data || [];

        const patientIdMap = new Map();
        patients.forEach((patient) => {
          const label = patient.name || patient.email || `Patient ${patient.id}`;
          if (patient.id != null) patientIdMap.set(patient.id, label);
          if (patient.userId != null) patientIdMap.set(patient.userId, label);
        });

        const normalizedPatientIds = new Set(
          appointments.map((apt) => patientIdMap.get(apt.patientId) ?? apt.patientId)
        );

        const displayAppointments = appointments.map((apt) => ({
          ...apt,
          patientName: patientIdMap.get(apt.patientId) || `Patient ${apt.patientId}`,
        }));

        const today = new Date().toISOString().slice(0, 10);
        const upcoming = appointments.filter((apt) => apt.date >= today && apt.status !== 'CANCELLED').length;
        const todayAppointments = appointments.filter((apt) => apt.date === today && apt.status !== 'CANCELLED').length;

        const doctorReports = reports;

        setAppointments(displayAppointments.slice(0, 3));
        setProfile(matchedDoctor);
        setPatientCount(normalizedPatientIds.size);
        setUpcomingCount(upcoming);
        setTodayCount(todayAppointments);
        setRecordCount(doctorReports.length);
        setPrescriptionCount(prescriptions.length);
      } catch (error) {
        console.error('Error loading doctor dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('doctorAppointmentsUpdated', handleUpdate);
    return () => {
      window.removeEventListener('doctorAppointmentsUpdated', handleUpdate);
    };
  }, [user.id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px', fontSize: '24px' }}>Welcome, {getDisplayName(user)}</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '4px' }}><strong>Doctor ID:</strong> {profile?.id != null ? profile.id : 'Not available'}</p>
        <p style={{ color: '#7f8c8d', marginBottom: '4px' }}><strong>Qualification:</strong> {profile?.qualification || 'Not provided'}</p>
        <p style={{ color: '#7f8c8d', marginBottom: '4px' }}><strong>Experience:</strong> {profile?.experience != null ? `${profile.experience} years` : 'Not provided'}</p>
        <p style={{ color: '#7f8c8d', margin: 0 }}><strong>Consultation Fee:</strong> {profile?.consultationFee != null ? `$ ${profile.consultationFee}` : 'Not provided'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Today', value: todayCount, color: '#60a5fa' },
          { label: 'Upcoming', value: upcomingCount, color: '#34d399' },
          { label: 'Patients', value: patientCount, color: '#fbbf24' },
          { label: 'Records', value: recordCount, color: '#8b5cf6' },
          { label: 'Prescriptions', value: prescriptionCount, color: '#f97316' },
        ].map((item) => (
          <div key={item.label} style={{ background: 'white', padding: '18px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: item.color, fontSize: '28px', marginBottom: '6px', fontWeight: '700' }}>{item.value}</h3>
            <p style={{ color: '#7f8c8d', margin: 0 }}>{item.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ecf0f1' }}>
          <h2 style={{ color: '#2c3e50', fontSize: '18px', margin: 0 }}>Recent Appointments</h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Patient</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Time</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>When</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                <td style={{ padding: '15px' }}>{apt.id}</td>
                <td style={{ padding: '15px' }}>{apt.patientName || apt.patientId}</td>
                <td style={{ padding: '15px' }}>{apt.date}</td>
                <td style={{ padding: '15px' }}>{apt.time}</td>
                <td style={{ padding: '15px' }}>{getDateLabel(apt.date)}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DoctorDashboard;
