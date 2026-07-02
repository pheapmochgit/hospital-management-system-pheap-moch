import { getDisplayName, getUserEmail, getUserPhone, getUserAddress } from './userDisplay';

describe('userDisplay helpers', () => {
  it('returns the best available display name', () => {
    expect(getDisplayName({ fullName: 'Jane Doe' })).toBe('Jane Doe');
    expect(getDisplayName({ full_name: 'Jane Doe' })).toBe('Jane Doe');
    expect(getDisplayName({ email: 'jane@example.com' })).toBe('jane@example.com');
  });

  it('returns fallback values for email, phone, and address', () => {
    expect(getUserEmail({ email: 'jane@example.com' })).toBe('jane@example.com');
    expect(getUserPhone({ phone: '1234567890' })).toBe('1234567890');
    expect(getUserAddress({ address: '123 Main St' })).toBe('123 Main St');
  });
});
