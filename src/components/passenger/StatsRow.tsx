import { StyleSheet, Text, View } from 'react-native';

import { LiveDot } from '@/components/common/LiveDot';
import { palette } from '@/theme/passenger';

export interface Stat {
  key: string;
  label: string;
  value: number | null;
  live?: boolean;
}

/** Overlaps the hero's bottom edge. `null` value renders a dash while loading. */
export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <View style={styles.card}>
      {stats.map((s, i) => (
        <View key={s.key} style={[styles.cell, i > 0 && styles.divider]}>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{s.value ?? '-'}</Text>
            {s.live && (s.value ?? 0) > 0 ? <LiveDot size={6} /> : null}
          </View>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -30,
    backgroundColor: palette.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 16,
  },
  cell: { flex: 1, alignItems: 'center' },
  divider: { borderLeftWidth: 1, borderLeftColor: palette.border },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  value: { fontSize: 26, fontWeight: '800', color: palette.text, letterSpacing: -0.6 },
  label: { fontSize: 12, color: palette.muted, fontWeight: '600', marginTop: 2 },
});
