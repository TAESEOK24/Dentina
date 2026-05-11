/**
 * Design System Theme Colors & Fonts
 */

import { Platform } from 'react-native';

const primaryColor = '#3B5BFF';
const accentColor = '#FF6B9D';
const backgroundColor = '#F5F7FF';
const textPrimaryColor = '#1A1A2E';
const borderRadiusValue = 16;

export const Colors = {
  light: {
    primary: primaryColor,
    accent: accentColor,
    background: backgroundColor,
    surface: '#FFFFFF',
    text: textPrimaryColor,
    textSecondary: '#666666',
    border: '#E2E8F0',
    tint: primaryColor,
    icon: '#687076',
    tabIconDefault: '#999999',
    tabIconSelected: primaryColor,
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
  dark: {
    primary: primaryColor,
    accent: accentColor,
    background: '#121212',
    surface: '#1E1E1E',
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    border: '#333333',
    tint: primaryColor,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryColor,
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
  },
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
