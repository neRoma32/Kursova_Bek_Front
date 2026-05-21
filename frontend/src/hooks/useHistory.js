import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useHistory = (mode = 'analyze') => {
  const { currentUser } = useAuth();
  
  // Scoping history under current user ID and mode, fallback to guest history
  const historyKey = currentUser 
    ? `textAnalyzerHistory_${mode}_${currentUser.id}` 
    : `textAnalyzerHistory_${mode}_guest`;

  const [history, setHistory] = useState([]);

  // Load history whenever the logged-in user changes
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(historyKey);
      setHistory(storedHistory ? JSON.parse(storedHistory) : []);
    } catch (error) {
      console.error('Failed to load history from localStorage', error);
      setHistory([]);
    }
  }, [historyKey]);

  const addHistoryItem = (item) => {
    const newItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...item
    };
    
    setHistory((prev) => {
      const newHistory = [newItem, ...prev];
      const sliced = newHistory.slice(0, 50); // Keep only the last 50 items
      try {
        localStorage.setItem(historyKey, JSON.stringify(sliced));
      } catch (error) {
        console.error('Failed to save history to localStorage', error);
      }
      return sliced;
    });
  };

  const deleteHistoryItem = (id) => {
    setHistory((prev) => {
      const newHistory = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(historyKey, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save history to localStorage', error);
      }
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.setItem(historyKey, JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear history in localStorage', error);
    }
  };

  return {
    history,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory
  };
};
