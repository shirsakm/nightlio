// Prefer Vite envs; allow overriding API base via VITE_API_URL in any mode
function normalizeBaseUrl(raw) {
  let v = raw ?? '';
  if (typeof v !== 'string') v = String(v);
  v = v.trim();
  // Handle cases like '""' or "''" injected by build-time env
  if (v === '""' || v === "''") v = '';
  // Strip surrounding quotes and any stray quotes
  v = v.replace(/^['"]+|['"]+$/g, '');
  v = v.replace(/["']/g, '');
  // Remove trailing slashes
  v = v.replace(/\/+$/g, '');
  return v;
}

const API_BASE_URL = normalizeBaseUrl(
  (typeof import.meta !== 'undefined' && import.meta.env && 'VITE_API_URL' in import.meta.env)
    ? import.meta.env.VITE_API_URL
    : '' // Use relative /api in both dev and prod; Vite proxy handles dev, nginx handles prod
);

class ApiService {
  constructor() {
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    // Safe-join base + endpoint, honoring relative mode when base is empty
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // If base is a relative prefix like '/api', and endpoint already starts with '/api',
    // avoid double-prefixing (i.e., '/api' + '/api/config' -> '/api/config').
    const base = API_BASE_URL;
    let url;
    if (!base) {
      url = path;
    } else if (/^https?:\/\//i.test(base)) {
      url = `${base}${path}`;
    } else {
      // Treat base as a path prefix
      const baseNoTrail = base.replace(/\/+$/g, '');
      if (path === baseNoTrail || path.startsWith(`${baseNoTrail}/`)) {
        url = path; // endpoint already includes the base prefix
      } else {
        url = `${baseNoTrail}${path}`;
      }
    }
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
      // console.log('API Request with token:', this.token.substring(0, 20) + '...');
    } else {
      // console.log('API Request WITHOUT token');
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        // Try to parse JSON error, else include text snippet to aid debugging
        let errorMessage = `HTTP error! status: ${response.status}`;
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData && (errorData.error || errorData.message)) {
            errorMessage = errorData.error || errorData.message;
          }
        } else {
          const text = await response.text().catch(() => '');
          if (text) errorMessage += ` | body: ${text.slice(0, 200)}`;
        }
        throw new Error(errorMessage);
      }
      // Parse JSON safely
      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but received: ${ct || 'unknown'} | body: ${text.slice(0, 200)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Public config
  async getPublicConfig() {
    return this.request('/api/config');
  }

  // Authentication endpoints
  async googleAuth(googleToken) {
    return this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
  }

  async localLogin() {
    return this.request('/api/auth/local/login', {
      method: 'POST',
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

  // Achievement endpoints
  async getUserAchievements() {
    return this.request('/api/achievements');
  }

  async checkAchievements() {
    return this.request('/api/achievements/check', {
      method: 'POST',
    });
  }

  // Web3 minting removed

  // -------- Goals endpoints --------
  async getGoals() {
    return this.request('/api/goals');
  }

  async createGoal(goal) {
    // Accept { title, description, frequency_per_week } or { title, description, frequency }
    const payload = { ...goal };
    if (payload.frequency && !payload.frequency_per_week) {
      // frequency like '3 days a week' -> 3
      const n = parseInt(String(payload.frequency).trim(), 10);
      if (!Number.isNaN(n)) payload.frequency_per_week = n;
      delete payload.frequency;
    }
    return this.request('/api/goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateGoal(goalId, patch) {
    const payload = { ...patch };
    if (payload.frequency && !payload.frequency_per_week) {
      const n = parseInt(String(payload.frequency).trim(), 10);
      if (!Number.isNaN(n)) payload.frequency_per_week = n;
      delete payload.frequency;
    }
    return this.request(`/api/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteGoal(goalId) {
    return this.request(`/api/goals/${goalId}`, { method: 'DELETE' });
  }

  async incrementGoalProgress(goalId) {
    return this.request(`/api/goals/${goalId}/progress`, { method: 'POST' });
  }
}

const apiService = new ApiService();
export default apiService;