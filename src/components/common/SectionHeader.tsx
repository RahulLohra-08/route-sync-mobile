import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette } from '@/theme/passenger';
import { PressableScale } from './PressableScale';

interface Props {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} scaleTo={0.94} style={styles.action} hitSlop={8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={palette.body} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: palette.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: palette.muted, marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  actionText: { fontSize: 13, fontWeight: '600', color: palette.body },
});
