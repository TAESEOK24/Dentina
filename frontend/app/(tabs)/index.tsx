import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* User Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요, 사용자님!</Text>
          <Text style={styles.subGreeting}>오늘도 건강한 미소를 만들어봐요.</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={24} color="#fff" />
        </View>
      </View>

      {/* Main Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.cardTitle}>구강 상태 분석</Text>
        <Text style={styles.cardDate}>최근 검사: 오늘 오전 10:30</Text>
        
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>78<Text style={styles.scoreMax}>/100</Text></Text>
          <Text style={styles.scoreChange}>지난주 대비 ▲ 12</Text>
        </View>
      </View>

      {/* Quick Missions */}
      <View style={styles.missionSection}>
        <Text style={styles.sectionTitle}>오늘의 관리 미션 (1/3)</Text>
        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <Ionicons name="water-outline" size={24} color="#FF6B8B" />
          </View>
          <View style={styles.missionTextContainer}>
            <Text style={styles.missionTitle}>치간칫솔로 꼼꼼히 관리하기</Text>
            <Text style={styles.missionReward}>+10 포인트</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // For bottom tabs
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1C4E9', // Soft purple
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: '#FFECF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B8B', // Pink
  },
  scoreMax: {
    fontSize: 20,
    color: '#999',
  },
  scoreChange: {
    fontSize: 14,
    color: '#FF6B8B',
    fontWeight: '600',
    marginTop: 5,
  },
  missionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  missionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  missionTextContainer: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  missionReward: {
    fontSize: 13,
    color: '#FF6B8B',
    fontWeight: '500',
  },
});
