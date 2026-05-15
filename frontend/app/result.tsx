import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOTAL_SCORE = 78;
const RISK_AREA = '상악 좌측 어금니';
const RISK_SCORE = 25;
const MISSION = '상악 좌측 어금니 주변을 치간칫솔로 관리해 주세요.';

const SCORE_COLOR = '#5B4BDB';
const RISK_COLOR = '#FF6B9D';
const TEXT_PRIMARY = '#1A1A2E';
const TEXT_SECONDARY = '#727789';
const BORDER_COLOR = '#EEF0F6';
const SURFACE = '#FFFFFF';
const BACKGROUND = '#FAFAFF';

type MapTab = '상악' | '하악' | '전체';

type Tooth = {
  id: string;
  arch: 'upper' | 'lower';
  label: string;
  x: number;
  y: number;
  risk?: boolean;
};

const upperTeeth: Tooth[] = [
  { id: 'u1', arch: 'upper', label: '상악 좌측 어금니 2', x: 34, y: 38, risk: true },
  { id: 'u2', arch: 'upper', label: '상악 좌측 어금니 1', x: 54, y: 20, risk: true },
  { id: 'u3', arch: 'upper', label: '상악 좌측 소구치 2', x: 80, y: 8 },
  { id: 'u4', arch: 'upper', label: '상악 좌측 소구치 1', x: 108, y: 2 },
  { id: 'u5', arch: 'upper', label: '상악 우측 소구치 1', x: 138, y: 2 },
  { id: 'u6', arch: 'upper', label: '상악 우측 소구치 2', x: 166, y: 8 },
  { id: 'u7', arch: 'upper', label: '상악 우측 어금니 1', x: 192, y: 20 },
  { id: 'u8', arch: 'upper', label: '상악 우측 어금니 2', x: 212, y: 38 },
];

const lowerTeeth: Tooth[] = [
  { id: 'l1', arch: 'lower', label: '하악 좌측 어금니 2', x: 34, y: 192 },
  { id: 'l2', arch: 'lower', label: '하악 좌측 어금니 1', x: 54, y: 214 },
  { id: 'l3', arch: 'lower', label: '하악 좌측 소구치 2', x: 80, y: 228 },
  { id: 'l4', arch: 'lower', label: '하악 좌측 소구치 1', x: 108, y: 236 },
  { id: 'l5', arch: 'lower', label: '하악 우측 소구치 1', x: 138, y: 236 },
  { id: 'l6', arch: 'lower', label: '하악 우측 소구치 2', x: 166, y: 228 },
  { id: 'l7', arch: 'lower', label: '하악 우측 어금니 1', x: 192, y: 214 },
  { id: 'l8', arch: 'lower', label: '하악 우측 어금니 2', x: 212, y: 192 },
];

const bottomTabs = [
  { label: '구강 분석', icon: 'analytics-outline' },
  { label: '알림 기간', icon: 'notifications-outline' },
  { label: '구강 맵', icon: 'camera' },
  { label: '동영 관리', icon: 'play-circle-outline' },
  { label: '리포트', icon: 'document-text-outline' },
] as const;

function ToothIcon({ tooth, dimmed }: { tooth: Tooth; dimmed: boolean }) {
  return (
    <View
      accessibilityLabel={tooth.label}
      style={[
        styles.tooth,
        {
          left: tooth.x,
          top: tooth.y,
          opacity: dimmed ? 0.22 : 1,
          backgroundColor: tooth.risk ? RISK_COLOR : SURFACE,
          borderColor: tooth.risk ? RISK_COLOR : '#E6E8F0',
        },
      ]}
    >
      {tooth.risk ? <View style={styles.riskDot} /> : null}
    </View>
  );
}

function OralMap({ activeTab }: { activeTab: MapTab }) {
  const teeth = useMemo(() => [...upperTeeth, ...lowerTeeth], []);

  return (
    <View style={styles.oralMap}>
      <View
        style={[
          styles.arcGuide,
          styles.upperGuide,
          activeTab === '하악' && styles.inactiveGuide,
        ]}
      />
      <View
        style={[
          styles.arcGuide,
          styles.lowerGuide,
          activeTab === '상악' && styles.inactiveGuide,
        ]}
      />

      {teeth.map((tooth) => {
        const dimmed =
          (activeTab === '상악' && tooth.arch === 'lower') ||
          (activeTab === '하악' && tooth.arch === 'upper');

        return <ToothIcon key={tooth.id} tooth={tooth} dimmed={dimmed} />;
      })}

      <View style={styles.scoreCircle}>
        <Text style={styles.scoreLabel}>총합 점수</Text>
        <Text style={styles.scoreText}>
          {TOTAL_SCORE}
          <Text style={styles.scoreMax}>/100</Text>
        </Text>
      </View>
    </View>
  );
}

export default function ResultScreen() {
  const [activeTab, setActiveTab] = useState<MapTab>('상악');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 112 + Math.max(insets.bottom, 10) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>구강 상태 분석</Text>
            <Text style={styles.subtitle}>위험 부위를 확인하고 오늘의 관리를 시작하세요</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {(['상악', '하악', '전체'] as MapTab[]).map((tab) => {
            const selected = activeTab === tab;

            return (
              <Pressable
                key={tab}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, selected && styles.activeTabButton]}
              >
                <Text style={[styles.tabText, selected && styles.activeTabText]}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.mapSection}>
          <View style={styles.mapTopRow}>
            <View>
              <Text style={styles.sectionTitle}>구강 맵</Text>
              <Text style={styles.sectionSubtitle}>
                {RISK_AREA} 위험 점수 {RISK_SCORE}
              </Text>
            </View>
            <View style={styles.riskBadge}>
              <View style={styles.riskBadgeDot} />
              <Text style={styles.riskBadgeText}>위험</Text>
            </View>
          </View>

          <OralMap activeTab={activeTab} />
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <Ionicons name="sparkles" size={22} color={SCORE_COLOR} />
          </View>
          <View style={styles.missionCopy}>
            <Text style={styles.missionTitle}>오늘의 미션</Text>
            <Text style={styles.missionText}>{MISSION}</Text>
          </View>
          <View style={styles.pointBadge}>
            <Text style={styles.pointText}>+10P</Text>
          </View>
        </View>

        <Pressable style={styles.dentistButton} onPress={() => router.push('/dentist-map' as never)}>
          <View style={styles.dentistButtonIcon}>
            <Ionicons name="location" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.dentistButtonCopy}>
            <Text style={styles.dentistButtonTitle}>주변 치과 찾기</Text>
            <Text style={styles.dentistButtonText}>현재 위치 기준 가까운 치과를 지도에서 확인해요</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={SCORE_COLOR} />
        </Pressable>
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {bottomTabs.map((tab, index) => {
          const active = index === 0;

          return (
            <Pressable key={tab.label} style={styles.bottomItem}>
              <View
                style={[
                  styles.bottomIconWrap,
                  active && styles.bottomIconActive,
                  index === 2 && styles.bottomCenterIcon,
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={index === 2 ? 25 : 22}
                  color={active || index === 2 ? '#FFFFFF' : '#A0A5B5'}
                />
              </View>
              <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 18,
    backgroundColor: '#F1F2FA',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: SURFACE,
    shadowColor: '#171A33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    color: '#8B90A0',
    fontSize: 14,
    fontWeight: '800',
  },
  activeTabText: {
    color: SCORE_COLOR,
  },
  mapSection: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#151936',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  mapTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FFF2F7',
  },
  riskBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RISK_COLOR,
  },
  riskBadgeText: {
    color: RISK_COLOR,
    fontSize: 12,
    fontWeight: '900',
  },
  oralMap: {
    width: 280,
    height: 284,
    alignSelf: 'center',
    marginTop: 4,
  },
  arcGuide: {
    position: 'absolute',
    left: 31,
    width: 218,
    height: 110,
    borderWidth: 10,
    borderColor: '#F3F5FA',
  },
  upperGuide: {
    top: 10,
    borderBottomWidth: 0,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },
  lowerGuide: {
    bottom: 8,
    borderTopWidth: 0,
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
  },
  inactiveGuide: {
    opacity: 0.22,
  },
  tooth: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    shadowColor: '#1F2440',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SURFACE,
    opacity: 0.95,
  },
  scoreCircle: {
    position: 'absolute',
    left: 70,
    top: 82,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#E5DFFF',
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SCORE_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 4,
  },
  scoreLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  scoreText: {
    color: SCORE_COLOR,
    fontSize: 42,
    fontWeight: '900',
  },
  scoreMax: {
    color: '#7B8194',
    fontSize: 16,
    fontWeight: '800',
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#151936',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  dentistButton: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE7FF',
    backgroundColor: '#EEF3FF',
  },
  dentistButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SCORE_COLOR,
  },
  dentistButtonCopy: {
    flex: 1,
    minWidth: 0,
  },
  dentistButtonTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '900',
  },
  dentistButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
    fontWeight: '700',
  },
  missionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionCopy: {
    flex: 1,
    minWidth: 0,
  },
  missionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  missionText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 19,
  },
  pointBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 13,
    backgroundColor: '#FFF2F7',
  },
  pointText: {
    color: RISK_COLOR,
    fontSize: 12,
    fontWeight: '900',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bottomIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  bottomIconActive: {
    backgroundColor: SCORE_COLOR,
  },
  bottomCenterIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SCORE_COLOR,
    marginTop: -10,
    shadowColor: SCORE_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomLabel: {
    color: '#A0A5B5',
    fontSize: 10,
    fontWeight: '800',
    maxWidth: 64,
  },
  bottomLabelActive: {
    color: SCORE_COLOR,
  },
});
