// src/features/routes/RouteStops.tsx
//
// Reusable vertical route timeline. Driven ONLY by backend data:
//   StopResponse (stopOrder, stopName, address, estimatedArrivalOffsetMinutes)
//
// DATA INTEGRITY (important): the backend publishes NO stop-arrival events and
// no route-progress field. So this component NEVER marks a stop as "passed" or
// "reached" - proximity of the bus is not evidence. It only distinguishes
// start / intermediate / end / selected stops. The timetable offset is printed
// as "timetable +N min" (planned schedule), clearly separate from the live ETA
// that callers pass in through `selectedDetail`.
import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AppText from "@/components/common/AppText";
import type { StopResponse } from "@/features/passenger/passenger.types";
import { colors, radius, spacing } from "@/theme";
import { COLLAPSED_EDGE, visibleStopIndexes } from "./stopsView";

const RAIL = 28; // width of the marker column

interface Props {
  /** Must already be sorted by stopOrder. */
  stops: StopResponse[];
  selectedStopId?: string | null;
  onSelect?: (stop: StopResponse) => void;
  /** Rendered under the selected stop (e.g. the real backend ETA). */
  selectedDetail?: ReactNode;
  /** Show the "progress is not tracked" note (only useful while a trip runs). */
  tripRunning?: boolean;
  collapsible?: boolean;
  /** Reports the selected row's Y inside this list so a parent can scroll to it. */
  onSelectedLayout?: (y: number) => void;
}

export function RouteStops({
  stops,
  selectedStopId,
  onSelect,
  selectedDetail,
  tripRunning,
  collapsible = true,
  onSelectedLayout,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const last = stops.length - 1;
  const canCollapse = collapsible && stops.length > COLLAPSED_EDGE * 2 + 1;

  const visible = useMemo(
    () =>
      visibleStopIndexes(stops.map((x) => x.id), selectedStopId, expanded, collapsible).map(
        (index) => ({ stop: stops[index], index }),
      ),
    [stops, selectedStopId, expanded, collapsible],
  );
  const hidden = stops.length - visible.length;

  return (
    <View>
      <Legend />
      <Animated.View layout={reduceMotion ? undefined : LinearTransition.duration(250)}>
        {visible.map(({ stop, index }, i) => {
          const selected = stop.id === selectedStopId;
          const prev = visible[i - 1]?.index;
          const gapBefore = prev !== undefined && index - prev > 1;
          return (
            <View key={stop.id}>
              {gapBefore && (
                <GapRow count={index - prev - 1} onPress={() => setExpanded(true)} />
              )}
              <StopRow
                stop={stop}
                kind={index === 0 ? "start" : index === last ? "end" : "mid"}
                total={stops.length}
                selected={selected}
                isFirstVisible={i === 0}
                isLastVisible={i === visible.length - 1}
                onSelect={onSelect}
                detail={selected ? selectedDetail : null}
                onSelectedLayout={selected ? onSelectedLayout : undefined}
                reduceMotion={reduceMotion}
              />
            </View>
          );
        })}
      </Animated.View>

      {canCollapse && (
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Show fewer stops" : `Show all ${stops.length} stops`}
          style={styles.toggle}
        >
          <AppText variant="caption" style={styles.toggleText}>
            {expanded ? "Show fewer stops" : `Show ${hidden > 0 ? hidden : "all"} more stops`}
          </AppText>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.primary[700]} />
        </Pressable>
      )}

      {tripRunning && (
        <AppText variant="caption" style={styles.note}>
          Stop-by-stop progress isn't reported yet, so stops are not marked as passed. Use the live map and the arrival estimate.
        </AppText>
      )}
    </View>
  );
}

function Legend() {
  return (
    <View style={styles.legend} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LegendItem color={colors.primary[600]} label="Start" ring />
      <LegendItem color={colors.primary[600]} label="Selected" filled />
      <LegendItem color="#0F172A" label="End" square />
    </View>
  );
}
function LegendItem({ color, label, ring, filled, square }: { color: string; label: string; ring?: boolean; filled?: boolean; square?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { borderColor: color, backgroundColor: filled ? color : "#FFFFFF" },
          ring && { borderWidth: 3 },
          square && { borderRadius: 3, backgroundColor: color },
        ]}
      />
      <AppText variant="caption" style={styles.muted}>{label}</AppText>
    </View>
  );
}

function GapRow({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Show ${count} hidden stops`} style={styles.gap}>
      <View style={styles.rail}><View style={styles.dashed} /></View>
      <AppText variant="caption" style={styles.muted}>{count} more stop{count === 1 ? "" : "s"}</AppText>
    </Pressable>
  );
}

interface RowProps {
  stop: StopResponse;
  kind: "start" | "mid" | "end";
  total: number;
  selected: boolean;
  isFirstVisible: boolean;
  isLastVisible: boolean;
  onSelect?: (stop: StopResponse) => void;
  detail: ReactNode;
  onSelectedLayout?: (y: number) => void;
  reduceMotion: boolean;
}

const StopRow = memo(function StopRow({
  stop, kind, total, selected, isFirstVisible, isLastVisible, onSelect, detail, onSelectedLayout, reduceMotion,
}: RowProps) {
  // Marker grows slightly when selected (250 ms; instant if reduce-motion).
  const scale = useSharedValue(selected ? 1.15 : 1);
  useEffect(() => {
    scale.value = withTiming(selected ? 1.15 : 1, { duration: reduceMotion ? 0 : 250 });
  }, [selected, reduceMotion, scale]);
  const markerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const green = colors.primary[600];
  const markerBase =
    kind === "start"
      ? [styles.marker, { borderColor: green, borderWidth: 4, backgroundColor: "#FFFFFF" }]
      : kind === "end"
        ? [styles.marker, { borderColor: "#0F172A", backgroundColor: "#0F172A", borderRadius: 5 }]
        : [styles.marker, styles.markerMid];
  const markerSelected = selected && [{ backgroundColor: green, borderColor: green, borderWidth: 0, width: 20, height: 20, borderRadius: 10 }];

  const offset = stop.estimatedArrivalOffsetMinutes;

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(250)}
      onLayout={onSelectedLayout ? (e) => onSelectedLayout(e.nativeEvent.layout.y) : undefined}
    >
      <Pressable
        disabled={!onSelect}
        onPress={() => onSelect?.(stop)}
        accessibilityRole={onSelect ? "button" : "text"}
        accessibilityState={{ selected }}
        accessibilityLabel={`Stop ${stop.stopOrder} of ${total}: ${stop.stopName}${kind === "start" ? ", first stop" : kind === "end" ? ", last stop" : ""}${selected ? ", selected" : ""}`}
        style={[styles.row, selected && styles.rowSelected]}
      >
        <View style={styles.rail}>
          <View style={[styles.line, { top: 0 }, isFirstVisible && styles.lineHidden]} />
          <Animated.View style={[markerBase, markerSelected, markerStyle]}>
            {selected && <Ionicons name="bus" size={11} color="#FFFFFF" />}
          </Animated.View>
          <View style={[styles.line, { bottom: 0 }, isLastVisible && styles.lineHidden]} />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <AppText variant="bodyMedium" style={[styles.name, selected && { color: colors.primary[700] }]} numberOfLines={2}>
              {stop.stopName}
            </AppText>
            <AppText variant="caption" style={styles.order}>{stop.stopOrder}</AppText>
          </View>
          {!!stop.address && <AppText variant="caption" style={styles.muted} numberOfLines={1}>{stop.address}</AppText>}
          {offset > 0 && (
            <AppText variant="caption" style={styles.muted}>Timetable: +{offset} min from start</AppText>
          )}
          {selected && detail ? <View style={styles.detail}>{detail}</View> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  legend: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.sm },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  row: { flexDirection: "row", minHeight: 52, paddingRight: spacing.sm, borderRadius: radius.md },
  rowSelected: { backgroundColor: colors.primary[50] },
  rail: { width: RAIL, alignItems: "center", justifyContent: "center" },
  line: { position: "absolute", width: 3, height: "50%", backgroundColor: "#CBD5E1" },
  lineHidden: { opacity: 0 },
  dashed: { width: 0, flex: 1, borderLeftWidth: 3, borderStyle: "dotted", borderColor: "#CBD5E1" },
  marker: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  markerMid: { backgroundColor: "#FFFFFF", borderWidth: 3, borderColor: "#94A3B8" },
  body: { flex: 1, paddingVertical: spacing.sm, paddingLeft: spacing.sm, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  name: { flex: 1, color: "#0F172A" },
  order: { color: "#64748B", minWidth: 18, textAlign: "right" },
  detail: { marginTop: spacing.sm },
  gap: { flexDirection: "row", alignItems: "center", minHeight: 34, gap: spacing.sm },
  toggle: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44, alignSelf: "flex-start" },
  toggleText: { color: colors.primary[700], fontWeight: "700" },
  muted: { color: "#64748B" },
  note: { color: "#64748B", marginTop: spacing.xs },
});
