import { Alert, StyleSheet, View } from "react-native";

import Screen from "@/components/common/Screen";
import AppText from "@/components/common/AppText";
import AnimatedButton from "@/components/common/AnimatedButton";
import AnimatedCard from "@/components/common/AnimatedCard";
import Badge from "@/components/common/Badge";
import Header from "@/components/common/Header";
import AppInput from "@/components/inputs/AppInput";

import {
  colors,
  spacing,
} from "@/theme";

export default function Index() {
  return (
    <Screen scroll>
      <Header
        title="RouteSync"
        subtitle="Smart public transport"
      />

      <View style={styles.content}>
        <AppText variant="display">
          Welcome 👋
        </AppText>

        <AppText
          variant="body"
          style={styles.description}
        >
          Everything you need to travel smarter.
        </AppText>

        <AppInput
          label="Search"
          placeholder="Search bus or route"
        />

        <AnimatedCard>
          <AppText variant="h3">
            Bus RS-102
          </AppText>

          <AppText
            variant="body"
            style={styles.cardText}
          >
            Ranchi → Hatia
          </AppText>

          <Badge
            label="Live"
            variant="success"
          />
        </AnimatedCard>

        <AnimatedButton
          title="Explore Buses"
          onPress={() =>
            Alert.alert(
              "RouteSync",
              "Bus exploration coming next."
            )
          }
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: spacing.xl,
  },

  description: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    color: colors.text.secondary,
  },

  cardText: {
    marginVertical: spacing.sm,
    color: colors.text.secondary,
  },

  button: {
    marginTop: spacing.xl,
  },
});