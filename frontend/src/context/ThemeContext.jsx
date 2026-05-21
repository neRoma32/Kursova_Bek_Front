import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('themeAccent') || 'blue';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old classes
    root.classList.remove('light', 'dark');
    root.classList.remove('theme-blue', 'theme-purple', 'theme-orange', 'theme-green');

    // Add new classes
    root.classList.add(theme);
    root.classList.add(`theme-${accentColor}`);

    // Save to localStorage
    localStorage.setItem('themeMode', theme);
    localStorage.setItem('themeAccent', accentColor);

    // Sync theme settings to active user profile
    try {
      const currentUserStr = localStorage.getItem('textAnalyzer_currentUser') || sessionStorage.getItem('textAnalyzer_currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.themeMode !== theme || currentUser.themeAccent !== accentColor) {
          currentUser.themeMode = theme;
          currentUser.themeAccent = accentColor;
          
          // Save back to active session
          if (localStorage.getItem('textAnalyzer_currentUser')) {
            localStorage.setItem('textAnalyzer_currentUser', JSON.stringify(currentUser));
          } else {
            sessionStorage.setItem('textAnalyzer_currentUser', JSON.stringify(currentUser));
          }
          
          // Save back to users list
          const usersStr = localStorage.getItem('textAnalyzer_users');
          if (usersStr) {
            const users = JSON.parse(usersStr);
            const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, themeMode: theme, themeAccent: accentColor } : u);
            localStorage.setItem('textAnalyzer_users', JSON.stringify(updatedUsers));
          }
        }
      }
    } catch (e) {
      console.error('Error syncing theme settings to current user profile', e);
    }
  }, [theme, accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeAccent = (color) => {
    setAccentColor(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, accentColor, setAccentColor, changeAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
