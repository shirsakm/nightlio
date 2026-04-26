import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. This now runs ONCE when the app starts
  const loadStatistics = useCallback(async (forceLoading = false) => {
    if (forceLoading) setLoading(true);
    
    setError(null);
    try {
      const data = await apiService.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, []); // Empty array makes this function reference permanent

  const loadStreak = useCallback(async () => {
    try {
      const data = await apiService.getCurrentStreak();
      setCurrentStreak(data.current_streak);
    } catch (error) {
      console.error('Failed to load streak:', error);
      setCurrentStreak(0);
    }
  }, []);

  // 2. This now runs exactly ONCE when the app starts
  useEffect(() => {
    loadStreak();
    loadStatistics();
  }, [loadStreak, loadStatistics]);

  return {
    statistics,
    currentStreak,
    loading,
    error,
    loadStatistics,
    refreshStreak: loadStreak,
  };
};