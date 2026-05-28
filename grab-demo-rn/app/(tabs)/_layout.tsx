import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";
import {
  IconTabActivity,
  IconTabHome,
  IconTabMessages,
  IconTabPayment,
} from "../../components/GrabIcons";

const INACTIVE = "#9A9A9A";
const ACTIVE = colors.green;

function MessagesTabIcon({ focused }: { focused: boolean }) {
  const UNREAD = 4;
  return (
    <View>
      <IconTabMessages size={22} color={focused ? ACTIVE : INACTIVE} />
      <View style={badgeStyles.badge}>
        <Text style={badgeStyles.badgeText}>{UNREAD}</Text>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
          tabBarIcon: ({ focused }) => {
            if (route.name === "index") {
              if (focused) {
                return (
                  <View style={homeIconStyles.wrapActive}>
                    <IconTabHome size={22} />
                  </View>
                );
              }
              return <Ionicons name="home-outline" size={22} color={INACTIVE} />;
            }
            if (route.name === "payment")
              return <IconTabPayment size={22} color={focused ? ACTIVE : INACTIVE} />;
            if (route.name === "activity")
              return <IconTabActivity size={22} color={focused ? ACTIVE : INACTIVE} />;
            if (route.name === "messages")
              return <MessagesTabIcon focused={focused} />;
            return null;
          },
        })}
      >
        <Tabs.Screen name="index"    options={{ title: "Home" }} />
        <Tabs.Screen name="payment"  options={{ title: "Payment" }} />
        <Tabs.Screen name="activity" options={{ title: "Activity" }} />
        <Tabs.Screen name="messages" options={{ title: "Messages" }} />
        {/* Account tab hidden — not in the Grab design spec */}
        <Tabs.Screen name="account"  options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    height: 82,
    paddingBottom: 16,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: { fontSize: 10.5, fontWeight: "600", marginTop: 2 },
  tabItem: { paddingTop: 4 },
});

const homeIconStyles = StyleSheet.create({
  wrapActive: {
    width: 46,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
});

const badgeStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
});
