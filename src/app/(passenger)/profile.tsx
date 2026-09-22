// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const profile = () => {
//   return (
//     <View>
//       <Text>profile</Text>
//     </View>
//   )
// }

// export default profile

// const styles = StyleSheet.create({})






import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BLUE = "#208AEF";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>
          Profile
        </Text>

        <Text style={styles.subtitle}>
          Manage your RouteSync account
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* User */}
        <View style={styles.userCard}>

          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={30}
              color={BLUE}
            />
          </View>

          <View>
            <Text style={styles.userName}>
              Guest User
            </Text>

            <Text style={styles.userEmail}>
              Login to access your account
            </Text>
          </View>

        </View>

        {/* Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Ionicons
            name="log-in-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.loginText}>
            Login / Register
          </Text>
        </TouchableOpacity>

        {/* Options */}
        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <ProfileOption
          icon="person-outline"
          title="Personal Information"
          subtitle="Manage your account details"
        />

        <ProfileOption
          icon="heart-outline"
          title="Saved Routes"
          subtitle="View your favorite routes"
        />

        <ProfileOption
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage transport notifications"
        />

        <ProfileOption
          icon="settings-outline"
          title="Settings"
          subtitle="App preferences"
        />

        <ProfileOption
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help with RouteSync"
        />

      </ScrollView>

    </View>
  );
}

function ProfileOption({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity style={styles.option}>

      <View style={styles.optionIcon}>
        <Ionicons
          name={icon}
          size={21}
          color={BLUE}
        />
      </View>

      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>
          {title}
        </Text>

        <Text style={styles.optionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#999"
      />

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },

  header: {
    backgroundColor: BLUE,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: "#EAF5FF",
    fontSize: 13,
    marginTop: 5,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EAF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  userEmail: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  loginButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: BLUE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
  },

  option: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EAF5FF",
    justifyContent: "center",
    alignItems: "center",
  },

  optionContent: {
    flex: 1,
    marginLeft: 12,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  optionSubtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 3,
  },
});