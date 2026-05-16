import { useState, useEffect } from 'react';

const HISTORY_KEY = 'textAnalyzerHistory';

export const useHistory = () => {
  const [history, setHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error('Failed to load history from localStorage', error);
    }
    return [];
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage', error);
    }
  }, [history]);

  const addHistoryItem = (item) => {
    const newItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...item
    };
    
    setHistory((prev) => {
      const newHistory = [newItem, ...prev];
      // Keep only the last 50 items to prevent localStorage overflow
      return newHistory.slice(0, 50);
    });
  };

  const deleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory
  };
};
