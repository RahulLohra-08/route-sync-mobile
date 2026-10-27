// src/features/routes/RouteStops.tsx
//
// Reusable vertical route timeline, driven ONLY by backend data (StopResponse).
//
// DATA INTEGRITY: the backend has NO stop-arrival events and NO route-progress
// field. So there is deliberately NO "completed / current / upcoming" state and
// no filled progress line or moving bus icon: proximity is not evidence of
// arrival, and inventing it would mislead passengers. What we DO show is real:
//   * start / middle / end markers and the stop the user selected
//   * "Your stop" (device-local preference)
//   * straight-line distance from the bus's latest GPS fix (labelled as such)
//   * timetable offset (planned schedule, labelled "Timetable")
//   * the backend's live ETA, passed in by the caller via `selectedDetail`
// When the backend gains stop events, `StopRow` is the single place to add them.
import AppText from "@/components/common/AppText";
import type { StopResponse } from "@/features/passenger/passenger.types";
import { colors, radius, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { formatDistance, haversineKm } from "./geo";
import { COLLAPSED_EDGE, visibleStopIndexes } from "./stopsView";

const RAIL = 28;
/** Pulse a few times to draw the eye, then rest (battery-friendly, not endless). */
const PULSE_CYCLES = 4;

interface Props {
  /** Must already be sorted by stopOrder. */
  stops: StopResponse[];
  selectedStopId?: string | null;
  onSelect?: (stop: StopResponse) => void;
  /** Rendered inside the expanded selected stop (e.g. the real backend ETA). */
  selectedDetail?: ReactNode;
  tripRunning?: boolean;
  collapsible?: boolean;
  onSelectedLayout?: (y: number) => void;
  /** Latest real GPS position of the bus; enables per-stop straight-line distance. */
  busPosition?: { latitude: number; longitude: number } | null;
  /** The passenger's saved boarding stop (device-local). */
  myStopId?: string | null;
  onToggleMyStop?: (stop: StopResponse) => void;
}

export function RouteStops({
  stops,
  selectedStopId,
  onSelect,
  selectedDetail,
  tripRunning,
  collapsible = true,
  onSelectedLayout,
  busPosition,
  myStopId,
  onToggleMyStop,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const last = stops.length - 1;
  const canCollapse = collapsible && stops.length > COLLAPSED_EDGE * 2 + 1;

  const visible = useMemo(
    () =>
      visibleStopIndexes(
        stops.map((x) => x.id),
        selectedStopId ?? myStopId,
        expanded,
        collapsible,
      ).map((index) => ({ stop: stops[index], index })),
    [stops, selectedStopId, myStopId, expanded, collapsible],
  );
  const hidden = stops.length - visible.length;

  return (
    <View>
      <Legend hasMyStop={!!onToggleMyStop} />
      <Animated.View
        layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      >
        {visible.map(({ stop, index }, i) => {
          const selected = stop.id === selectedStopId;
          const prev = visible[i - 1]?.index;
          const gapBefore = prev !== undefined && index - prev > 1;
          return (
            <View key={stop.id}>
              {gapBefore && (
                <GapRow
                  count={index - prev - 1}
                  onPress={() => setExpanded(true)}
                />
              )}
              <StopRow
                stop={stop}
                kind={index === 0 ? "start" : index === last ? "end" : "mid"}
                total={stops.length}
                order={i}
                selected={selected}
                isMine={stop.id === myStopId}
                isFirstVisible={i === 0}
                isLastVisible={i === visible.length - 1}
                onSelect={onSelect}
                onToggleMyStop={onToggleMyStop}
                detail={selected ? selectedDetail : null}
                distanceKm={busPosition ? haversineKm(busPosition, stop) : null}
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
          accessibilityLabel={
            expanded ? "Show fewer stops" : `Show all ${stops.length} stops`
          }
          style={styles.toggle}
        >
          <AppText variant="caption" style={styles.toggleText}>
            {expanded
              ? "Show fewer stops"
              : `Show ${hidden > 0 ? hidden : "all"} more stops`}
          </AppText>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.primary[700]}
          />
        </Pressable>
      )}

      {tripRunning && (
        <AppText variant="caption" style={styles.note}>
          Stop-by-stop progress isn't reported yet, so stops are not marked as
          passed. Distances are straight-line from the bus's last GPS point.
        </AppText>
      )}
    </View>
  );
}

function Legend({ hasMyStop }: { hasMyStop: boolean }) {
  return (
    <View
      style={styles.legend}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LegendItem label="Start">
        <View
          style={[
            styles.legendDot,
            {
              borderColor: colors.primary[600],
              borderWidth: 3,
              backgroundColor: "#FFF",
            },
          ]}
        />
      </LegendItem>
      <LegendItem label="Selected">
        <View
          style={[
            styles.legendDot,
            {
              borderColor: colors.primary[600],
              backgroundColor: colors.primary[600],
            },
          ]}
        />
      </LegendItem>
      <LegendItem label="End">
        <View
          style={[
            styles.legendDot,
            {
              borderColor: "#0F172A",
              backgroundColor: "#0F172A",
              borderRadius: 3,
            },
          ]}
        />
      </LegendItem>
      {hasMyStop && (
        <LegendItem label="Your stop">
          <Ionicons name="star" size={12} color="#B45309" />
        </LegendItem>
      )}
    </View>
  );
}
const LegendItem = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <View style={styles.legendItem}>
    {children}
    <AppText variant="caption" style={styles.muted}>
      {label}
    </AppText>
  </View>
);

function GapRow({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Show ${count} hidden stops`}
      style={styles.gap}
    >
      <View style={styles.rail}>
        <View style={styles.dashed} />
      </View>
      <AppText variant="caption" style={styles.muted}>
        {count} more stop{count === 1 ? "" : "s"}
      </AppText>
    </Pressable>
  );
}

/** Expanding ring behind the selected marker. Runs PULSE_CYCLES times, then stops. */
function PulseRing({
  active,
  reduceMotion,
}: {
  active: boolean;
  reduceMotion: boolean;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(t);
    t.value = 0;
    if (active && !reduceMotion)
      t.value = withRepeat(
        withTiming(1, { duration: 1200 }),
        PULSE_CYCLES,
        false,
      );
    return () => cancelAnimation(t);
  }, [active, reduceMotion, t]);
  // transform + opacity only => stays on the native/UI thread.
  const style = useAnimatedStyle(() => ({
    opacity: active ? (reduceMotion ? 0.22 : 0.45 * (1 - t.value)) : 0,
    transform: [{ scale: reduceMotion ? 1.7 : 1 + t.value * 1.4 }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.pulse, style]} />;
}

interface RowProps {
  stop: StopResponse;
  kind: "start" | "mid" | "end";
  total: number;
  order: number;
  selected: boolean;
  isMine: boolean;
  isFirstVisible: boolean;
  isLastVisible: boolean;
  onSelect?: (stop: StopResponse) => void;
  onToggleMyStop?: (stop: StopResponse) => void;
  detail: ReactNode;
  distanceKm: number | null;
  onSelectedLayout?: (y: number) => void;
  reduceMotion: boolean;
}

const StopRow = memo(function StopRow({
  stop,
  kind,
  total,
  order,
  selected,
  isMine,
  isFirstVisible,
  isLastVisible,
  onSelect,
  onToggleMyStop,
  detail,
  distanceKm,
  onSelectedLayout,
  reduceMotion,
}: RowProps) {
  const scale = useSharedValue(selected ? 1.15 : 1);
  useEffect(() => {
    scale.value = withTiming(selected ? 1.15 : 1, {
      duration: reduceMotion ? 0 : 250,
    });
  }, [selected, reduceMotion, scale]);
  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const green = colors.primary[600];
  const markerBase =
    kind === "start"
      ? [
          styles.marker,
          { borderColor: green, borderWidth: 4, backgroundColor: "#FFF" },
        ]
      : kind === "end"
        ? [
            styles.marker,
            {
              borderColor: "#0F172A",
              backgroundColor: "#0F172A",
              borderRadius: 5,
            },
          ]
        : [styles.marker, styles.markerMid];
  const markerSelected = selected && [
    {
      backgroundColor: green,
      borderColor: green,
      borderWidth: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
    },
  ];
  const offset = stop.estimatedArrivalOffsetMinutes;

  return (
    <Animated.View
      // Staggered entrance: first ~8 rows only, so long routes don't wait.
      entering={
        reduceMotion
          ? undefined
          : FadeInDown.delay(Math.min(order, 8) * 40).duration(250)
      }
      layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      onLayout={
        onSelectedLayout
          ? (e) => onSelectedLayout(e.nativeEvent.layout.y)
          : undefined
      }
    >
      <Pressable
        disabled={!onSelect}
        onPress={() => onSelect?.(stop)}
        accessibilityRole={onSelect ? "button" : "text"}
        accessibilityState={{ selected, expanded: selected }}
        accessibilityLabel={`Stop ${stop.stopOrder} of ${total}: ${stop.stopName}${kind === "start" ? ", first stop" : kind === "end" ? ", last stop" : ""}${isMine ? ", your stop" : ""}${selected ? ", selected" : ""}`}
        style={[styles.row, selected && styles.rowSelected]}
      >
        <View style={styles.rail}>
          <View
            style={[
              styles.line,
              { top: 0 },
              isFirstVisible && styles.lineHidden,
            ]}
          />
          <PulseRing active={selected} reduceMotion={reduceMotion} />
          <Animated.View style={[markerBase, markerSelected, markerStyle]}>
            {selected && <Ionicons name="bus" size={11} color="#FFF" />}
          </Animated.View>
          <View
            style={[
              styles.line,
              { bottom: 0 },
              isLastVisible && styles.lineHidden,
            ]}
          />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <AppText
              variant="bodyMedium"
              style={[styles.name, selected && { color: colors.primary[700] }]}
              numberOfLines={selected ? 3 : 2}
            >
              {stop.stopName}
            </AppText>
            {isMine && (
              <View style={styles.mine}>
                <Ionicons name="star" size={11} color="#B45309" />
                <AppText variant="caption" style={styles.mineText}>
                  Your stop
                </AppText>
              </View>
            )}
            <AppText variant="caption" style={styles.order}>
              {stop.stopOrder}
            </AppText>
          </View>
          {!!stop.address && (
            <AppText
              variant="caption"
              style={styles.muted}
              numberOfLines={selected ? undefined : 1}
            >
              {stop.address}
            </AppText>
          )}
          {distanceKm !== null && (
            <AppText variant="caption" style={styles.muted}>
              {formatDistance(distanceKm)} from bus (straight line)
            </AppText>
          )}
          {offset > 0 && (
            <AppText variant="caption" style={styles.muted}>
              Timetable: +{offset} min from start
            </AppText>
          )}

          {selected && (
            <Animated.View
              entering={reduceMotion ? undefined : FadeIn.duration(250)}
              style={styles.detail}
            >
              {detail}
              {onToggleMyStop && (
                <Pressable
                  onPress={() => onToggleMyStop(stop)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isMine ? "Remove as my stop" : "Set as my stop"
                  }
                  style={styles.mineBtn}
                >
                  <Ionicons
                    name={isMine ? "star" : "star-outline"}
                    size={16}
                    color="#B45309"
                  />
                  <AppText variant="caption" style={styles.mineBtnText}>
                    {isMine ? "Remove as my stop" : "Set as my stop"}
                  </AppText>
                </Pressable>
              )}
            </Animated.View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  row: {
    flexDirection: "row",
    minHeight: 52,
    paddingRight: spacing.sm,
    borderRadius: radius.md,
  },
  rowSelected: { backgroundColor: colors.primary[50] },
  rail: { width: RAIL, alignItems: "center", justifyContent: "center" },
  line: {
    position: "absolute",
    width: 3,
    height: "50%",
    backgroundColor: "#CBD5E1",
  },
  lineHidden: { opacity: 0 },
  dashed: {
    width: 0,
    flex: 1,
    borderLeftWidth: 3,
    borderStyle: "dotted",
    borderColor: "#CBD5E1",
  },
  pulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[600],
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  markerMid: {
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#94A3B8",
  },
  body: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    gap: 2,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  name: { flex: 1, color: "#0F172A" },
  order: { color: "#64748B", minWidth: 18, textAlign: "right" },
  mine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  mineText: { color: "#B45309", fontWeight: "700" },
  mineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    alignSelf: "flex-start",
  },
  mineBtnText: { color: "#B45309", fontWeight: "700" },
  detail: { marginTop: spacing.sm, gap: spacing.xs },
  gap: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 34,
    gap: spacing.sm,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    alignSelf: "flex-start",
  },
  toggleText: { color: colors.primary[700], fontWeight: "700" },
  muted: { color: "#64748B" },
  note: { color: "#64748B", marginTop: spacing.xs },
});
