import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { WalletProvider, useWallet } from "../src/state/WalletProvider";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { InvestmentProvider, useInvestments } from "../src/state/InvestmentProvider";

function Toast() {
  const { toast, clearToast } = useWallet();
  const { toast: investmentToast, clearToast: clearInvestmentToast } = useInvestments();
  const message = investmentToast ?? toast;
  if (!message) return null;
  return (
    <Pressable
      onPress={() => {
        clearToast();
        clearInvestmentToast();
      }}
      style={styles.toast}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <InvestmentProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </InvestmentProvider>
      </WalletProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  toast: {
    backgroundColor: colors.text,
    borderRadius: 14,
    bottom: 104,
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "absolute",
    right: 16,
  },
  toastText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
