import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getMoodMusic = async (tag) => {
  try {
    const response = await axios.get(`${API_URL}/music/vibe`, { params: { tag } });
    return response.data; // { audio_url, track_name, artist }
  } catch (error) {
    console.error("Failed to fetch music:", error);
    return null;
  }
};