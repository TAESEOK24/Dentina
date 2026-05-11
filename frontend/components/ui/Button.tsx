import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Colors, Metrics } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  let backgroundColor = theme.primary;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'accent') {
    backgroundColor = theme.accent;
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = theme.primary;
    borderColor = theme.primary;
    borderWidth = 1;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = theme.primary;
  }

  if (disabled) {
    backgroundColor = variant === 'outline' || variant === 'ghost' ? 'transparent' : '#E0E0E0';
    textColor = variant === 'outline' || variant === 'ghost' ? '#A0A0A0' : '#FFFFFF';
    borderColor = variant === 'outline' ? '#E0E0E0' : 'transparent';
  }

  const paddingVertical = size === 'small' ? 8 : size === 'large' ? 16 : 12;
  const fontSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          paddingVertical,
        },
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Metrics.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
});
