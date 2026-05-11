import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackedBarChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

const PREVIOUS_DATE = '2024.04.20';
const CURRENT_DATE = '2024.06.25';
const PREVIOUS_SCORE = 66;
const CURRENT_SCORE = 78;

const comparisonItems = [
  { label: '치태', previous: 65, improvement: 20 },
  { label: '잇몸', previous: 60, improvement: 10 },
  { label: '착색', previous: 55, improvement: 15 },
  { label: '구강 청결도', previous: 70, improvement: 20 },
] as const;

export default function CompareScreen() {
  const [activeDate, setActiveDate] = useState<'current' | 'previous'>('current');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 40, 430);
  const improvement = CURRENT_SCORE - PREVIOUS_SCORE;
  const theme = Colors.light;

  const chartData = useMemo(
    () => ({
      labels: comparisonItems.map((item) => item.label),
      legend: ['이전 점수', '개선'],
      data: comparisonItems.map((item) => [item.previous, item.improvement]),
      barColors: ['#DDE4F7', theme.primary],
    }),
    [theme.primary],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 28 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>비교 분석</Text>
        <View style={styles.dateToggle} accessibilityRole="tablist">
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: activeDate === 'current' }}
            activeOpacity={0.82}
            onPress={() => setActiveDate('current')}
            style={[styles.dateButton, activeDate === 'current' && styles.activeDateButton]}
          >
            <Text style={[styles.dateText, activeDate === 'current' && styles.activeDateText]}>{CURRENT_DATE}</Text>
          </TouchableOpacity>
          <Text style={styles.vsText}>VS</Text>
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: activeDate === 'previous' }}
            activeOpacity={0.82}
            onPress={() => setActiveDate('previous')}
            style={[styles.dateButton, activeDate === 'previous' && styles.activeDateButton]}
          >
            <Text style={[styles.dateText, activeDate === 'previous' && styles.activeDateText]}>{PREVIOUS_DATE}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>이전 점수</Text>
          <Text style={styles.previousScore}>{PREVIOUS_SCORE}</Text>
        </View>

        <View style={styles.improvementBadge}>
          <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
          <Text style={styles.improvementText}>+{improvement}</Text>
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>현재 점수</Text>
          <Text style={styles.currentScore}>{CURRENT_SCORE}</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>부위별 점수 비교</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#DDE4F7' }]} />
              <Text style={styles.legendText}>이전</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
              <Text style={styles.legendText}>개선</Text>
            </View>
          </View>
        </View>

        <StackedBarChart
          data={chartData}
          width={chartWidth - 32}
          height={230}
          hideLegend
          segments={4}
          decimalPlaces={0}
          barPercentage={0.62}
          withHorizontalLabels
          withVerticalLabels
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            color: (opacity = 1) => `rgba(59, 91, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(26, 26, 46, ${opacity})`,
            propsForBackgroundLines: {
              stroke: '#EEF2F8',
              strokeDasharray: '4 6',
            },
            propsForLabels: {
              fontSize: 11,
              fontWeight: '700',
            },
            stackedBar: true,
          }}
          style={styles.chart}
        />

        <View style={styles.detailList}>
          {comparisonItems.map((item) => (
            <View key={item.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <View style={styles.detailScores}>
                <Text style={styles.detailPrevious}>{item.previous}</Text>
                <Ionicons name="arrow-forward" size={14} color="#9AA3B5" />
                <Text style={styles.detailImprovement}>+{item.improvement}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="sparkles" size={22} color={theme.primary} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>전반적으로 개선되었어요!</Text>
          <Text style={styles.summaryText}>꾸준한 관리로 더 건강한 구강을 유지해요.</Text>
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
  header: {
    gap: 14,
    marginBottom: 16,
  },
  title: {
    color: '#1A1A2E',
    fontSize: 24,
    fontWeight: '900',
  },
  dateToggle: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 5,
    borderRadius: 18,
    backgroundColor: '#EDEFF8',
  },
  dateButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  activeDateButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#151936',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  dateText: {
    color: '#7B8194',
    fontSize: 13,
    fontWeight: '800',
  },
  activeDateText: {
    color: Colors.light.primary,
  },
  vsText: {
    color: '#9AA3B5',
    fontSize: 12,
    fontWeight: '900',
  },
  scoreCard: {
    minHeight: 132,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#151936',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 16,
  },
  scoreBlock: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#747C8F',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },
  previousScore: {
    color: '#8B94A8',
    fontSize: 42,
    fontWeight: '900',
  },
  currentScore: {
    color: Colors.light.primary,
    fontSize: 42,
    fontWeight: '900',
  },
  improvementBadge: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  improvementText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 1,
  },
  chartCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#151936',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '900',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    color: '#747C8F',
    fontSize: 12,
    fontWeight: '800',
  },
  chart: {
    alignSelf: 'center',
    marginTop: 4,
    borderRadius: 16,
  },
  detailList: {
    gap: 10,
    marginTop: 8,
  },
  detailRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F7F9FC',
  },
  detailLabel: {
    flex: 1,
    color: '#263044',
    fontSize: 14,
    fontWeight: '800',
  },
  detailScores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detailPrevious: {
    color: '#7C8498',
    fontSize: 14,
    fontWeight: '900',
  },
  detailImprovement: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '900',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#EEF3FF',
    borderWidth: 1,
    borderColor: '#DDE7FF',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  summaryText: {
    color: '#596377',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});
