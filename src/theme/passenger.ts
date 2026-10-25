import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Platform, type ViewStyle } from 'react-native';

import type { TripStatus } from '@/features/passenger/passenger.enums';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// Ink + signal amber: the colours of a departure board. Amber is reserved for
// the one thing a passenger cares about most: time until the bus.
export const palette = {
  // Unified with theme/colors.ts: deep navy + emerald, amber only for
  // delay / stale / "needs attention" (per RouteSync design direction).
  ink: '#0F172A',
  inkSoft: '#1E293B',
  inkLine: 'rgba(255,255,255,0.14)',
  amber: '#F59E0B',
  amberSoft: '#FEF3C7',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  body: '#475569',
  // #64748B keeps >= 4.5:1 contrast on white (the old #8A96AB did not).
  muted: '#64748B',
  live: '#10B981',
  liveSoft: '#D1FAE5',
  warning: '#F59E0B',
  danger: '#DC2626',
};

export const raised: ViewStyle =
  (Platform.select({
    ios: {
      shadowColor: '#101B2D',
      shadowOpacity: 0.22,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    android: { elevation: 8 },
    default: {},
  }) as ViewStyle) ?? {};

export const TRIP_STATUS_META: Record<
  TripStatus,
  { label: string; color: string; bg: string; icon: IconName }
> = {
  SCHEDULED: { label: 'Scheduled', color: '#3E5C99', bg: '#E8EEF9', icon: 'calendar-outline' },
  BOARDING: { label: 'Boarding', color: '#9A5B00', bg: palette.amberSoft, icon: 'walk-outline' },
  IN_PROGRESS: { label: 'On the way', color: '#047857', bg: palette.liveSoft, icon: 'radio-outline' },
  COMPLETED: { label: 'Completed', color: '#4B5A73', bg: '#EEF1F5', icon: 'checkmark-circle-outline' },
  CANCELLED: { label: 'Cancelled', color: '#B42318', bg: '#FEE4E2', icon: 'close-circle-outline' },
};
