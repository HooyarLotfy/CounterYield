/**
 * CounterYield Design System & Tokens
 * Based on Uniswap Spore Dark (2025/2026 UI System)
 * Strictly adheres to:
 * - Deep Matte Charcoal Canvas (#131313, #1F1F1F, #282828)
 * - Calibrated Yellowish Non-Neon Lime (#9FE825, #7BC91E, rgba(159, 232, 37, 0.08))
 * - High-End Opacity Neutrals (95%, 65%, 38%)
 */

export const colors = {
  // Canvas & Surfaces (Uniswap Spore 5-Tier Elevation)
  canvas: '#131313',
  bg: '#131313',
  surface: '#1F1F1F',
  surfaceBase: '#131313',
  surfaceCard: '#1F1F1F',
  surfaceCardElevated: '#282828',
  surfaceInput: '#181818',

  // Layered Translucent Fills
  glassFill: 'rgba(31, 31, 31, 0.85)',
  glassFillLight: 'rgba(255, 255, 255, 0.04)',
  glassDock: 'rgba(25, 25, 25, 0.94)',

  // Borders & Dividers
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  borderCard: 'rgba(255, 255, 255, 0.08)',
  borderHighlight: 'rgba(159, 232, 37, 0.35)',

  // Accent & Signal Colors (Yellowish Non-Neon Lime & Monad Violet)
  lime: '#9FE825',
  limeActive: '#7BC91E',
  limeGlow: 'rgba(159, 232, 37, 0.18)',
  limeMuted: 'rgba(159, 232, 37, 0.08)',
  limeSoft: 'rgba(159, 232, 37, 0.08)',
  
  monadViolet: '#836EF9',
  monadVioletSoft: 'rgba(131, 110, 249, 0.12)',

  kuruOrange: '#FF5722',
  perplCyan: '#22D3EE',
  agoraGreen: '#9FE825',

  // System States
  amber: '#F59E0B',
  amberSoft: 'rgba(245, 158, 11, 0.12)',
  crimson: '#FF5F52',
  crimsonSoft: 'rgba(255, 95, 82, 0.12)',

  // Typography (Uniswap Neutral Opacities)
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary: 'rgba(255, 255, 255, 0.38)',
  textMuted: 'rgba(255, 255, 255, 0.25)',
  textDark: '#131313',
} as const;

export const spore = {
  surface1: colors.canvas,
  surface2: colors.surface,
  surface3: colors.surfaceCardElevated,
  accent1: colors.lime,
  accent1Hovered: colors.limeActive,
  accent2: colors.limeSoft,
  neutral1: colors.textPrimary,
  neutral2: colors.textSecondary,
  neutral3: colors.textTertiary,
  statusCritical: colors.crimson,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
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
