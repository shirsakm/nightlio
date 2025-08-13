const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  constructor() {
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async googleAuth(googleToken) {
    return this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
  }

  async verifyToken(token) {
    return this.request('/api/auth/verify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Mood entries endpoints
  async getMoodEntries() {
    return this.request('/api/moods');
  }

  async createMoodEntry(entryData) {
    return this.request('/api/mood', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async updateMoodEntry(entryId, entryData) {
    return this.request(`/api/mood/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteMoodEntry(entryId) {
    return this.request(`/api/mood/${entryId}`, {
      method: 'DELETE',
    });
  }

  // Statistics endpoints
  async getStatistics() {
    return this.request('/api/statistics');
  }

  // Streak endpoint
  async getCurrentStreak() {
    return this.request('/api/streak');
  }

  // Groups endpoints
  async getGroups() {
    return this.request('/api/groups');
  }

  async createGroup(groupData) {
    return this.request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async createGroupOption(groupId, optionData) {
    return this.request(`/api/groups/${groupId}/options`, {
      method: 'POST',
      body: JSON.stringify(optionData),
    });
  }

  async deleteGroup(groupId) {
    return this.request(`/api/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  // Entry selections endpoint
  async getEntrySelections(entryId) {
    return this.request(`/api/mood/${entryId}/selections`);
  }
}

const apiService = new ApiService();
export default apiService;