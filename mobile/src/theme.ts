/** Design tokens (single source of truth for the light-yellow-green / charcoal / snow-white theme). */
export const colors = {
  bg: '#0A0D14',
  surface: '#121620',
  surfaceHi: '#181E2C',
  border: '#1E2638',
  lime: '#CCFF00',
  limeSoft: 'rgba(204, 255, 0, 0.12)',
  limeLine: 'rgba(204, 255, 0, 0.35)',
  snow: '#FFFFFF',
  text: '#E2E8F0',
  muted: '#94A3B8',
  dim: '#64748B',
  amber: '#FFB020',
  crimson: '#FF3B30',
} as const;

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
