import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useMoodData = () => {
  const [pastEntries, setPastEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getMoodEntries();
      
      // Fetch selections for each entry
      const entriesWithSelections = await Promise.all(
        data.map(async (entry) => {
          try {
            const selections = await apiService.getEntrySelections(entry.id);
            return { ...entry, selections };
          } catch (error) {
            console.error(`Failed to load selections for entry ${entry.id}:`, error);
            return { ...entry, selections: [] };
          }
        })
      );
      
      setPastEntries(entriesWithSelections);
    } catch (error) {
      console.error('Failed to load history:', error);
      setError('Failed to load mood history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return {
    pastEntries,
    setPastEntries,
    loading,
    error,
    refreshHistory: loadHistory,
  };
};