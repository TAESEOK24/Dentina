import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      {/* User Greeting */}
      <View style={styles.header}>
        <View>
          <Typography variant="h2">안녕하세요, 사용자님!</Typography>
          <Typography color="secondary">오늘도 건강한 미소를 만들어봐요.</Typography>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: '#D1C4E9' }]}>
          <Ionicons name="person" size={24} color="#fff" />
        </View>
      </View>

      {/* Main Score Card */}
      <Card>
        <Typography variant="h3" style={styles.cardTitle}>구강 상태 분석</Typography>
        <Typography variant="caption" color="secondary" style={styles.cardDate}>최근 검사: 오늘 오전 10:30</Typography>
        
        <View style={styles.scoreCircleContainer}>
          <View style={[styles.scoreCircle, { borderColor: theme.accent, backgroundColor: '#FFF2F7' }]}>
            <Text style={[styles.scoreValue, { color: theme.primary }]}>78<Text style={styles.scoreMax}>/100</Text></Text>
            <Typography variant="caption" color="accent" weight="bold" style={{ marginTop: 5 }}>지난주 대비 ▲ 12</Typography>
          </View>
        </View>
      </Card>

      {/* Quick Missions */}
      <View style={styles.missionSection}>
        <Typography variant="h3" style={styles.sectionTitle}>오늘의 관리 미션 (1/3)</Typography>
        <Card style={styles.missionCardRow} noPadding>
          <View style={styles.missionIcon}>
            <Ionicons name="water-outline" size={24} color={theme.accent} />
          </View>
          <View style={styles.missionTextContainer}>
            <Typography weight="bold">치간칫솔로 꼼꼼히 관리하기</Typography>
            <Typography variant="caption" color="accent">+10 포인트</Typography>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardDate: {
    marginBottom: 20,
  },
  scoreCircleContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 20,
    color: '#6B7280',
  },
  missionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  missionCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 0,
  },
  missionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  missionTextContainer: {
    flex: 1,
  },
});
