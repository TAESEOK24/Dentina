import { View, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Typography color="secondary">분석 기록 화면 (준비중)</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
