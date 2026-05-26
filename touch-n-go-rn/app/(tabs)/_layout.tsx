import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";

const icons = {
  index: "home",
  lazada: "cart",
  scan: "qr-code",
  gofinance: "cash-outline",
  near: "location-outline",
} as const;

export default function TabLayout() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.blue }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 86,
            paddingBottom: 18,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            lineHeight: 14,
          },
          tabBarItemStyle: {
            paddingTop: route.name === "scan" ? 0 : 2,
          },
          tabBarIcon: ({ color, focused, size }) =>
            route.name === "scan" ? (
              <Ionicons
                name="scan"
                color={colors.surface}
                size={32}
                style={{
                  backgroundColor: colors.blue,
                  borderColor: colors.surface,
                  borderRadius: 35,
                  borderWidth: 5,
                  height: 70,
                  lineHeight: 60,
                  marginTop: -30,
                  overflow: "hidden",
                  textAlign: "center",
                  width: 70,
                }}
              />
            ) : (
              <Ionicons
                name={icons[route.name as keyof typeof icons]}
                color={focused ? colors.blue : color}
                size={size}
              />
            ),
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="lazada" options={{ title: "Lazada" }} />
        <Tabs.Screen name="scan" options={{ title: "" }} />
        <Tabs.Screen name="gofinance" options={{ title: "GOFinance" }} />
        <Tabs.Screen name="near" options={{ title: "Near Me" }} />
      </Tabs>
    </SafeAreaView>
  );
}
