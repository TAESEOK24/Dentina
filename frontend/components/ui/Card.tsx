import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, Metrics } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, style, noPadding = false, ...props }: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface },
        !noPadding && styles.padding,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Metrics.borderRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: Metrics.spacing.lg,
    overflow: 'hidden', // to ensure inner content respects border radius
  },
  padding: {
    padding: Metrics.spacing.lg, // 24px padding default
  },
});
