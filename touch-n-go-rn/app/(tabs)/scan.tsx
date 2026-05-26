import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Field, PillButton, PrimaryButton } from "../../components/ui";
import { colors, radius } from "../../constants/theme";
import { useWallet } from "../../src/state/WalletProvider";

export default function ScanScreen() {
  const { store } = useWallet();
  const [receive, setReceive] = useState(false);
  const [merchant, setMerchant] = useState("Nasi Lemak Junction");
  const [sender, setSender] = useState("Maya");
  const [amount, setAmount] = useState("8.5");
  const numericAmount = Number.parseFloat(amount) || 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.switcher}>
        <PillButton label="Merchant Pay" icon="scan" active={!receive} onPress={() => setReceive(false)} />
        <PillButton label="Receive Money" icon="qr-code" active={receive} onPress={() => setReceive(true)} />
      </View>

      {!receive ? (
        <Card style={styles.darkCard}>
          <Text style={styles.title}>Scan Merchant QR / Show Barcode</Text>
          <View style={styles.barcode}>
            {Array.from({ length: 38 }).map((_, index) => (
              <View
                key={index}
                style={[styles.bar, { width: index % 5 === 0 ? 5 : index % 2 === 0 ? 3 : 1 }]}
              />
            ))}
          </View>
          <Text style={styles.code}>9820-1094-8254-8162</Text>
          <View style={styles.scanner}>
            <Text style={styles.scannerText}>ALIGN QR CODE</Text>
          </View>
          <View style={styles.form}>
            <Field label="Merchant" value={merchant} onChangeText={setMerchant} />
            <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <PrimaryButton label="Simulate Payment" icon="send" onPress={() => store.sendMoney(merchant, "MERCHANT-QR", numericAmount)} />
          </View>
        </Card>
      ) : (
        <Card style={styles.darkCard}>
          <Text style={styles.title}>Your eWallet Personal QR Code</Text>
          <View style={styles.qrBox}>
            <View style={styles.qrCorner} />
            <View style={[styles.qrCorner, styles.qrTopRight]} />
            <View style={[styles.qrCorner, styles.qrBottomLeft]} />
            <Text style={styles.qrCenter}>TNG</Text>
          </View>
          <Text style={styles.code}>ALEX-CHEN-WALLET</Text>
          <View style={styles.form}>
            <Field label="Sender" value={sender} onChangeText={setSender} />
            <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <PrimaryButton label="Simulate Receive" icon="download" onPress={() => store.receiveMoney(sender, numericAmount)} />
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.dark, flex: 1 },
  content: { gap: 18, padding: 16, paddingBottom: 28 },
  switcher: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 8 },
  darkCard: { backgroundColor: "#111A29", borderColor: "#243249", gap: 16 },
  title: { color: colors.surface, fontSize: 17, fontWeight: "900", textAlign: "center" },
  barcode: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: 3,
    height: 98,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  bar: { backgroundColor: colors.text, height: 56 },
  code: { color: "#D9E8FF", fontSize: 13, fontWeight: "900", textAlign: "center" },
  scanner: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 3,
    height: 220,
    justifyContent: "center",
    width: 220,
  },
  scannerText: { color: colors.yellow, fontSize: 13, fontWeight: "900" },
  form: { gap: 12 },
  qrBox: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: 220,
    position: "relative",
    width: 220,
  },
  qrCorner: {
    backgroundColor: colors.text,
    height: 44,
    left: 24,
    position: "absolute",
    top: 24,
    width: 44,
  },
  qrTopRight: { left: undefined, right: 24 },
  qrBottomLeft: { bottom: 24, top: undefined },
  qrCenter: {
    color: colors.blue,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 220,
    textAlign: "center",
  },
});
