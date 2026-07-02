import { normalizeRole, getDashboardPath, getDashboardLabel } from './roleUtils';

describe('role utils', () => {
  it('normalizes roles to the supported values', () => {
    expect(normalizeRole('admin')).toBe('ADMIN');
    expect(normalizeRole('Doctor')).toBe('DOCTOR');
    expect(normalizeRole('patient')).toBe('PATIENT');
    expect(normalizeRole()).toBe('PATIENT');
  });

  it('maps roles to the correct dashboard path', () => {
    expect(getDashboardPath('ADMIN')).toBe('/admin');
    expect(getDashboardPath('DOCTOR')).toBe('/doctor');
    expect(getDashboardPath('patient')).toBe('/patient');
  });

  it('returns the correct dashboard label for each role', () => {
    expect(getDashboardLabel('ADMIN')).toBe('Admin Dashboard');
    expect(getDashboardLabel('DOCTOR')).toBe('Doctor Dashboard');
    expect(getDashboardLabel('patient')).toBe('Patient Dashboard');
    expect(getDashboardLabel()).toBe('Patient Dashboard');
  });
});
