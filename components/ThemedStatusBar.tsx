import { useTheme } from '@/theme/ThemeContext';
import { StatusBar } from 'expo-status-bar';

export default function ThemedStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}