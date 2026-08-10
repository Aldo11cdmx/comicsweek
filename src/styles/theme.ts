export const theme = {
  light: {
    background: '#FAF9F7',
    secondaryBackground: '#F0EDEA',
    text: '#2D2D2D',
    secondaryText: '#8E8E93',
    border: 'rgba(0,0,0,0.06)',
    shadow: 'rgba(0,0,0,0.04)',
    accentPrimary: '#FF9F87',
    accentSecondary: '#A8D8EA',
    accentTertiary: '#C3E8B7',
  },
  dark: {
    background: '#1C1C1E',
    secondaryBackground: '#2C2C2E',
    text: '#F5F5F7',
    secondaryText: '#98989D',
    border: 'rgba(255,255,255,0.08)',
    shadow: 'rgba(0,0,0,0.3)',
    accentPrimary: '#FF9F87',
    accentSecondary: '#A8D8EA',
    accentTertiary: '#C3E8B7',
  },
}

export type ThemeMode = 'light' | 'dark'
