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
  }, [theme, accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeAccent = (color) => {
    setAccentColor(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, changeAccent }}>
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
