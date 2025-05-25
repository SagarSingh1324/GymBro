import { clearAllData } from '@/localstorage/storage';
import { Theme, useTheme } from '@/theme/ThemeContext';
import Constants from 'expo-constants';
import React from 'react';
import { Alert, Linking, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const styles = createStyles(theme);

  const handleThemeToggle = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    // await saveTheme(newTheme);
    toggleTheme();
  };

  const handleResetData = () => {
    Alert.alert('Reset All Data', 'Are you sure you want to erase all saved data?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: clearAllData },
    ]);
  };
  
  const handleSendFeedback = () => {
    const subject = encodeURIComponent(`Feedback for GymBro app v${Constants.expoConfig?.version || '1.0.0'}`);
    const body = encodeURIComponent('');
    const email = 'sagarsinghprj@gmail.com';
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch((err) => console.error('Failed to open email app:', err));
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      {/* Settings Sections */}
      <View style={styles.content}>
        {/* 1. Theme toggle */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <Text style={styles.label}>Dark Mode</Text>
            <Text style={styles.description}>Toggle between light and dark theme</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeToggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor={theme.border}
          />
        </View>

        {/* 2. Erase all data */}
        <TouchableOpacity style={styles.section} onPress={handleResetData}>
          <View style={styles.sectionContent}>
            <Text style={[styles.label, styles.destructiveText]}>Erase All Data</Text>
            <Text style={styles.description}>Permanently delete all saved workouts and data</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* 3. Feedback button */}
        <TouchableOpacity style={styles.section} onPress={handleSendFeedback}>
          <View style={styles.sectionContent}>
            <Text style={styles.label}>Send Feedback</Text>
            <Text style={styles.description}>Help us improve the app</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* 4. App version */}
        <View style={[styles.section, styles.versionSection]}>
          <View style={styles.sectionContent}>
            <Text style={styles.label}>App Version</Text>
            <Text style={styles.versionText}>
              {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.secondary,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  sectionContent: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: theme.text,
    opacity: 0.7,
  },
  destructiveText: {
    color: '#FF3B30',
  },
  chevron: {
    fontSize: 20,
    color: theme.text,
    opacity: 0.3,
    fontWeight: '300',
  },
  versionSection: {
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
    marginTop: 2,
  },
});