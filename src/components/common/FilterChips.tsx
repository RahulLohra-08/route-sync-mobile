import { ScrollView, StyleSheet, Text, View } from "react-native";

import { palette } from "@/theme/passenger";
import { PressableScale } from "./PressableScale";

export interface ChipOption<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={{ flexGrow: 0 }}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <PressableScale
            key={o.key}
            onPress={() => onChange(o.key)}
            scaleTo={0.94}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {o.label}
            </Text>
            {o.count != null && (
              <View style={[styles.count, active && styles.countActive]}>
                <Text
                  style={[styles.countText, active && styles.countTextActive]}
                >
                  {o.count}
                </Text>
              </View>
            )}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipActive: { backgroundColor: palette.ink, borderColor: palette.ink },
  label: { fontSize: 14, fontWeight: "600", color: palette.body },
  labelActive: { color: "#fff" },
  count: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.bg,
  },
  countActive: { backgroundColor: palette.amber },
  countText: { fontSize: 12, fontWeight: "800", color: palette.body },
  countTextActive: { color: palette.ink },
});
