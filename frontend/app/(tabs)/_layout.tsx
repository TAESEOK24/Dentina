import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B8B', // Pink tone
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#333',
        tabBarStyle: {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          paddingTop: 5,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          backgroundColor: '#FFFFFF',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '분석',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera_dummy"
        options={{
          title: '촬영',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={30} color="#FFF" />
            </View>
          ),
          tabBarLabel: () => null, // Hide label for center button
        }}
        listeners={() => ({
          tabPress: (e) => {
            // Prevent default action (navigation to dummy screen)
            e.preventDefault();
            // Open the camera modal instead
            router.push('/camera');
          },
        })}
      />
      <Tabs.Screen
        name="mission"
        options={{
          title: '미션',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '마이',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B8B', // Pink tone
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Elevate it slightly above the tab bar
    shadowColor: '#FF6B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
