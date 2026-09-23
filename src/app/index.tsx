import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}

// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// const BLUE = "#208AEF";

// const buses = [
//   {
//     id: "Route 12A",
//     route: "Ranchi → Bagodar",
//     time: "Arriving in 6 min",
//     status: "On Time",
//     statusColor: "#20B26B",
//   },
//   {
//     id: "Route 78",
//     route: "Ranchi → Jamshedpur",
//     time: "Arriving in 18 min",
//     status: "Delayed 7 min",
//     statusColor: "#FF4D4D",
//   },
//   {
//     id: "Route 9",
//     route: "Bagodar → Ranchi",
//     time: "Arriving in 25 min",
//     status: "On Time",
//     statusColor: "#20B26B",
//   },
// ];

// export default function HomeScreen() {
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor={BLUE}
//       />

//       {/* ================= HEADER ================= */}

//       <View style={styles.header}>
//         <View style={styles.headerTop}>

//           <View style={styles.logoContainer}>
//             <View style={styles.logoCircle}>
//               <Ionicons
//                 name="bus"
//                 size={22}
//                 color={BLUE}
//               />
//             </View>

//             <Text style={styles.logoText}>
//               RouteSync
//             </Text>
//           </View>

//           <TouchableOpacity
//             style={styles.profileButton}
//             onPress={() => console.log("Profile")}
//           >
//             <Ionicons
//               name="person"
//               size={18}
//               color={BLUE}
//             />
//           </TouchableOpacity>

//         </View>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >

//         {/* ================= GREETING ================= */}

//         <View style={styles.greetingSection}>
//           <View>
//             <Text style={styles.greeting}>
//               Hello, Pratima 👋
//             </Text>

//             <Text style={styles.greetingSubtext}>
//               Plan your journey, track live buses,
//             </Text>

//             <Text style={styles.greetingSubtext}>
//               and reach on time.
//             </Text>
//           </View>
//         </View>

//         {/* ================= LOCATION ================= */}

//         <TouchableOpacity style={styles.locationCard}>
//           <View style={styles.locationIcon}>
//             <Ionicons
//               name="location"
//               size={19}
//               color={BLUE}
//             />
//           </View>

//           <View style={styles.locationInfo}>
//             <Text style={styles.smallLabel}>
//               Current Location
//             </Text>

//             <Text style={styles.locationText}>
//               Suriya Road, Bagodar
//             </Text>
//           </View>

//           <Ionicons
//             name="chevron-forward"
//             size={20}
//             color="#777"
//           />
//         </TouchableOpacity>

//         {/* ================= FROM / TO ================= */}

//         <View style={styles.searchCard}>

//           <View style={styles.inputRow}>
//             <View style={styles.fromDot} />

//             <View style={styles.inputContent}>
//               <Text style={styles.inputLabel}>
//                 From
//               </Text>

//               <Text style={styles.inputValue}>
//                 Your current location
//               </Text>
//             </View>

//             <Ionicons
//               name="swap-vertical"
//               size={20}
//               color={BLUE}
//             />
//           </View>

//           <View style={styles.line} />

//           <View style={styles.inputRow}>
//             <View style={styles.toDot} />

//             <View style={styles.inputContent}>
//               <Text style={styles.inputLabel}>
//                 To
//               </Text>

//               <Text style={styles.inputValuePlaceholder}>
//                 Where do you want to go?
//               </Text>
//             </View>
//           </View>

//           <TouchableOpacity
//             style={styles.searchButton}
//             onPress={() => console.log("Search buses")}
//           >
//             <Ionicons
//               name="search"
//               size={19}
//               color="#FFFFFF"
//             />

//             <Text style={styles.searchButtonText}>
//               Search Buses
//             </Text>
//           </TouchableOpacity>

//         </View>

//         {/* ================= LOGIN / REGISTER ================= */}

//         <TouchableOpacity
//           style={styles.loginCard}
//           onPress={() => router.push("/login")}
//         >
//           <View style={styles.loginIcon}>
//             <Ionicons
//               name="lock-closed"
//               size={18}
//               color={BLUE}
//             />
//           </View>

//           <View style={styles.loginContent}>
//             <Text style={styles.loginTitle}>
//               Login / Register
//             </Text>

//             <Text style={styles.loginSubtitle}>
//               Login to save routes and get notifications
//             </Text>
//           </View>

//           <Ionicons
//             name="chevron-forward"
//             size={20}
//             color={BLUE}
//           />
//         </TouchableOpacity>

//         {/* ================= LIVE BUSES ================= */}

//         <View style={styles.sectionHeader}>
//           <View>
//             <Text style={styles.sectionTitle}>
//               Live Running Buses
//             </Text>

//             <Text style={styles.sectionSubtitle}>
//               Buses near your location
//             </Text>
//           </View>

//           <TouchableOpacity
//             onPress={() => console.log("View all buses")}
//           >
//             <Text style={styles.viewAll}>
//               View All
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* BUS CARDS */}

//         {buses.map((bus) => (
//           <TouchableOpacity
//             key={bus.id}
//             style={styles.busCard}
//             onPress={() =>
//               console.log("Selected:", bus.id)
//             }
//           >

//             <View style={styles.busIcon}>
//               <Ionicons
//                 name="bus"
//                 size={21}
//                 color={BLUE}
//               />
//             </View>

//             <View style={styles.busInfo}>
//               <View style={styles.busTitleRow}>
//                 <Text style={styles.busName}>
//                   {bus.id}
//                 </Text>

//                 <View
//                   style={[
//                     styles.statusDot,
//                     {
//                       backgroundColor:
//                         bus.statusColor,
//                     },
//                   ]}
//                 />
//               </View>

//               <Text style={styles.busRoute}>
//                 {bus.route}
//               </Text>

//               <Text
//                 style={[
//                   styles.busStatus,
//                   {
//                     color: bus.statusColor,
//                   },
//                 ]}
//               >
//                 {bus.status} • {bus.time}
//               </Text>
//             </View>

//             <Ionicons
//               name="chevron-forward"
//               size={20}
//               color="#999"
//             />

//           </TouchableOpacity>
//         ))}

//         {/* ================= QUICK FEATURES ================= */}

//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>
//             Quick Access
//           </Text>
//         </View>

//         <View style={styles.quickGrid}>

//           {/* Nearby */}
//           <TouchableOpacity
//             style={styles.quickCard}
//             onPress={() => console.log("Nearby buses")}
//           >
//             <View style={styles.quickIcon}>
//               <Ionicons
//                 name="location"
//                 size={23}
//                 color={BLUE}
//               />
//             </View>

//             <Text style={styles.quickTitle}>
//               Nearby Buses
//             </Text>

//             <Text style={styles.quickSubtitle}>
//               Find buses around you
//             </Text>
//           </TouchableOpacity>

//           {/* Live Map */}
//           <TouchableOpacity
//             style={styles.quickCard}
//             onPress={() => console.log("Live map")}
//           >
//             <View style={styles.quickIcon}>
//               <Ionicons
//                 name="map"
//                 size={23}
//                 color={BLUE}
//               />
//             </View>

//             <Text style={styles.quickTitle}>
//               Live Map
//             </Text>

//             <Text style={styles.quickSubtitle}>
//               Track buses live
//             </Text>
//           </TouchableOpacity>

//           {/* Routes */}
//           <TouchableOpacity
//             style={styles.quickCard}
//             onPress={() => console.log("Routes")}
//           >
//             <View style={styles.quickIcon}>
//               <Ionicons
//                 name="navigate"
//                 size={23}
//                 color={BLUE}
//               />
//             </View>

//             <Text style={styles.quickTitle}>
//               Bus Routes
//             </Text>

//             <Text style={styles.quickSubtitle}>
//               Explore available routes
//             </Text>
//           </TouchableOpacity>

//           {/* Favorites */}
//           <TouchableOpacity
//             style={styles.quickCard}
//             onPress={() => console.log("Favorites")}
//           >
//             <View style={styles.quickIcon}>
//               <Ionicons
//                 name="heart"
//                 size={23}
//                 color={BLUE}
//               />
//             </View>

//             <Text style={styles.quickTitle}>
//               Favorites
//             </Text>

//             <Text style={styles.quickSubtitle}>
//               Your saved routes
//             </Text>
//           </TouchableOpacity>

//         </View>

//         {/* ================= NOTIFICATION ================= */}

//         <TouchableOpacity
//           style={styles.notificationCard}
//           onPress={() => console.log("Notifications")}
//         >
//           <View style={styles.notificationIcon}>
//             <Ionicons
//               name="notifications"
//               size={22}
//               color={BLUE}
//             />
//           </View>

//           <View style={styles.notificationContent}>
//             <Text style={styles.notificationTitle}>
//               Transport Notifications
//             </Text>

//             <Text style={styles.notificationText}>
//               Get updates about delays and route changes
//             </Text>
//           </View>

//           <Ionicons
//             name="chevron-forward"
//             size={20}
//             color="#999"
//           />
//         </TouchableOpacity>

//         {/* ================= PROFILE ================= */}

//         <TouchableOpacity
//           style={styles.profileCard}
//           onPress={() => console.log("Manage profile")}
//         >
//           <View style={styles.profileIcon}>
//             <Ionicons
//               name="person"
//               size={22}
//               color={BLUE}
//             />
//           </View>

//           <View style={styles.profileContent}>
//             <Text style={styles.profileTitle}>
//               Manage Profile
//             </Text>

//             <Text style={styles.profileText}>
//               Account, preferences and saved routes
//             </Text>
//           </View>

//           <Ionicons
//             name="chevron-forward"
//             size={20}
//             color="#999"
//           />
//         </TouchableOpacity>

//         {/* Bottom spacing */}
//         <View style={{ height: 30 }} />

//       </ScrollView>

//       {/* ================= BOTTOM NAVIGATION ================= */}

//       <View style={styles.bottomNav}>

//         <TouchableOpacity style={styles.navItem}>
//           <Ionicons
//             name="home"
//             size={23}
//             color={BLUE}
//           />

//           <Text style={[styles.navText, styles.activeNavText]}>
//             Home
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => console.log("Live buses")}
//         >
//           <Ionicons
//             name="bus"
//             size={23}
//             color="#888"
//           />

//           <Text style={styles.navText}>
//             Live Buses
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => console.log("My routes")}
//         >
//           <Ionicons
//             name="heart-outline"
//             size={23}
//             color="#888"
//           />

//           <Text style={styles.navText}>
//             My Routes
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => console.log("Profile")}
//         >
//           <Ionicons
//             name="person-outline"
//             size={23}
//             color="#888"
//           />

//           <Text style={styles.navText}>
//             Profile
//           </Text>
//         </TouchableOpacity>

//       </View>

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F8FC",
//   },

//   /* ================= HEADER ================= */

//   header: {
//     backgroundColor: BLUE,
//     paddingTop: 48,
//     paddingBottom: 18,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 22,
//     borderBottomRightRadius: 22,
//   },

//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   logoContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   logoCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   logoText: {
//     color: "#FFFFFF",
//     fontSize: 20,
//     fontWeight: "700",
//     marginLeft: 10,
//   },

//   profileButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   /* ================= CONTENT ================= */

//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },

//   greetingSection: {
//     marginBottom: 14,
//   },

//   greeting: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#202124",
//   },

//   greetingSubtext: {
//     fontSize: 13,
//     color: "#777",
//     marginTop: 3,
//   },

//   /* ================= LOCATION ================= */

//   locationCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 13,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   locationIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: "#EAF5FF",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   locationInfo: {
//     flex: 1,
//     marginLeft: 11,
//   },

//   smallLabel: {
//     fontSize: 11,
//     color: "#999",
//   },

//   locationText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//     marginTop: 2,
//   },

//   /* ================= SEARCH ================= */

//   searchCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 15,
//     marginBottom: 12,
//   },

//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   fromDot: {
//     width: 11,
//     height: 11,
//     borderRadius: 6,
//     backgroundColor: "#20B26B",
//     marginHorizontal: 4,
//   },

//   toDot: {
//     width: 11,
//     height: 11,
//     borderRadius: 6,
//     backgroundColor: "#FF4D4D",
//     marginHorizontal: 4,
//   },

//   inputContent: {
//     flex: 1,
//     marginLeft: 10,
//   },

//   inputLabel: {
//     fontSize: 11,
//     color: "#999",
//   },

//   inputValue: {
//     fontSize: 14,
//     color: "#333",
//     fontWeight: "500",
//     marginTop: 3,
//   },

//   inputValuePlaceholder: {
//     fontSize: 14,
//     color: "#AAAAAA",
//     marginTop: 3,
//   },

//   line: {
//     height: 1,
//     backgroundColor: "#EEEEEE",
//     marginVertical: 12,
//     marginLeft: 9,
//   },

//   searchButton: {
//     height: 46,
//     backgroundColor: BLUE,
//     borderRadius: 11,
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//     marginTop: 15,
//   },

//   searchButtonText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//     marginLeft: 8,
//   },

//   /* ================= LOGIN ================= */

//   loginCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 13,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E5F1FC",
//   },

//   loginIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: "#EAF5FF",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   loginContent: {
//     flex: 1,
//     marginLeft: 11,
//   },

//   loginTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#333",
//   },

//   loginSubtitle: {
//     fontSize: 11,
//     color: "#888",
//     marginTop: 3,
//   },

//   /* ================= SECTIONS ================= */

//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   sectionTitle: {
//     fontSize: 17,
//     fontWeight: "700",
//     color: "#222",
//   },

//   sectionSubtitle: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 3,
//   },

//   viewAll: {
//     color: BLUE,
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   /* ================= BUS ================= */

//   busCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 13,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 9,
//   },

//   busIcon: {
//     width: 43,
//     height: 43,
//     borderRadius: 12,
//     backgroundColor: "#EAF5FF",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   busInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   busTitleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   busName: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#222",
//   },

//   statusDot: {
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     marginLeft: 7,
//   },

//   busRoute: {
//     fontSize: 12,
//     color: "#777",
//     marginTop: 3,
//   },

//   busStatus: {
//     fontSize: 11,
//     marginTop: 4,
//     fontWeight: "500",
//   },

//   /* ================= QUICK ACCESS ================= */

//   quickGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },

//   quickCard: {
//     width: "48%",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 10,
//   },

//   quickIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     backgroundColor: "#EAF5FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 9,
//   },

//   quickTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#333",
//   },

//   quickSubtitle: {
//     fontSize: 10,
//     color: "#888",
//     marginTop: 4,
//     lineHeight: 15,
//   },

//   /* ================= NOTIFICATION ================= */

//   notificationCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 5,
//     marginBottom: 10,
//   },

//   notificationIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: "#EAF5FF",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   notificationContent: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   notificationTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#333",
//   },

//   notificationText: {
//     fontSize: 11,
//     color: "#888",
//     marginTop: 3,
//   },

//   /* ================= PROFILE ================= */

//   profileCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   profileIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: "#EAF5FF",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   profileContent: {
//     flex: 1,
//     marginLeft: 12,
//   },

//   profileTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#333",
//   },

//   profileText: {
//     fontSize: 11,
//     color: "#888",
//     marginTop: 3,
//   },

//   /* ================= BOTTOM NAV ================= */

//   bottomNav: {
//     height: 70,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 1,
//     borderTopColor: "#EEEEEE",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingBottom: 5,
//   },

//   navItem: {
//     alignItems: "center",
//     justifyContent: "center",
//     minWidth: 70,
//   },

//   navText: {
//     fontSize: 10,
//     color: "#888",
//     marginTop: 4,
//   },

//   activeNavText: {
//     color: BLUE,
//     fontWeight: "600",
//   },
// });

// // import React from "react";
// // import { View, Text } from "react-native";

// // export default function HomeTab() {
// //   return (
// //     <View>
// //       <Text>RouteSync Home</Text>
// //     </View>
// //   );
// // }
