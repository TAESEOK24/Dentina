import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="result" options={{ title: '분석 결과', headerBackVisible: false }} />
    </Stack>
  );
}
