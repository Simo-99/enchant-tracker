import { useState, useEffect, useCallback } from 'react';
import { enchantmentApi } from '../api/enchantmentApi';

export function useEnchantments() {
  const [enchantments, setEnchantments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEnchant, setSelectedEnchant] = useState(null);

  const fetchEnchantments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await enchantmentApi.getAll();
      setEnchantments(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message || 'Error fetching enchantments from server.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnchantments();
  }, [fetchEnchantments]);

  const toggleFound = async (id, currentFound, e) => {
    if (e) e.stopPropagation();
    try {
      await enchantmentApi.toggleFound(id, !currentFound);

      setEnchantments(prev =>
        prev.map(item => (item.id === id ? { ...item, found: !currentFound } : item))
      );

      setSelectedEnchant(prev =>
        prev && prev.id === id ? { ...prev, found: !currentFound } : prev
      );
    } catch (err) {
      alert(err.message || 'Unable to update status.');
    }
  };

  const deleteEnchantment = async (id) => {
    try {
      await enchantmentApi.delete(id);
      setSelectedEnchant(null);
      await fetchEnchantments();
    } catch (err) {
      alert(err.message || 'Error deleting enchantment.');
    }
  };

  const refreshDetails = async (id) => {
    const data = await fetchEnchantments();
    if (data) {
      const updated = data.find(item => item.id === id);
      if (updated) setSelectedEnchant(updated);
    }
  };

  return {
    enchantments,
    loading,
    error,
    selectedEnchant,
    setSelectedEnchant,
    fetchEnchantments,
    toggleFound,
    deleteEnchantment,
    refreshDetails,
  };
}
