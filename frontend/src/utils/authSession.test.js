import { getStoredUser, persistUser, clearStoredUser } from './authSession';

describe('auth session helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-02T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when no stored session exists', () => {
    expect(getStoredUser()).toBeNull();
  });

  it('ignores stale sessions that are older than the expiry window', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, role: 'PATIENT' }));
    localStorage.setItem('authExpiresAt', '2026-07-02T11:59:00Z');

    expect(getStoredUser()).toBeNull();
  });

  it('persists a valid session and reads it back', () => {
    const user = { id: 1, role: 'doctor' };

    persistUser(user);

    expect(getStoredUser()).toEqual({ id: 1, role: 'doctor' });
  });

  it('clears the saved session', () => {
    persistUser({ id: 1, role: 'admin' });
    clearStoredUser();

    expect(getStoredUser()).toBeNull();
  });
});
