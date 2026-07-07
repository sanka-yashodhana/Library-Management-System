const API_URL = "https://library-management-system-xi-umber.vercel.app";

const usersApi = {
  /**
   * Get all users. Pass role='student'/'librarian'/'admin' to filter.
   */
  getAll: async (token, { role = '' } = {}) => {
    try {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      const url = `${API_URL}/api/users${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to fetch users' };
      return { success: true, users: data.users };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Get a single user by id.
   */
  getById: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'User not found' };
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Change a user's role (admin only).
   */
  updateRole: async (id, role, token) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to update role' };
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },

  /**
   * Delete a user by id (admin only).
   */
  deleteUser: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to delete user' };
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Is the server running?' };
    }
  },
};

export default usersApi;
