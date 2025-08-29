import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  light: {
    // Background colors
    background: '#f8fafc',
    cardBackground: '#ffffff',
    headerBackground: '#ffffff',
    modalBackground: '#ffffff',
    
    // Text colors
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#e5e7eb',
    borderLight: '#f1f5f9',
    
    // Button colors
    buttonPrimary: '#3b82f6',
    buttonPrimaryHover: '#2563eb',
    buttonSecondary: '#6b7280',
    buttonSecondaryHover: '#4b5563',
    
    // Status colors
    success: '#22c55e',
    successBg: '#f0fdf4',
    successBorder: '#bbf7d0',
    warning: '#f59e0b',
    warningBg: '#fffbeb',
    warningBorder: '#fed7aa',
    error: '#ef4444',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
    info: '#3b82f6',
    infoBg: '#eff6ff',
    infoBorder: '#bfdbfe',
    
    // Hover effects
    hoverBg: '#f8fafc',
    hoverBgLight: '#f1f5f9',
    
    // Shadows
    shadow: '0 4px 6px rgba(0,0,0,0.05)',
    shadowHover: '0 4px 12px rgba(0,0,0,0.1)',
    shadowModal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  dark: {
    // Background colors
    background: '#0f172a',
    cardBackground: '#1e293b',
    headerBackground: '#1e293b',
    modalBackground: '#1e293b',
    
    // Text colors
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#334155',
    borderLight: '#475569',
    
    // Button colors
    buttonPrimary: '#3b82f6',
    buttonPrimaryHover: '#2563eb',
    buttonSecondary: '#64748b',
    buttonSecondaryHover: '#475569',
    
    // Status colors
    success: '#22c55e',
    successBg: '#064e3b',
    successBorder: '#166534',
    warning: '#f59e0b',
    warningBg: '#451a03',
    warningBorder: '#92400e',
    error: '#ef4444',
    errorBg: '#450a0a',
    errorBorder: '#dc2626',
    info: '#3b82f6',
    infoBg: '#1e3a8a',
    infoBorder: '#1d4ed8',
    
    // Hover effects
    hoverBg: '#334155',
    hoverBgLight: '#475569',
    
    // Shadows
    shadow: '0 4px 6px rgba(0,0,0,0.3)',
    shadowHover: '0 4px 12px rgba(0,0,0,0.4)',
    shadowModal: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('brokerhub-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const currentTheme = isDarkMode ? themes.dark : themes.light;

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('brokerhub-theme', newTheme ? 'dark' : 'light');
  };

  // Apply theme to document body
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('brokerhub-theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    isDarkMode,
    theme: currentTheme,
    toggleTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
