import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '900',
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 2,
        },
        tabBarStyle: {
          height: 72 + Math.max(insets.bottom, 0),
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: theme.surface,
          borderTopColor: '#EEF0F5',
          shadowColor: '#111827',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size + 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '분석',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size + 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera_dummy"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={34} color="#FFFFFF" />
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/camera');
          },
        })}
      />
      <Tabs.Screen
        name="mission"
        options={{
          title: '미션',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size + 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '마이',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size + 1} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cameraButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
