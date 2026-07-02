const validRoles = ['ADMIN', 'DOCTOR', 'PATIENT'];

export const normalizeRole = (role) => {
  if (!role) return 'PATIENT';

  const normalized = String(role)
    .trim()
    .toUpperCase()
    .replace(/ROLE_/g, '');

  const candidates = normalized.split(/[,;|\s]+/).filter(Boolean);
  for (const candidate of candidates) {
    if (validRoles.includes(candidate)) {
      return candidate;
    }
  }

  return 'PATIENT';
};

export const getDashboardPath = (role) => {
  switch (normalizeRole(role)) {
    case 'ADMIN':
      return '/admin';
    case 'DOCTOR':
      return '/doctor';
    case 'PATIENT':
    default:
      return '/patient';
  }
};

export const getDashboardLabel = (role) => {
  switch (normalizeRole(role)) {
    case 'ADMIN':
      return 'Admin Dashboard';
    case 'DOCTOR':
      return 'Doctor Dashboard';
    case 'PATIENT':
    default:
      return 'Patient Dashboard';
  }
};
