export const getDisplayName = (user = {}) => user.fullName || user.full_name || user.name || user.email || 'User';

export const getUserEmail = (user = {}) => user.email || 'Not provided';

export const getUserPhone = (user = {}) => user.phone || 'Not provided';

export const getUserAddress = (user = {}) => user.address || 'Not provided';
