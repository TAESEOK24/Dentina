import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

const stats = [
  { label: '총 검사', value: '12회' },
  { label: '평균 점수', value: '74점' },
  { label: '최고 점수', value: '82점' },
] as const;

const goals = [
  { title: '하루 양치', value: '3회', icon: 'water-outline' },
  { title: '치실 사용', value: '주 4회', icon: 'checkmark-circle-outline' },
  { title: '정기 검사', value: '30일마다', icon: 'calendar-outline' },
] as const;

const menuItems = [
  { title: '개인정보 관리', icon: 'person-circle-outline' },
  { title: '검사 기록 내보내기', icon: 'document-text-outline' },
  { title: '고객센터', icon: 'chatbubble-ellipses-outline' },
] as const;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [careReminder, setCareReminder] = useState(true);
  const [missionReminder, setMissionReminder] = useState(false);
  const theme = Colors.light;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 28 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={34} color="#FFFFFF" />
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>사용자님</Text>
          <Text style={styles.meta}>최근 검사 2024.06.25</Text>
        </View>
        <View style={styles.pointBadge}>
          <Text style={styles.pointText}>320P</Text>
        </View>
      </View>

      <View style={styles.statGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>관리 목표</Text>
          <TouchableOpacity activeOpacity={0.78} style={styles.editButton}>
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.goalList}>
          {goals.map((goal) => (
            <View key={goal.title} style={styles.goalRow}>
              <View style={styles.goalIcon}>
                <Ionicons name={goal.icon} size={20} color={theme.primary} />
              </View>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalValue}>{goal.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림 설정</Text>
        <View style={styles.settingList}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>구강 관리 알림</Text>
              <Text style={styles.settingText}>양치와 검사 루틴을 알려줘요</Text>
            </View>
            <Switch
              value={careReminder}
              onValueChange={setCareReminder}
              trackColor={{ false: '#D7DBE7', true: '#BFCBFF' }}
              thumbColor={careReminder ? theme.primary : '#FFFFFF'}
            />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>미션 알림</Text>
              <Text style={styles.settingText}>오늘의 미션 시작 시간을 알려줘요</Text>
            </View>
            <Switch
              value={missionReminder}
              onValueChange={setMissionReminder}
              trackColor={{ false: '#D7DBE7', true: '#BFCBFF' }}
              thumbColor={missionReminder ? theme.primary : '#FFFFFF'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.title} activeOpacity={0.78} style={styles.menuRow}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color="#687086" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#A0A5B5" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  profileCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#151936',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 14,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: '#1A1A2E',
    fontSize: 21,
    fontWeight: '900',
  },
  meta: {
    color: '#747C8F',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    marginTop: 4,
  },
  pointBadge: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: '#FFF2F7',
  },
  pointText: {
    color: '#FF6B9D',
    fontSize: 13,
    fontWeight: '900',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minHeight: 82,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },
  statValue: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: '#747C8F',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  section: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#1A1A2E',
    fontSize: 17,
    fontWeight: '900',
  },
  editButton: {
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#EEF3FF',
  },
  editButtonText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  goalList: {
    gap: 10,
  },
  goalRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF3FF',
  },
  goalTitle: {
    flex: 1,
    color: '#263044',
    fontSize: 14,
    fontWeight: '800',
  },
  goalValue: {
    color: '#1A1A2E',
    fontSize: 14,
    fontWeight: '900',
  },
  settingList: {
    gap: 14,
    marginTop: 12,
  },
  settingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  settingTitle: {
    color: '#263044',
    fontSize: 14,
    fontWeight: '900',
  },
  settingText: {
    color: '#747C8F',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 3,
  },
  menuList: {
    marginTop: 12,
  },
  menuRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F5FA',
  },
  menuTitle: {
    flex: 1,
    color: '#263044',
    fontSize: 14,
    fontWeight: '800',
  },
});
