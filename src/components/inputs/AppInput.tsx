import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import AppText from "@/components/common/AppText";
import {
  colors,
  radius,
  spacing,
} from "@/theme";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function AppInput({
  label,
  error,
  style,
  ...props
}: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      {label && (
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      )}

      <TextInput
        {...props}
        placeholderTextColor={colors.text.muted}
        style={[
          styles.input,
          error && styles.errorInput,
          style,
        ]}
      />

      {error && (
        <AppText
          variant="caption"
          style={styles.error}
        >
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },

  label: {
    marginBottom: spacing.sm,
    color: colors.text.secondary,
  },

  input: {
    height: 52,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    fontSize: 16,
  },

  errorInput: {
    borderColor: colors.status.error,
  },

  error: {
    marginTop: spacing.xs,
    color: colors.status.error,
  },
});