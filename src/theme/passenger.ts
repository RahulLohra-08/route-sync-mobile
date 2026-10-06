import type { ComponentProps } from 'react';
import { Platform, type ViewStyle } from 'react-native';
import type { Ionicons } from '@expo/vector-icons';

import type { TripStatus } from '@/features/passenger/passenger.enums';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// Ink + signal amber: the colours of a departure board. Amber is reserved for
// the one thing a passenger cares about most: time until the bus.
export const palette = {
  ink: '#101B2D',
  inkSoft: '#1B2A44',
  inkLine: 'rgba(255,255,255,0.14)',
  amber: '#FFB400',
  amberSoft: '#FFF3D1',
  bg: '#F2F4F7',
  card: '#FFFFFF',
  border: '#E3E7EE',
  text: '#101B2D',
  body: '#4B5A73',
  muted: '#8A96AB',
  live: '#12B76A',
  liveSoft: '#D9F5E6',
  warning: '#F79009',
  danger: '#F04438',
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
  IN_PROGRESS: { label: 'On the way', color: '#0B7A45', bg: palette.liveSoft, icon: 'radio-outline' },
  COMPLETED: { label: 'Completed', color: '#4B5A73', bg: '#EEF1F5', icon: 'checkmark-circle-outline' },
  CANCELLED: { label: 'Cancelled', color: '#B42318', bg: '#FEE4E2', icon: 'close-circle-outline' },
};
