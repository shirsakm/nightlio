const API_BASE_URL = '/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Mood entries
  async getMoodEntries(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/moods${query}`);
  }

  async createMoodEntry(data) {
    return this.request('/mood', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMoodEntry(id) {
    return this.request(`/mood/${id}`);
  }

  async updateMoodEntry(id, data) {
    return this.request(`/mood/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMoodEntry(id) {
    return this.request(`/mood/${id}`, {
      method: 'DELETE',
    });
  }

  // Groups
  async getGroups() {
    return this.request('/groups');
  }

  async createGroup(name) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteGroup(id) {
    return this.request(`/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async createGroupOption(groupId, name) {
    return this.request(`/groups/${groupId}/options`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteGroupOption(optionId) {
    return this.request(`/options/${optionId}`, {
      method: 'DELETE',
    });
  }

  // Entry selections
  async getEntrySelections(entryId) {
    return this.request(`/mood/${entryId}/selections`);
  }

  // Statistics
  async getStatistics() {
    return this.request('/statistics');
  }

  async getCurrentStreak() {
    return this.request('/streak');
  }

  // Time
  async getCurrentTime() {
    return this.request('/time');
  }
}

export default new ApiService();