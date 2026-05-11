import React from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

interface Area {
  position: string;
  score: number;
  issue: string;
}

interface AnalyzeResult {
  totalScore: number;
  cleanlinessScore: number;
  gumsScore: number;
  sensitivityScore: number;
  plaqueRisk: boolean;
  recommendation: string;
  areas: Area[];
}

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  let result: AnalyzeResult | null = null;
  try {
    if (params.resultData) {
      result = JSON.parse(params.resultData as string);
    }
  } catch (e) {
    console.error('Failed to parse resultData', e);
  }

  if (!result) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Typography color="error" style={styles.errorText}>결과를 불러올 수 없습니다.</Typography>
        <Button title="홈으로" onPress={() => router.replace('/')} style={{ marginHorizontal: 20 }} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Card style={styles.scoreContainer}>
        <Typography variant="h3" color="secondary" style={styles.scoreTitle}>종합 점수</Typography>
        <Typography style={[styles.totalScore, { color: theme.primary }]}>{result.totalScore}</Typography>
        <Typography color="secondary" variant="h3">/ 100</Typography>
      </Card>

      <Card style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Typography>청결도</Typography>
          <Typography weight="bold">{result.cleanlinessScore}</Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography>잇몸 건강</Typography>
          <Typography weight="bold">{result.gumsScore}</Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography>시린 지수</Typography>
          <Typography weight="bold">{result.sensitivityScore}</Typography>
        </View>
        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
          <Typography>플라그 위험</Typography>
          <Typography weight="bold" color={result.plaqueRisk ? 'error' : 'primary'}>
            {result.plaqueRisk ? '높음' : '낮음'}
          </Typography>
        </View>
      </Card>

      <Card style={[styles.recommendationContainer, { backgroundColor: '#EBF0FF' }]}>
        <Typography variant="h3" style={styles.sectionTitle}>AI 관리 조언</Typography>
        <Typography style={[styles.recommendationText, { color: theme.primary }]}>{result.recommendation}</Typography>
      </Card>

      {result.areas && result.areas.length > 0 && (
        <Card style={styles.areasContainer}>
          <Typography variant="h3" style={styles.sectionTitle}>주의 부위</Typography>
          {result.areas.map((area, index) => (
            <View key={index} style={[styles.areaItem, index === result.areas.length - 1 && { borderBottomWidth: 0 }]}>
              <Typography weight="bold">{area.position}</Typography>
              <Typography color="error" variant="caption">{area.issue} (점수: {area.score})</Typography>
            </View>
          ))}
        </Card>
      )}

      <Button title="다시 촬영하기" onPress={() => router.replace('/camera')} style={styles.actionButton} />
      <Button title="홈으로" variant="outline" onPress={() => router.replace('/')} style={styles.actionButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 50,
  },
  scoreContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 30,
  },
  scoreTitle: {
    marginBottom: 10,
  },
  totalScore: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recommendationContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  recommendationText: {
    lineHeight: 24,
  },
  areasContainer: {
    width: '100%',
    marginBottom: 30,
  },
  areaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    marginBottom: 12,
  },
});
