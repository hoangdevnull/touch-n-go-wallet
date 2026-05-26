package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.TngCardEntity
import com.example.data.TransitTicketEntity
import com.example.ui.WalletViewModel
import com.example.ui.theme.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun TransportScreen(
    viewModel: WalletViewModel,
    modifier: Modifier = Modifier
) {
    val cards by viewModel.cards.collectAsState()
    val tickets by viewModel.tickets.collectAsState()
    val walletState by viewModel.walletState.collectAsState()

    var activeSubTab by remember { mutableStateOf("TICKETING") } // "TICKETING", "CARDS", "TRANSIT_QR"

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Service Selection tab row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0x0E000000)),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            listOf(
                "TICKETING" to "Buy Tickets",
                "CARDS" to "Physical TNG",
                "TRANSIT_QR" to "Tap QR Gate"
            ).forEach { (tabId, label) ->
                val isSelected = activeSubTab == tabId
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .padding(4.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) TngBluePrimary else Color.Transparent)
                        .clickable { activeSubTab = tabId }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else Color.Gray
                    )
                }
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f)
                .testTag("transport_scroll"),
            contentPadding = PaddingValues(bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            when (activeSubTab) {
                "TICKETING" -> {
                    item { TicketingSubsystem(viewModel, walletState?.balance ?: 0.0) }
                    item { BookedTicketsListHeader() }
                    
                    val booked = tickets.filter { it.status == "ACTIVE" }
                    if (booked.isEmpty()) {
                        item { EmptyTicketsPlaceholder() }
                    } else {
                        items(booked) { ticket ->
                            itemContent {
                                TransitTicketCard(ticket = ticket) {
                                    viewModel.markTicketUsed(ticket.id)
                                }
                            }
                        }
                    }
                }
                "CARDS" -> {
                    item { LinkNewCardComponent(viewModel) }
                    item { CardsListHeader() }
                    if (cards.isEmpty()) {
                        item { EmptyCardsPlaceholder() }
                    } else {
                        items(cards) { card ->
                            itemContent {
                                PhysicalCardItem(card = card, viewModel = viewModel)
                            }
                        }
                    }
                }
                "TRANSIT_QR" -> {
                    item { TransitGateSimulator(viewModel, walletState?.balance ?: 0.0) }
                }
            }
        }
    }
}

// Wrapper utility for items
@Composable
inline fun itemContent(crossinline content: @Composable () -> Unit) {
    Box(modifier = Modifier.padding(horizontal = 16.dp)) {
        content()
    }
}

@Composable
fun TicketingSubsystem(viewModel: WalletViewModel, walletBalance: Double) {
    val stations = listOf(
        "KL Sentral",
        "Pasar Seni",
        "KLCC",
        "Pass Merdeka",
        "Bukit Bintang",
        "Muzium Negara",
        "TRX (Exchange)"
    )

    var sourceStation by remember { mutableStateOf(stations[0]) }
    var destStation by remember { mutableStateOf(stations[2]) }
    var transitType by remember { mutableStateOf("MRT") } // "MRT", "LRT"

    // Multi-station distance fare logic (working Fare Calculator)
    val computedFare = remember(sourceStation, destStation) {
        val sIdx = stations.indexOf(sourceStation)
        val dIdx = stations.indexOf(destStation)
        val hops = kotlin.math.abs(sIdx - dIdx)
        if (hops == 0) 1.20 else 1.20 + (hops * 0.80)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Metro Booking Office",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TngBluePrimary
                )
                // Type Switcher
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFF1F5F9))
                ) {
                    listOf("MRT", "LRT").forEach { type ->
                        val isSelected = transitType == type
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (isSelected) TngYellowAccent else Color.Transparent)
                                .clickable { transitType = type }
                                .padding(horizontal = 12.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = type,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) TngBluePrimary else Color.Gray
                            )
                        }
                    }
                }
            }

            // Route selectors
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Select Origin Station", fontSize = 11.sp, color = Color.Gray)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFF8FAFC))
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.TripOrigin,
                        contentDescription = null,
                        tint = TngBluePrimary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(modifier = Modifier.weight(1f)) {
                        StationDropdownMenu(
                            selectedStation = sourceStation,
                            stations = stations,
                            onSelected = { sourceStation = it }
                        )
                    }
                }

                // Inter-station divider line
                Box(
                    modifier = Modifier
                        .padding(start = 20.dp)
                        .height(16.dp)
                        .width(1.dp)
                        .background(Color.LightGray)
                )

                Text("Select Destination Station", fontSize = 11.sp, color = Color.Gray)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFF8FAFC))
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Place,
                        contentDescription = null,
                        tint = Color(0xFFEF4444),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(modifier = Modifier.weight(1f)) {
                        StationDropdownMenu(
                            selectedStation = destStation,
                            stations = stations,
                            onSelected = { destStation = it }
                        )
                    }
                }
            }

            HorizontalDivider(color = Color(0xFFF1F5F9))

            // Fare Calculator visual details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Ticket Fare Calculator",
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "RM ${String.format("%.2f", computedFare)}",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            color = TngBluePrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Single Entry",
                            fontSize = 11.sp,
                            color = Color.LightGray
                        )
                    }
                }

                Button(
                    onClick = {
                        viewModel.buyTransitTicket(
                            sourceStation,
                            destStation,
                            transitType,
                            computedFare
                        ) {}
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = TngYellowAccent,
                        contentColor = TngBlueDark
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.testTag("book_ticket_btn")
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Purchase Pass", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }

            if (walletBalance < computedFare) {
                Text(
                    text = "⚠️ Your eWallet balance is insufficient. Please top-up.",
                    color = Color(0xFFEF4444),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
fun StationDropdownMenu(
    selectedStation: String,
    stations: List<String>,
    onSelected: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Box {
        Text(
            text = selectedStation,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = Color.Black,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = true }
        )
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            stations.forEach { st ->
                DropdownMenuItem(
                    text = { Text(st, fontSize = 13.sp) },
                    onClick = {
                        onSelected(st)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
fun LinkNewCardComponent(viewModel: WalletViewModel) {
    var numInput by remember { mutableStateOf("") }
    var aliasInput by remember { mutableStateOf("") }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "Add Physical Touch 'n Go Card",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TngBluePrimary
            )
            Text(
                text = "Link your 10-digit serial card to monitor, manage balances, and perform direct wallet-to-card NFC transfers.",
                fontSize = 11.sp,
                color = Color.Gray
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = numInput,
                    onValueChange = { if (it.length <= 10) numInput = it },
                    label = { Text("10-Digit Card Serial") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .weight(1.2f)
                        .testTag("card_number_input")
                )
                OutlinedTextField(
                    value = aliasInput,
                    onValueChange = { aliasInput = it },
                    label = { Text("Card Name") },
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("card_alias_input")
                )
            }

            Button(
                onClick = {
                    if (numInput.length >= 6 && aliasInput.isNotBlank()) {
                        viewModel.linkTngCard(numInput, aliasInput, 15.00)
                        numInput = ""
                        aliasInput = ""
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("link_card_submit_btn"),
                colors = ButtonDefaults.buttonColors(containerColor = TngBluePrimary)
            ) {
                Text("Verify & Bind Card", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun TransitGateSimulator(viewModel: WalletViewModel, walletBalance: Double) {
    var hasScanned by remember { mutableStateOf(false) }
    var gateStatusMsg by remember { mutableStateOf("Hold QR ticket under the terminal to enter") }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Contactless MRT/LRT QR Gate",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TngBluePrimary,
                modifier = Modifier.align(Alignment.Start)
            )

            // Visual Gate status barrier
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (hasScanned) Color(0xFFD1FAE5) else Color(0xFFFEE2E2)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = if (hasScanned) Icons.Default.LockOpen else Icons.Default.Lock,
                        contentDescription = null,
                        tint = if (hasScanned) Color(0xFF059669) else Color(0xFFDC2626),
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (hasScanned) "GATE ACCESSIBLE - PASS!" else "GATE SEALED - TAP TO SCAN",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = if (hasScanned) Color(0xFF047857) else Color(0xFFB91C1C)
                    )
                }
            }

            // Smart ticket barcode simulation
            Card(
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .size(180.dp)
                    .padding(8.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        // Drawing pseudo QR code lines
                        Canvas(modifier = Modifier.size(100.dp)) {
                            drawRect(
                                color = Color.Black,
                                style = Stroke(width = 3f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f))
                            )
                            drawRect(
                                color = Color.Black,
                                topLeft = androidx.compose.ui.geometry.Offset(15f, 15f),
                                size = androidx.compose.ui.geometry.Size(30f, 30f)
                            )
                            drawRect(
                                color = Color.Black,
                                topLeft = androidx.compose.ui.geometry.Offset(55f, 15f),
                                size = androidx.compose.ui.geometry.Size(30f, 30f)
                            )
                            drawRect(
                                color = Color.Black,
                                topLeft = androidx.compose.ui.geometry.Offset(15f, 55f),
                                size = androidx.compose.ui.geometry.Size(30f, 30f)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "PASSAGE TICKET QR",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.DarkGray
                        )
                    }
                }
            }

            Text(
                text = gateStatusMsg,
                fontSize = 12.sp,
                color = Color.Gray
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Mock scanner button (Charges real wallet cash!)
                Button(
                    onClick = {
                        viewModel.useTransitQR(2.50) { success ->
                            if (success) {
                                hasScanned = true
                                gateStatusMsg = "BEEP! Ticket validated. Flat-fare RM 2.50 charged."
                            } else {
                                gateStatusMsg = "ERR! Insufficient eWallet balance. Gate closed."
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TngBluePrimary),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("gate_transit_tap_btn")
                ) {
                    Icon(imageVector = Icons.Default.Sensors, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Swipe Gate QR", fontWeight = FontWeight.Bold)
                }

                if (hasScanned) {
                    TextButton(
                        onClick = {
                            hasScanned = false
                            gateStatusMsg = "Gate reset. Present QR code terminal."
                        }
                    ) {
                        Text("Reset Gate")
                    }
                }
            }
        }
    }
}

@Composable
fun PhysicalCardItem(card: TngCardEntity, viewModel: WalletViewModel) {
    var showQuickReloadDialog by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Card Color block
                Box(
                    modifier = Modifier
                        .width(48.dp)
                        .height(32.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(
                            if (card.isEnhanced) TngBluePrimary else Color(0xFF475569)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text("TNG", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Black)
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = card.cardName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.Black
                    )
                    Text(
                        text = "Serial No: ${card.cardNumber}",
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "RM ${String.format("%.2f", card.balance)}",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 15.sp,
                    color = TngBluePrimary
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = "Reload",
                        fontSize = 11.sp,
                        color = TngBluePrimary,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .clickable { showQuickReloadDialog = true }
                            .testTag("card_reload_trigger_${card.cardNumber}")
                    )
                    Text(
                        text = "Unlink",
                        fontSize = 11.sp,
                        color = Color.Gray,
                        modifier = Modifier.clickable { viewModel.removeTngCard(card.cardNumber) }
                    )
                }
            }
        }
    }

    if (showQuickReloadDialog) {
        var reloadValue by remember { mutableStateOf("10.00") }
        AlertDialog(
            onDismissRequest = { showQuickReloadDialog = false },
            title = { Text("Transfer Balance to Card", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Instantly reload ${card.cardName} using your eWallet balance. Touch card to back of phone setup.",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        listOf("10.00", "20.00", "50.00").forEach { valStr ->
                            val active = reloadValue == valStr
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (active) TngBluePrimary else Color(0x1A000000))
                                    .clickable { reloadValue = valStr }
                                    .padding(horizontal = 14.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = "RM $valStr",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (active) Color.White else Color.Black
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amount = reloadValue.toDoubleOrNull() ?: 0.0
                        viewModel.reloadPhysicalCard(card.cardNumber, amount) { success ->
                            if (success) {
                                showQuickReloadDialog = false
                            }
                        }
                    }
                ) {
                    Text("Authorized Transfer")
                }
            },
            dismissButton = {
                TextButton(onClick = { showQuickReloadDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun TransitTicketCard(
    ticket: TransitTicketEntity,
    onUseTicket: () -> Unit
) {
    var showDetailsDialog by remember { mutableStateOf(false) }
    val timeFormatter = remember { SimpleDateFormat("dd MMM - hh:mm a", Locale.getDefault()) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { showDetailsDialog = true },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(TngBlueLight),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.DirectionsTransit,
                        contentDescription = null,
                        tint = TngBluePrimary
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "${ticket.transportType}: ${ticket.sourceStation} ⇆ ${ticket.destinationStation}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color.Black
                    )
                    Text(
                        text = "Purchased on: ${timeFormatter.format(Date(ticket.timestamp))}",
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                }
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xFFE2E8F0))
                    .clickable { showDetailsDialog = true }
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text("View", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TngBluePrimary)
            }
        }
    }

    if (showDetailsDialog) {
        AlertDialog(
            onDismissRequest = { showDetailsDialog = false },
            title = {
                Column {
                    Text("Transit Journey Pass", fontWeight = FontWeight.Black)
                    Text(
                        text = "Single Journey Ticket - ${ticket.transportType}",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Dotted divider & ticket properties
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("From", fontSize = 10.sp, color = Color.Gray)
                            Text(ticket.sourceStation, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Icon(imageVector = Icons.Default.ArrowForward, contentDescription = null, tint = Color.LightGray)
                        Column(horizontalAlignment = Alignment.End) {
                            Text("To", fontSize = 10.sp, color = Color.Gray)
                            Text(ticket.destinationStation, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Validation Code", fontSize = 10.sp, color = Color.Gray)
                            Text(ticket.qrCodePayload.take(12), fontFamily = FontFamily.Monospace, fontSize = 12.sp)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Price (Paid)", fontSize = 10.sp, color = Color.Gray)
                            Text("RM ${String.format("%.2f", ticket.fare)}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TngBluePrimary)
                        }
                    }

                    // Ticket Barcode for scan gate
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            // Generating interactive barcode
                            Canvas(
                                modifier = Modifier
                                    .width(180.dp)
                                    .height(60.dp)
                            ) {
                                val barCount = 30
                                val spacing = size.width / barCount
                                for (i in 0 until barCount) {
                                    val barWidth = if (i % 3 == 0) 6f else if (i % 2 == 0) 3f else 1.5f
                                    drawRect(
                                        color = Color.Black,
                                        topLeft = androidx.compose.ui.geometry.Offset(i * spacing, 0f),
                                        size = androidx.compose.ui.geometry.Size(barWidth, size.height)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "TAP TO SCAN AT ENTRY TURNSTILE",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.LightGray
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onUseTicket()
                        showDetailsDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TngBluePrimary)
                ) {
                    Text("Verify & Validate Entry Pass")
                }
            }
        )
    }
}

@Composable
fun BookedTicketsListHeader() {
    Text(
        text = "Purchased Transit Tickets",
        fontSize = 15.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 8.dp),
        color = Color.Black
    )
}

@Composable
fun CardsListHeader() {
    Text(
        text = "Currently Linked Cards",
        fontSize = 15.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 8.dp),
        color = Color.Black
    )
}

@Composable
fun EmptyTicketsPlaceholder() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.DirectionsTransit,
                contentDescription = null,
                tint = Color.LightGray,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "No active transport tickets booked.",
                fontWeight = FontWeight.Medium,
                fontSize = 13.sp,
                color = Color.Gray
            )
            Text(
                text = "Use the Metro Booking form above to purchase MRT/LRT cards.",
                fontSize = 11.sp,
                color = Color.LightGray
            )
        }
    }
}

@Composable
fun EmptyCardsPlaceholder() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Default.CreditCard,
                contentDescription = null,
                tint = Color.LightGray,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "No linked physical TNG cards.",
                fontWeight = FontWeight.Medium,
                fontSize = 13.sp,
                color = Color.Gray
            )
        }
    }
}
