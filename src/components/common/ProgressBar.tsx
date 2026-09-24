import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { palette } from '@/theme/passenger';

interface Props {
  /** 0..1 */
  value: number;
  color?: string;
  trackColor?: string;
  height?: number;
  /** Optional element that rides at the end of the fill (e.g. a bus icon). Should be ~28px. */
  thumb?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Track that animates to its value whenever it changes. */
export function ProgressBar({
  value,
  color = palette.ink,
  trackColor = palette.border,
  height = 6,
  thumb,
  style,
}: Props) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(Math.min(1, Math.max(0, value)), { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [value, p]);

  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  const thumbStyle = useAnimatedStyle(() => ({ left: `${p.value * 100}%` }));

  return (
    <View style={[{ height, justifyContent: 'center' }, style]}>
      <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}>
        <Animated.View style={[{ height, backgroundColor: color, borderRadius: height / 2 }, fill]} />
      </View>
      {thumb ? (
        <Animated.View style={[styles.thumb, { top: -(28 - height) / 2 }, thumbStyle]}>{thumb}</Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden' },
  thumb: { position: 'absolute', width: 28, height: 28, marginLeft: -14 },
});
