import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="result" options={{ title: '분석 결과', headerBackVisible: false }} />
        <Stack.Screen name="compare" options={{ headerShown: false }} />
        <Stack.Screen name="dentist-map" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
