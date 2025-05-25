import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type Theme = {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
};

export type ThemePreference = 'light' | 'dark' | 'system';

export type ThemeContextType = {
  theme: Theme;
  isDarkMode: boolean;
  themePreference: ThemePreference;
  toggleTheme: (preference?: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const lightTheme: Theme = {
  background: '#ffffff',
  text: '#000000',
  primary: '#007AFF',
  secondary: '#f2f2f2',
  border: '#e1e1e1',
};

export const darkTheme: Theme = {
  background: '#000000',
  text: '#ffffff',
  primary: '#007AFF',
  secondary: '#1c1c1e',
  border: '#38383a',
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (themePreference === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themePreference]);

  const loadThemePreference = async (): Promise<void> => {
    try {
      const savedPreference = await AsyncStorage.getItem('themePreference');
      if (savedPreference && isValidThemePreference(savedPreference)) {
        setThemePreference(savedPreference as ThemePreference);
        if (savedPreference !== 'system') {
          setIsDarkMode(savedPreference === 'dark');
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const isValidThemePreference = (value: string): value is ThemePreference => {
    return ['light', 'dark', 'system'].includes(value);
  };

  const toggleTheme = async (preference?: ThemePreference): Promise<void> => {
    let newPreference: ThemePreference;
    
    if (preference) {
      newPreference = preference;
    } else {
      // Cycle through: system -> light -> dark -> system
      if (themePreference === 'system') {
        newPreference = 'light';
      } else if (themePreference === 'light') {
        newPreference = 'dark';
      } else {
        newPreference = 'system';
      }
    }

    setThemePreference(newPreference);
    
    if (newPreference === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    } else {
      setIsDarkMode(newPreference === 'dark');
    }

    try {
      await AsyncStorage.setItem('themePreference', newPreference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    isDarkMode,
    themePreference,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};