import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
      <View style={styles.container}>
        <Text style={styles.errorText}>결과를 불러올 수 없습니다.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>홈으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>종합 점수</Text>
        <Text style={styles.totalScore}>{result.totalScore}</Text>
        <Text style={styles.scoreUnit}>/ 100</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>청결도</Text>
          <Text style={styles.detailScore}>{result.cleanlinessScore}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>잇몸 건강</Text>
          <Text style={styles.detailScore}>{result.gumsScore}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>시린 지수</Text>
          <Text style={styles.detailScore}>{result.sensitivityScore}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>플라그 위험</Text>
          <Text style={[styles.detailScore, result.plaqueRisk && styles.warningText]}>
            {result.plaqueRisk ? '높음' : '낮음'}
          </Text>
        </View>
      </View>

      <View style={styles.recommendationContainer}>
        <Text style={styles.sectionTitle}>AI 관리 조언</Text>
        <Text style={styles.recommendationText}>{result.recommendation}</Text>
      </View>

      {result.areas && result.areas.length > 0 && (
        <View style={styles.areasContainer}>
          <Text style={styles.sectionTitle}>주의 부위</Text>
          {result.areas.map((area, index) => (
            <View key={index} style={styles.areaItem}>
              <Text style={styles.areaPosition}>{area.position}</Text>
              <Text style={styles.areaIssue}>{area.issue} (점수: {area.score})</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/camera')}>
        <Text style={styles.buttonText}>다시 촬영하기</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => router.replace('/')}>
        <Text style={styles.secondaryButtonText}>홈으로</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 50,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    padding: 30,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  scoreTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  totalScore: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  scoreUnit: {
    fontSize: 16,
    color: '#999',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#444',
  },
  detailScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  warningText: {
    color: '#ff3b30',
  },
  recommendationContainer: {
    width: '100%',
    backgroundColor: '#e6f2ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#005bb5',
  },
  areasContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  areaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  areaPosition: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  areaIssue: {
    fontSize: 14,
    color: '#ff3b30',
  },
  button: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
