import { Stack } from 'expo-router';

export default function LogScreens() {

  return (
      <Stack>
        <Stack.Screen name="Logsession" options={{ headerShown: false }} />
        <Stack.Screen name="Activesession" options={{ headerShown: false }} />
        <Stack.Screen name="Createtemplate" options={{ headerShown: false }} />
      </Stack>
  );
}
