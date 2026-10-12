/**
 * CounterYield Design System & Tokens
 * Adheres strictly to the Elite Frontend & Trust Wallet redesign aesthetics:
 * Deep Void Canvas, Layered Translucent Surfaces, Calibrated Chartreuse Neon & Monad Violet.
 */

export const colors = {
  // Canvas & Surfaces
  canvas: '#080B11',
  bg: '#080B11',
  surface: '#131927',
  surfaceBase: '#0E131F',
  surfaceCard: '#131927',
  surfaceCardElevated: '#182133',
  surfaceInput: '#0B0F18',

  // Layered Translucent Fills
  glassFill: 'rgba(19, 25, 39, 0.75)',
  glassFillLight: 'rgba(255, 255, 255, 0.04)',
  glassDock: 'rgba(14, 19, 31, 0.88)',

  // Borders & Dividers
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  borderCard: '#1D263B',
  borderHighlight: 'rgba(204, 255, 0, 0.35)',

  // Accent & Signal Colors
  lime: '#CCFF00',
  limeGlow: 'rgba(204, 255, 0, 0.15)',
  limeMuted: 'rgba(204, 255, 0, 0.08)',
  
  monadViolet: '#836EF9',
  monadVioletSoft: 'rgba(131, 110, 249, 0.12)',

  kuruOrange: '#FF5722',
  perplCyan: '#00E5FF',
  agoraGreen: '#00D26A',

  // System States
  amber: '#FF9F0A',
  amberSoft: 'rgba(255, 159, 10, 0.12)',
  crimson: '#FF453A',
  crimsonSoft: 'rgba(255, 69, 58, 0.12)',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textMuted: '#475569',
  textDark: '#080B11',
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  hero: 36,
} as const;
