export const doctorProfiles = [
  {
    id: 1,
    name: 'Dr. John Smith',
    specialty: 'Cardiologist',
    qualification: 'MBBS, MD (Cardiology)',
    experience: 15,
    consultationFee: 800,
    department: 'Cardiology',
    availability: 'Mon - Fri, 9:00 AM - 5:00 PM',
    description: 'Specializes in preventive cardiology and advanced heart care.',
  },
  {
    id: 2,
    name: 'Dr. Sarah Lee',
    specialty: 'Neurologist',
    qualification: 'MBBS, DM (Neurology)',
    experience: 12,
    consultationFee: 750,
    department: 'Neurology',
    availability: 'Tue - Sat, 10:00 AM - 6:00 PM',
    description: 'Focused on neurological disorders, stroke recovery, and brain health.',
  },
  {
    id: 3,
    name: 'Dr. Ananya Rao',
    specialty: 'Pediatrician',
    qualification: 'MBBS, DCH',
    experience: 10,
    consultationFee: 650,
    department: 'Pediatrics',
    availability: 'Mon - Thu, 8:00 AM - 4:00 PM',
    description: 'Provides compassionate pediatric care for infants and children.',
  },
  {
    id: 4,
    name: 'Dr. Michael Chen',
    specialty: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: 14,
    consultationFee: 900,
    department: 'Orthopedics',
    availability: 'Wed - Sun, 9:30 AM - 7:00 PM',
    description: 'Expert in joint replacement, sports injuries, and orthopedic surgery.',
  },
];

export const getDoctorProfileById = (id) => {
  const doctorId = Number(id);
  return doctorProfiles.find((doctor) => doctor.id === doctorId) || null;
};
