const VALID_ROLES = ['ANALYST', 'OPS', 'ADMIN'];

export function login(username, role) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!VALID_ROLES.includes(role)) {
        reject(new Error('Invalid role selected'));
        return;
      }

      if (!username || username.trim().length < 2) {
        reject(new Error('Username must be at least 2 characters'));
        return;
      }

      resolve({
        id: `${role}-${Date.now()}`,
        name: username.trim(),
        role,
        token: 'mock-jwt-token',
        expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour expiry
      });
    }, 800);
  });
}