import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDisplayName } from '../utils/userDisplay';
import { getDashboardPath, normalizeRole } from '../utils/roleUtils';

const services = [
  { title: 'Cardiology', icon: '🫀', desc: 'Advanced heart care and diagnostic services.' },
  { title: 'Dental', icon: '🦷', desc: 'Modern dental treatment for every age.' },
  { title: 'Emergency', icon: '🚑', desc: 'Rapid response care available 24/7.' },
  { title: 'Pediatrics', icon: '👶', desc: 'Children-focused treatment with comfort-first care.' },
  { title: 'Neurology', icon: '🧠', desc: 'Expert support for brain and nervous system conditions.' },
  { title: 'Orthopedics', icon: '🦴', desc: 'Precision treatment for bones and joints.' },
];

const doctors = [
  { id: 1, name: 'Dr. John Smith', specialty: 'Cardiologist' },
  { id: 2, name: 'Dr. Sarah Lee', specialty: 'Neurologist' },
  { id: 3, name: 'Dr. Ananya Rao', specialty: 'Pediatrician' },
  { id: 4, name: 'Dr. Michael Chen', specialty: 'Orthopedic Surgeon' },
];

const departments = [
  'Emergency Care',
  'Radiology',
  'Laboratory',
  'Pharmacy',
  'ICU',
  'Surgery',
];

const features = [
  'Experienced doctors and caring staff',
  'Easy online appointment booking',
  '24/7 emergency support',
  'Digital medical records',
];

function HomePage({ user }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const role = user ? normalizeRole(user.role) : null;
  const dashboardPath = role ? getDashboardPath(role) : null;
  const roleLabel = role ? `${role.charAt(0)}${role.slice(1).toLowerCase()}` : '';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -80px 0px' }
    );

    document.querySelectorAll('.scroll-animate').forEach((section) => {
      observer.observe(section);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 22);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8ff', color: '#1f2937' }}>
      <header className={`homepage-header ${isScrolled ? 'scrolled' : ''}`}>
          <div className="homepage-header-inner">
            <div className="homepage-brand">Hospital Management System</div>
            <nav className="homepage-nav">
              <a href="#home">Home</a>
              <a href="#services">Services</a>
              <a href="#doctors">Doctors</a>
              <a href="#departments">Departments</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="homepage-header-actions">
              {user ? (
                <>
                  <Link to={dashboardPath} className="header-user-chip">
                    <span>{getDisplayName(user)}</span>
                    <span className="header-user-role">{roleLabel}</span>
                  </Link>
                  <Link to="/" className="header-link outline">Home</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="header-link outline">Login</Link>
                  <Link to="/register" className="header-link solid">Register</Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main>
          <section id="home" className="scroll-animate" style={{ maxWidth: '1200px', margin: '0 auto', padding: '70px 24px 50px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px', alignItems: 'center' }}>
            <div>
              <p style={{ textTransform: 'uppercase', letterSpacing: '2px', color: '#1e88e5', fontWeight: '700', marginBottom: '12px' }}>Welcome to Hospital Management System</p>
              <h1 style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '16px', color: '#0f172a' }}>Modern healthcare for every patient, every day.</h1>
              <p style={{ fontSize: '18px', color: '#475569', marginBottom: '24px' }}>Book appointments, view reports, and access expert care from a single trusted platform.</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/book-appointment" style={{ background: '#1e88e5', color: 'white', padding: '12px 18px', borderRadius: '999px', textDecoration: 'none', fontWeight: '600' }}>
                  Book Appointment
                </Link>
                <a href="#about" style={{ border: '1px solid #cbd5e1', color: '#0f172a', padding: '12px 18px', borderRadius: '999px', textDecoration: 'none', fontWeight: '600' }}>Learn More</a>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 12px 40px rgba(15, 76, 129, 0.12)' }}>
              <ul style={{ paddingLeft: '18px', color: '#475569', lineHeight: '1.8' }}>
                <li>Fast online booking</li>
                <li>Qualified specialists</li>
                <li>Secure records and follow-ups</li>
                <li>Comfortable, trusted care</li>
              </ul>
            </div>
          </section>

          <section id="services" className="scroll-animate" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
            <h2 style={{ fontSize: '30px', marginBottom: '12px', color: '#0f172a' }}>Our Services</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Comprehensive care across major specialties.</p>
            <div className="services-grid">
              {services.map((service, index) => (
                <div
                  key={service.title}
                  className={`scroll-animate service-card ${index >= 4 ? 'service-card--wide' : ''}`}
                >
                  <div className="service-card-icon">{service.icon}</div>
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="doctors" className="scroll-animate" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
            <h2 style={{ fontSize: '30px', marginBottom: '12px', color: '#0f172a' }}>Featured Doctors</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {doctors.map((doctor) => (
                <div key={doctor.name} className="scroll-animate" style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>👨‍⚕️</div>
                  <h3 style={{ color: '#0f4c81', marginBottom: '4px' }}>{doctor.name}</h3>
                  <p style={{ color: '#64748b', marginBottom: '8px' }}>{doctor.specialty}</p>
                  <Link to={`/doctor-profile/${doctor.id}`} style={{ color: '#1e88e5', fontWeight: '600', textDecoration: 'none' }}>View Profile →</Link>
                </div>
              ))}
            </div>
          </section>

          <section id="departments" className="scroll-animate" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
            <h2 style={{ fontSize: '30px', marginBottom: '12px', color: '#0f172a' }}>Departments</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {departments.map((department) => (
                <div key={department} className="scroll-animate" style={{ background: 'white', padding: '16px', borderRadius: '14px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', fontWeight: '600', color: '#334155' }}>{department}</div>
              ))}
            </div>
          </section>

          <section id="about" className="scroll-animate" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 60px', display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: '24px' }}>
            <div style={{ background: '#0f4c81', color: 'white', padding: '24px', borderRadius: '20px' }}>
              <h2 style={{ marginBottom: '12px' }}>Why Choose Us</h2>
              <ul style={{ paddingLeft: '18px', lineHeight: '1.8' }}>
                {features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </div>
            <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
              <h3 style={{ color: '#0f4c81', marginBottom: '8px' }}>Fast, friendly and digital</h3>
              <p style={{ color: '#475569', lineHeight: '1.7' }}>From booking care to tracking appointments and medical reports, our system keeps your hospital experience simple and reliable.</p>
            </div>
          </section>
        </main>

        <footer id="contact" style={{ background: '#0f172a', color: 'white', padding: '24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ marginBottom: '8px' }}>Contact</h3>
              <p>Address: 123 Main street Phnom Penh </p>
              <p>Phone: +855 31 92 76 888</p>
              <p>Email: support@hospitalcare.com</p>
            </div>
            <div>
              <h3 style={{ marginBottom: '8px' }}>Quick Links</h3>
              <p><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link></p>
              <p><Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link></p>
            </div>
          </div>
        </footer>
      </div>
  );
}

export default HomePage;
