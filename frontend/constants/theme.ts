/**
 * Design System Theme Colors & Fonts
 */

import { Platform } from 'react-native';

const primaryColor = '#3B5BFF';
const accentColor = '#FF6B9D';
const backgroundColor = '#F5F7FF';
const textPrimaryColor = '#1A1A2E';
const borderRadiusValue = 16;

const lightTheme = {
  primary: primaryColor,
  accent: accentColor,
  background: backgroundColor,
  surface: '#FFFFFF',
  text: textPrimaryColor,
  textSecondary: '#6B7280',
  border: '#E2E8F0',
  tint: primaryColor,
  icon: '#687076',
  tabIconDefault: '#9CA3AF',
  tabIconSelected: primaryColor,
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
};

export const Colors = {
  light: lightTheme,
  dark: lightTheme, // 다크모드 제거
};

export const Metrics = {
  borderRadius: borderRadiusValue,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'System',
    rounded: 'System',
    mono: 'System',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    serif: 'System',
    rounded: 'System',
    mono: 'System',
  },
});
