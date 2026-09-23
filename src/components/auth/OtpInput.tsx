import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { animation, colors, radius, spacing } from "@/theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
};

function Cell({
  char,
  active,
  hasError,
}: {
  char: string;
  active: boolean;
  hasError: boolean;
}) {
  const scale = useSharedValue(1);
  const caret = useSharedValue(1);

  // pop when a digit lands
  useEffect(() => {
    if (char) {
      scale.value = withSequence(
        withTiming(1.08, { duration: animation.duration.fast / 2 }),
        withSpring(1, animation.spring)
      );
    }
  }, [char]);

  // blinking caret on the active empty cell
  useEffect(() => {
    if (active && !char) {
      caret.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
    } else {
      caret.value = 0;
    }
  }, [active, char]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

  const borderColor = hasError
    ? colors.status.error
    : active
    ? colors.primary[500]
    : char
    ? colors.primary[200]
    : colors.border.light;

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          borderColor,
          backgroundColor: hasError
            ? "#FEF2F2"
            : char
            ? colors.primary[50]
            : colors.background.secondary,
          borderWidth: active || hasError ? 2 : 1.5,
        },
        boxStyle,
      ]}
    >
      {char ? (
        <Text style={styles.digit}>{char}</Text>
      ) : active ? (
        <Animated.View style={[styles.caret, caretStyle]} />
      ) : null}
    </Animated.View>
  );
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  hasError = false,
  disabled = false,
  autoFocus = true,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const shake = useSharedValue(0);
  const [isFocused, setIsFocused] = useState(autoFocus);

  useEffect(() => {
    if (hasError) {
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(withTiming(10, { duration: 90 }), 5, true),
        withTiming(0, { duration: 50 })
      );
    }
  }, [hasError]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <Animated.View style={[styles.row, rowStyle]}>
        {Array.from({ length }).map((_, i) => (
          <Cell
            key={i}
            char={value[i] ?? ""}
            active={isFocused && i === activeIndex}
            hasError={hasError}
          />
        ))}
      </Animated.View>

      {/* Real input is invisible; the cells above only display its value. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
        editable={!disabled}
        caretHidden
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    aspectRatio: 0.85,
    maxHeight: 64,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  digit: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
  },
  caret: {
    width: 2,
    height: 24,
    borderRadius: 1,
    backgroundColor: colors.primary[500],
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});
