import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();

  return (
    <Tabs
      initialRouteName='(logsession)'
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: isDarkMode ? '#8E8E93' : '#999999',
        tabBarLabelStyle: {
          color: theme.text,
        },
      }}>
      <Tabs.Screen
        name="(logsession)"
        options={{
          title: 'Log Session',
          tabBarIcon: ({ color }) => (
          <Ionicons name={Platform.OS === 'ios' ? 'barbell-outline' : 'barbell-sharp'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Measure"
        options={{
          title: 'Measure',
          tabBarIcon: ({ color }) => (
          <Ionicons name={Platform.OS === 'ios' ? 'body-outline' : 'body'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
          <Ionicons name={Platform.OS === 'ios' ? 'time-outline' : 'time'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
        title: 'Settings',
        tabBarIcon: ({ color }) => (
        <Ionicons name={Platform.OS === 'ios' ? 'settings-outline' : 'settings'} size={24} color={color} />
        ),
        }}
      />
    </Tabs>
  );
}