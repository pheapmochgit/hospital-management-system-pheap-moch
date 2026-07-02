const AUTH_STORAGE_KEY = 'user';
const AUTH_EXPIRY_KEY = 'authExpiresAt';
const SESSION_TTL_MS = 30 * 60 * 1000;

export function getStoredUser() {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
  const expiresAt = localStorage.getItem(AUTH_EXPIRY_KEY);

  if (!storedUser || !expiresAt) {
    clearStoredUser();
    return null;
  }

  const expiryTime = Date.parse(expiresAt);
  if (Number.isNaN(expiryTime) || Date.now() > expiryTime) {
    clearStoredUser();
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    clearStoredUser();
    return null;
  }
}

export function persistUser(user) {
  const normalizedUser = user ? { ...user } : null;
  if (!normalizedUser) {
    clearStoredUser();
    return null;
  }

  const expiryTime = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
  localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime);
  return normalizedUser;
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}
