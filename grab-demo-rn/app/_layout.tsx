import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors, radius } from "../constants/theme";
import { GrabProvider, useGrab } from "../src/state/GrabProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <GrabProvider>
        <AppShell />
      </GrabProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const { state, store, toast } = useGrab();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ride-booking" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="food" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="order-tracking" options={{ animation: "slide_from_bottom" }} />
      </Stack>

      {/* Global announcement modal */}
      <Modal
        visible={state.announcement !== null}
        transparent
        animationType="fade"
        onRequestClose={() => store.dismissAnnouncement()}
      >
        <Pressable style={styles.overlay} onPress={() => store.dismissAnnouncement()}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBg}>
                <Text style={styles.modalIcon}>ℹ️</Text>
              </View>
              <Text style={styles.modalTitle}>Grab App Notice</Text>
            </View>
            <Text style={styles.modalBody}>{state.announcement}</Text>
            <Pressable style={styles.modalBtn} onPress={() => store.dismissAnnouncement()}>
              <Text style={styles.modalBtnText}>Got it!</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Toast notifications */}
      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: 24,
    width: "100%",
    maxWidth: 380,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  modalIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.greenLight, alignItems: "center", justifyContent: "center" },
  modalIcon: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.textDark },
  modalBody: { fontSize: 14, color: colors.textGray, lineHeight: 21, marginBottom: 20 },
  modalBtn: { backgroundColor: colors.green, borderRadius: radius.lg, paddingVertical: 13, alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: "rgba(15,23,42,0.88)",
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  toastText: { color: "#fff", fontSize: 13, fontWeight: "600", textAlign: "center" },
});
