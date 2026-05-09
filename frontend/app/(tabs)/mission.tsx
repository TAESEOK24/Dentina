import { View, Text, StyleSheet } from 'react-native';

export default function MissionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>오늘의 미션 화면 (준비중)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
});
