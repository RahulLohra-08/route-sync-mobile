import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { TripStatus } from '@/features/passenger/passenger.enums';
import { TRIP_STATUS_META } from '@/theme/passenger';
import { LiveDot } from './LiveDot';

export function StatusBadge({ status, style }: { status: TripStatus; style?: StyleProp<ViewStyle> }) {
  const meta = TRIP_STATUS_META[status] ?? TRIP_STATUS_META.SCHEDULED;
  const live = status === 'IN_PROGRESS';

  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }, live && styles.liveShift, style]}>
      {live ? <LiveDot color={meta.color} size={6} /> : <Ionicons name={meta.icon} size={13} color={meta.color} />}
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveShift: { paddingLeft: 4 },
  text: { fontSize: 12, fontWeight: '700', letterSpacing: 0.1 },
});
