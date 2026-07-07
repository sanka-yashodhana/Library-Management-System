const API_URL = 'https://library-management-system-xi-umber.vercel.app/';

const authApi = {
  login: async (email, password, role) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  register: async (user) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },
};

export default authApi;
