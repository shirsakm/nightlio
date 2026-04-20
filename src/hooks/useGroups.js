import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name) => {
    try {
      await apiService.createGroup({ name });
      await loadGroups(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Failed to create group:', error);
      setError('Failed to create category');
      return false;
    }
  };

  const createGroupOption = async (groupId, name) => {
    try {
      await apiService.createGroupOption(groupId, { name });
      await loadGroups(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Failed to create group option:', error);
      setError('Failed to create option');
      return false;
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await apiService.deleteGroup(groupId);
      await loadGroups(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Failed to delete group:', error);
      setError('Failed to delete category');
      return false;
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    createGroup,
    createGroupOption,
    deleteGroup,
    refreshGroups: loadGroups,
  };
};
