import api from './api'

export const userService = {
  async updateProfile(formData) {
    // Get token from localStorage (same logic as api.js)
    let token = null;
    try {
      const persistedState = localStorage.getItem('persist:recipewala-root');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        const authState = JSON.parse(parsed.auth);
        token = authState.accessToken;
      }
    } catch (e) { token = null; }
    return await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
  },
  async deleteAccount(password) {
    return await api.delete('/users/account', { data: { password } })
  },
  async getProfile() {
    return await api.get('/users/profile')
  }
}
