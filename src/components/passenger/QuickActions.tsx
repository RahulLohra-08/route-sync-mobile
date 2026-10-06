import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/common/PressableScale';
import { palette, type IconName } from '@/theme/passenger';

export interface QuickAction {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <PressableScale key={a.key} onPress={a.onPress} scaleTo={0.92} style={styles.item}>
          <View style={styles.icon}>
            <Ionicons name={a.icon} size={22} color={palette.ink} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {a.label}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  item: { flex: 1, alignItems: 'center', gap: 8 },
  icon: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontWeight: '700', color: palette.body },
});
