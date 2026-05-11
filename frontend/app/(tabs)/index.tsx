import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCORE = 78;
const DATE = '2024.05.25';
const RISK_COLOR = '#FF6B9D';
const SCORE_COLOR = '#3B5BFF';

type Tooth = {
  id: string;
  label: string;
  x: number;
  y: number;
  risk?: boolean;
};

const upperTeeth: Tooth[] = [
  { id: 'u1', label: '상악 좌측 4', x: 34, y: 38 },
  { id: 'u2', label: '상악 좌측 3', x: 54, y: 20 },
  { id: 'u3', label: '상악 좌측 2', x: 80, y: 8, risk: true },
  { id: 'u4', label: '상악 좌측 1', x: 108, y: 2, risk: true },
  { id: 'u5', label: '상악 우측 1', x: 138, y: 2 },
  { id: 'u6', label: '상악 우측 2', x: 166, y: 8 },
  { id: 'u7', label: '상악 우측 3', x: 192, y: 20 },
  { id: 'u8', label: '상악 우측 4', x: 212, y: 38 },
];

const lowerTeeth: Tooth[] = [
  { id: 'l1', label: '하악 좌측 4', x: 34, y: 192 },
  { id: 'l2', label: '하악 좌측 3', x: 54, y: 214 },
  { id: 'l3', label: '하악 좌측 2', x: 80, y: 228 },
  { id: 'l4', label: '하악 좌측 1', x: 108, y: 236 },
  { id: 'l5', label: '하악 우측 1', x: 138, y: 236 },
  { id: 'l6', label: '하악 우측 2', x: 166, y: 228 },
  { id: 'l7', label: '하악 우측 3', x: 192, y: 214 },
  { id: 'l8', label: '하악 우측 4', x: 212, y: 192 },
];

function ToothIcon({ tooth }: { tooth: Tooth }) {
  return (
    <View
      accessibilityLabel={tooth.label}
      style={[
        styles.tooth,
        {
          left: tooth.x,
          top: tooth.y,
          backgroundColor: tooth.risk ? RISK_COLOR : '#FFFFFF',
          borderColor: tooth.risk ? RISK_COLOR : '#E6E8F0',
        },
      ]}
    >
      {tooth.risk ? <View style={styles.riskDot} /> : null}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요, 사용자님</Text>
          <Text style={styles.subGreeting}>오늘의 구강 상태를 확인해보세요</Text>
        </View>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={16} color={SCORE_COLOR} />
          <Text style={styles.dateText}>{DATE}</Text>
        </View>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <View>
            <Text style={styles.mapTitle}>구강 상태 분석</Text>
            <Text style={styles.mapSubtitle}>위험 치아 2개 감지</Text>
          </View>
          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: RISK_COLOR }]} />
            <Text style={styles.legendText}>위험</Text>
          </View>
        </View>

        <View style={styles.oralMap}>
          <View style={[styles.arcGuide, styles.upperGuide]} />
          <View style={[styles.arcGuide, styles.lowerGuide]} />

          {[...upperTeeth, ...lowerTeeth].map((tooth) => (
            <ToothIcon key={tooth.id} tooth={tooth} />
          ))}

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreLabel}>종합 점수</Text>
            <Text style={styles.scoreText}>
              {SCORE}
              <Text style={styles.scoreMax}>/100</Text>
            </Text>
            <Text style={styles.scoreStatus}>주의 필요</Text>
          </View>
        </View>

        <View style={styles.riskPanel}>
          <View style={styles.riskIcon}>
            <Ionicons name="alert-circle" size={20} color={RISK_COLOR} />
          </View>
          <View style={styles.riskCopy}>
            <Text style={styles.riskTitle}>상악 좌측 2번째, 3번째 치아</Text>
            <Text style={styles.riskDescription}>치태 또는 잇몸 자극 가능성이 있어 관리가 필요합니다.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 112,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  greeting: {
    color: '#1A1A2E',
    fontSize: 24,
    fontWeight: '800',
  },
  subGreeting: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#F4F6FF',
  },
  dateText: {
    color: '#29324A',
    fontSize: 13,
    fontWeight: '700',
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#151936',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  mapTitle: {
    color: '#1A1A2E',
    fontSize: 20,
    fontWeight: '800',
  },
  mapSubtitle: {
    color: '#8B90A0',
    fontSize: 13,
    marginTop: 5,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FFF2F7',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: RISK_COLOR,
    fontSize: 12,
    fontWeight: '800',
  },
  oralMap: {
    width: 280,
    height: 284,
    alignSelf: 'center',
    marginTop: 6,
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
    backgroundColor: '#FFFFFF',
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
    borderColor: '#FFB7CF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  scoreLabel: {
    color: '#8B90A0',
    fontSize: 12,
    fontWeight: '700',
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
  scoreStatus: {
    color: RISK_COLOR,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  riskPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF2F7',
  },
  riskIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskCopy: {
    flex: 1,
  },
  riskTitle: {
    color: '#1A1A2E',
    fontSize: 14,
    fontWeight: '800',
  },
  riskDescription: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
});
