import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Field, PillButton, PrimaryButton, SectionTitle } from "../../components/ui";
import { colors, radius } from "../../constants/theme";
import { fareForStations, money } from "../../src/domain/format";
import type { TransportType } from "../../src/domain/types";
import { useWallet } from "../../src/state/WalletProvider";

const stations = [
  "KL Sentral",
  "Pasar Seni",
  "KLCC",
  "Pass Merdeka",
  "Bukit Bintang",
  "Muzium Negara",
  "TRX (Exchange)",
];

export default function TransitScreen() {
  const { state, store } = useWallet();
  const [mode, setMode] = useState<"tickets" | "cards" | "qr">("tickets");
  const [source, setSource] = useState(stations[0]);
  const [destination, setDestination] = useState(stations[2]);
  const [type, setType] = useState<TransportType>("MRT");
  const [cardNumber, setCardNumber] = useState("3100 4200 8899");
  const [cardName, setCardName] = useState("Daily Commute");
  const [reload, setReload] = useState("10");
  const fare = useMemo(() => fareForStations(stations, source, destination), [source, destination]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.tabs}>
        <PillButton label="Buy Tickets" active={mode === "tickets"} onPress={() => setMode("tickets")} />
        <PillButton label="Physical TNG" active={mode === "cards"} onPress={() => setMode("cards")} />
        <PillButton label="Tap QR Gate" active={mode === "qr"} onPress={() => setMode("qr")} />
      </View>

      {mode === "tickets" ? (
        <>
          <Card>
            <SectionTitle title="Metro Booking Office" action={money(state.wallet.balance)} />
            <View style={styles.inline}>
              {(["MRT", "LRT", "BUS"] as TransportType[]).map((item) => (
                <PillButton key={item} label={item} active={type === item} onPress={() => setType(item)} />
              ))}
            </View>
            <Text style={styles.label}>Origin</Text>
            <View style={styles.stationGrid}>
              {stations.map((station) => (
                <Station key={station} label={station} active={source === station} onPress={() => setSource(station)} />
              ))}
            </View>
            <Text style={styles.label}>Destination</Text>
            <View style={styles.stationGrid}>
              {stations.map((station) => (
                <Station
                  key={station}
                  label={station}
                  active={destination === station}
                  onPress={() => setDestination(station)}
                />
              ))}
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Calculated fare</Text>
              <Text style={styles.fareValue}>{money(fare)}</Text>
            </View>
            <PrimaryButton label="Buy Ticket" icon="ticket" onPress={() => store.buyTransitTicket(source, destination, type, fare)} />
          </Card>

          <SectionTitle title="Booked Tickets" />
          {state.tickets.filter((ticket) => ticket.status === "ACTIVE").map((ticket) => (
            <Card key={ticket.id} style={styles.ticket}>
              <View>
                <Text style={styles.title}>{ticket.transportType} Ticket</Text>
                <Text style={styles.meta}>{ticket.sourceStation} to {ticket.destinationStation}</Text>
                <Text style={styles.qr}>{ticket.qrCodePayload}</Text>
              </View>
              <PrimaryButton label="Use" onPress={() => store.markTicketUsed(ticket.id)} />
            </Card>
          ))}
        </>
      ) : null}

      {mode === "cards" ? (
        <>
          <Card>
            <SectionTitle title="Link Physical Card" />
            <View style={styles.form}>
              <Field label="Card Alias" value={cardName} onChangeText={setCardName} />
              <Field label="Card Number" value={cardNumber} onChangeText={setCardNumber} />
              <PrimaryButton label="Link Card" icon="card" onPress={() => store.linkTngCard(cardNumber, cardName, 20)} />
            </View>
          </Card>
          <SectionTitle title="Linked Cards" />
          {state.cards.map((card) => (
            <Card key={card.cardNumber} style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{card.cardName}</Text>
                <Text style={styles.meta}>{card.cardNumber} • {money(card.balance)}</Text>
              </View>
              <View style={styles.reloadBox}>
                <Field label="Reload" value={reload} onChangeText={setReload} keyboardType="decimal-pad" />
                <PrimaryButton label="Reload" onPress={() => store.reloadPhysicalCard(card.cardNumber, Number.parseFloat(reload) || 0)} />
              </View>
            </Card>
          ))}
        </>
      ) : null}

      {mode === "qr" ? (
        <Card style={styles.gate}>
          <Text style={styles.gateTitle}>Transit QR Gate</Text>
          <Text style={styles.gateRing}>QR</Text>
          <Text style={styles.meta}>Simulate a gate passage and charge a fixed fare.</Text>
          <PrimaryButton label="Tap Gate, RM 2.40" icon="qr-code" onPress={() => store.useTransitQR(2.4)} />
        </Card>
      ) : null}
    </ScrollView>
  );
}

function Station({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.station, active && styles.stationActive]}>
      <Text style={[styles.stationText, active && styles.stationTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 16, padding: 16, paddingBottom: 28 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 8 },
  inline: { flexDirection: "row", gap: 8, marginBottom: 12 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: "900", marginBottom: 8, marginTop: 8 },
  stationGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  station: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stationActive: { backgroundColor: colors.blue },
  stationText: { color: colors.textMuted, fontSize: 12, fontWeight: "800" },
  stationTextActive: { color: colors.surface },
  fareRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
  },
  fareLabel: { color: colors.textMuted, fontSize: 13, fontWeight: "800" },
  fareValue: { color: colors.blue, fontSize: 22, fontWeight: "900" },
  ticket: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 15, fontWeight: "900" },
  meta: { color: colors.textMuted, fontSize: 12, fontWeight: "700", marginTop: 4 },
  qr: { color: colors.blueDark, fontSize: 11, fontWeight: "900", marginTop: 8 },
  form: { gap: 12 },
  cardRow: { gap: 12 },
  reloadBox: { gap: 10 },
  gate: { alignItems: "center", gap: 14, padding: 24 },
  gateTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  gateRing: {
    borderColor: colors.blue,
    borderRadius: 70,
    borderWidth: 10,
    color: colors.blue,
    fontSize: 32,
    fontWeight: "900",
    height: 140,
    lineHeight: 120,
    textAlign: "center",
    width: 140,
  },
});
