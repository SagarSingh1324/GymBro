import ThemedStatusBar from '@/components/ThemedStatusBar';
import { ThemeProvider } from '@/theme/ThemeContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedStatusBar />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
