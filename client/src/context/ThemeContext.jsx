import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [branding, setBranding] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        let res;
        if (isAuthenticated) {
          res = await api.get('/v1/branding');
        } else {
          res = await api.get('/v1/branding/public');
        }
        
        if (res.data?.success && res.data.data) {
          const brandData = res.data.data;
          setBranding(brandData);
          if (brandData.theme) {
            setTheme(brandData.theme.toLowerCase() === 'dark' ? 'dark' : 'light');
          }
          
          // Inject White Label Colors
          if (brandData.primaryColor) {
            document.documentElement.style.setProperty('--color-primary', brandData.primaryColor);
          }
          if (brandData.secondaryColor) {
            document.documentElement.style.setProperty('--color-secondary', brandData.secondaryColor);
          }
          if (brandData.accentColor) {
            document.documentElement.style.setProperty('--color-accent', brandData.accentColor);
          }
          if (brandData.fontFamily) {
            document.documentElement.style.setProperty('--font-family', brandData.fontFamily);
            document.body.style.fontFamily = `var(--font-family), sans-serif`;
          }
        }
      } catch (error) {
        console.error('Error fetching branding:', error);
      }
    };
    
    fetchBranding();
  }, [isAuthenticated]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, branding }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
