import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'error' | 'success';
  weight?: 'normal' | 'medium' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Typography({
  style,
  variant = 'body',
  color = 'primary',
  weight,
  align = 'left',
  ...props
}: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  let fontColor = theme.text;
  if (color === 'secondary') fontColor = theme.textSecondary;
  if (color === 'accent') fontColor = theme.accent;
  if (color === 'white') fontColor = '#FFFFFF';
  if (color === 'error') fontColor = theme.error;
  if (color === 'success') fontColor = theme.success;

  let fontWeight: 'normal' | 'bold' | '500' | '600' | '700' = 'normal';
  if (weight === 'medium') fontWeight = '600';
  if (weight === 'bold') fontWeight = 'bold';

  if (!weight) {
    if (variant === 'h1' || variant === 'h2' || variant === 'h3') fontWeight = 'bold';
    if (variant === 'button') fontWeight = '600';
  }

  return (
    <Text
      style={[
        styles[variant],
        { color: fontColor, fontWeight, textAlign: align },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
  },
});
