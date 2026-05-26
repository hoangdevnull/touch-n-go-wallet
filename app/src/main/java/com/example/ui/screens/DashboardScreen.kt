package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.TngCardEntity
import com.example.data.TransactionEntity
import com.example.data.WalletStateEntity
import com.example.ui.WalletViewModel
import com.example.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DashboardScreen(
    viewModel: WalletViewModel,
    modifier: Modifier = Modifier,
    onNavigateToTab: (Int) -> Unit
) {
    val walletState by viewModel.walletState.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val cards by viewModel.cards.collectAsState()
    val tickets by viewModel.tickets.collectAsState()

    var showReloadDialog by remember { mutableStateOf(false) }
    var showSendMoneyDialog by remember { mutableStateOf(false) }
    var showGoPlusDialog by remember { mutableStateOf(false) }

    val recentTransactions = remember(transactions) {
        transactions.take(3)
    }

    val activeTickets = remember(tickets) {
        tickets.filter { it.status == "ACTIVE" }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(TngBackground)
            .testTag("dashboard_scroll_list"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        // 1. WELCOME PROFILE HEADER BAR (High Density Theme)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp, start = 16.dp, end = 16.dp, bottom = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFDBEAFE)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profile Avatar",
                            tint = Color(0xFF2563EB),
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    Column {
                        Text(
                            text = "Welcome back,",
                            color = Slate500,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "Alex Chen",
                            color = Slate900,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Top Points indicator
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White)
                            .shadow(1.dp, RoundedCornerShape(12.dp))
                            .clickable {
                                viewModel.addRewardsPoints(10)
                            }
                            .padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Stars,
                            contentDescription = "Points",
                            tint = TngGoldAccent,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${walletState?.rewardPoints ?: 0} pts",
                            color = Slate900,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Search Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .clickable {
                                viewModel.showEventMessage("Search system initialized")
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Slate600,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Notification Button with active red dot badge
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .clickable {
                                viewModel.showEventMessage("Premium notifications list synchronized")
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Box {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Notifications",
                                tint = Slate600,
                                modifier = Modifier.size(20.dp)
                            )
                            // Red Badge Dot
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .align(Alignment.TopEnd)
                                    .clip(CircleShape)
                                    .background(Color(0xFFEF4444))
                            )
                        }
                    }
                }
            }
        }

        // 2. WALLET BALANCE CARD (High Density Modern Gradient style with customized 32.dp rounded corners)
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                WalletHeaderGradientStart,
                                WalletHeaderGradientEnd
                            )
                        )
                    )
                    .padding(vertical = 20.dp, horizontal = 20.dp)
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // Balance & GO+ Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "eWallet Balance",
                                color = Color(0xFFD0E1F9),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                style = MaterialTheme.typography.labelSmall
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "RM ${String.format("%.2f", walletState?.balance ?: 150.00)}",
                                color = Color.White,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.headlineLarge.copy(letterSpacing = (-0.5).sp)
                            )
                        }

                        // GO+ styled capsule with backdrop blur style (white/20 translucency)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0x33FFFFFF))
                                .clickable { showGoPlusDialog = true }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "GO+ 3.45% p.a",
                                        color = TngYellowAccent,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 9.sp
                                    )
                                }
                                Text(
                                    text = "RM ${String.format("%.2f", walletState?.goplusBalance ?: 25.50)}",
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Quick Actions Belt inside Wallet Box (Scan, Pay, Top Up, Transfer)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        QuickActionItem(
                            icon = Icons.Default.QrCodeScanner,
                            label = "Scan",
                            tag = "action_pay_scan_btn"
                        ) {
                            onNavigateToTab(2) // Move to QR reader
                        }
                        QuickActionItem(
                            icon = Icons.Default.Payments,
                            label = "Pay",
                            tag = "action_pay_btn"
                        ) {
                            onNavigateToTab(2) // Pay/Scan Tab
                        }
                        QuickActionItem(
                            icon = Icons.Default.AddCard,
                            label = "Top Up",
                            tag = "action_reload_btn"
                        ) {
                            showReloadDialog = true
                        }
                        QuickActionItem(
                            icon = Icons.Default.Send,
                            label = "Transfer",
                            tag = "action_send_btn"
                        ) {
                            showSendMoneyDialog = true
                        }
                    }
                }
            }
        }

        // 3. MAIN SERVICES GRID (High Density 4x2 Clean grid in White Premium Rounded Card)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(vertical = 20.dp, horizontal = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Row 1
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            ServiceItem(
                                icon = Icons.Default.Nfc,
                                label = "TNG Card",
                                color = Color(0xFFEA580C),
                                bgColor = Color(0xFFFFF7ED)
                            ) {
                                onNavigateToTab(1) // Load Transit Screen Cards
                            }
                        }

                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            ServiceItem(
                                icon = Icons.Default.DirectionsCar,
                                label = "RFID",
                                color = Color(0xFF2563EB),
                                bgColor = Color(0xFFEFF6FF)
                            ) {
                                viewModel.showEventMessage("RFID Toll System synchronized successfully")
                            }
                        }

                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            ServiceItem(
                                icon = Icons.Default.ReceiptLong,
                                label = "Bills",
                                color = Color(0xFF16A34A),
                                bgColor = Color(0xFFF0FDF4)
                            ) {
                                viewModel.showEventMessage("Multi-utility bill payment system ready")
                            }
                        }

                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            ServiceItem(
                                icon = Icons.Default.ConfirmationNumber,
                                label = "Tickets",
                                color = Color(0xFF9333EA),
                                bgColor = Color(0xFFFAF5FF)
                            ) {
                                onNavigateToTab(1) // Transits Screen
                            }
                        }
                    }

                    // Row 2
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            ServiceItem(
                                icon = Icons.Default.Security,
                                label = "Insurance",
                                color = Color(0xFFDB2777),
                                bgColor = Color(0xFFFDF2F8)
                            ) {
                                viewModel.showEventMessage("Comprehensive eWallet insurance active")
                            }
                        }

                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            ServiceItem(
                                icon = Icons.Default.Savings,
                                label = "Invest",
                                color = Color(0xFFD97706),
                                bgColor = Color(0xFFFEFCE8)
                            ) {
                                showGoPlusDialog = true // Trigger GO+ Dialog
                            }
                        }

                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            ServiceItem(
                                icon = Icons.Default.ShoppingBag,
                                label = "Shop",
                                color = Color(0xFF0891B2),
                                bgColor = Color(0xFFECFEFF)
                            ) {
                                viewModel.showEventMessage("Loading premium merchant store offers...")
                            }
                        }

                        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                            ServiceItem(
                                icon = Icons.Default.GridView,
                                label = "More",
                                color = Color(0xFF475569),
                                bgColor = Slate100
                            ) {
                                onNavigateToTab(3) // Transactions Logs as expanded details
                            }
                        }
                    }
                }
            }
        }

        // 4. PUBLIC TRANSPORT TICKETING WIDGET (Split design for LRT and Bus)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFEFF6FF)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Header Area
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(6.dp)
                                    .height(20.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF2563EB))
                            )
                            Text(
                                text = "Public Transport",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate900
                            )
                        }

                        Text(
                            text = "View Schedule",
                            color = TngBluePrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { onNavigateToTab(1) }
                        )
                    }

                    // Side-by-Side LRT and BUS quick-status boxes
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // LRT Status Box
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Slate50)
                                .border(BorderStroke(1.dp, Slate100), RoundedCornerShape(16.dp))
                                .clickable { onNavigateToTab(1) }
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.DirectionsTransit,
                                    contentDescription = "LRT",
                                    tint = Color(0xFF2563EB),
                                    modifier = Modifier.size(20.dp)
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Color(0xFF2563EB))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "LRT",
                                        color = Color.White,
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Column {
                                Text(
                                    text = "Next Arrival",
                                    color = Slate500,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = "KJ14 Pasar Seni",
                                    color = Slate900,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "3 mins",
                                    color = Color(0xFF2563EB),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // BUS Status Box
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Slate50)
                                .border(BorderStroke(1.dp, Slate100), RoundedCornerShape(16.dp))
                                .clickable { onNavigateToTab(1) }
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.DirectionsBus,
                                    contentDescription = "BUS",
                                    tint = Color(0xFFEA580C),
                                    modifier = Modifier.size(20.dp)
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Color(0xFFEA580C))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "BUS",
                                        color = Color.White,
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Column {
                                Text(
                                    text = "Route Status",
                                    color = Slate500,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = "B115 Mid Valley",
                                    color = Slate900,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "On Time",
                                    color = Color(0xFF16A34A),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // 5. LOYALTY/REWARDS BANNER (GO Rewards banner in Orange Soft Theme Card)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEFE7)),
                border = BorderStroke(1.dp, Color(0xFFFFEDD5)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Row(
                    modifier = Modifier
                        .clickable {
                            viewModel.showEventMessage("Opening Rewards Center... Claim your points!")
                        }
                        .padding(14.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFFF97316)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Redeem,
                                contentDescription = "Rewards",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Column {
                            Text(
                                text = "GO Rewards",
                                color = Color(0xFF7C2D12),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "You have 1,240 points to claim",
                                color = Color(0xFFC2410C),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Open rewards",
                        tint = Color(0xFFF97316),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }

        // 6. PHYSICAL TNG CARDS PREVIEW CAROUSEL
        item {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "My Touch 'n Go Cards",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Manage Cards",
                        color = TngBluePrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable { onNavigateToTab(1) }
                    )
                }

                if (cards.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0x06000000))
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.CreditCard,
                                contentDescription = null,
                                tint = Color.LightGray,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "No Linked Cards. Link one to check balance",
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }
                    }
                } else {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(cards) { card ->
                            CardPreviewItem(card = card) {
                                // Reload action trigger
                                viewModel.reloadPhysicalCard(card.cardNumber, 10.0) { success ->
                                    // Event triggered in VM
                                }
                            }
                        }
                    }
                }
            }
        }

        // 7. ACTIVE RESERVED TICKETS
        if (activeTickets.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Active Transport Tickets",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )

                    activeTickets.forEach { ticket ->
                        TransitTicketCard(ticket = ticket) {
                            viewModel.markTicketUsed(ticket.id)
                        }
                    }
                }
            }
        }

        // 8. RECENT TRANSACTION LEDGER
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Recent History",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "See All",
                        color = TngBluePrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable { onNavigateToTab(3) }
                    )
                }

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        if (recentTransactions.isEmpty()) {
                            Text(
                                text = "No transactions found",
                                fontSize = 12.sp,
                                modifier = Modifier
                                    .padding(vertical = 12.dp)
                                    .align(Alignment.CenterHorizontally),
                                color = Color.Gray
                            )
                        } else {
                            recentTransactions.forEachIndexed { index, txn ->
                                TransactionListItem(transaction = txn)
                                if (index < recentTransactions.size - 1) {
                                    HorizontalDivider(
                                        color = Slate100,
                                        modifier = Modifier.padding(vertical = 8.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // RELOAD WALLET POPUP DIALOG
    if (showReloadDialog) {
        var topupAmountStr by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showReloadDialog = false },
            title = { Text("Reload eWallet Balance", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Enter the amount in Ringgit Malaysia (RM) to instantly top up your wallet budget.",
                        fontSize = 13.sp,
                        color = Color.Gray
                    )
                    OutlinedTextField(
                        value = topupAmountStr,
                        onValueChange = { topupAmountStr = it },
                        label = { Text("RM Amount") },
                        placeholder = { Text("e.g. 50.00") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("reload_amount_input")
                    )
                    // Shortcut chips
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(10.0, 20.0, 50.0, 100.0).forEach { amt ->
                            Button(
                                onClick = { topupAmountStr = amt.toString() },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = TngBluePrimary.copy(alpha = 0.1f),
                                    contentColor = TngBluePrimary
                                ),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text("+RM ${amt.toInt()}", fontSize = 11.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amt = topupAmountStr.toDoubleOrNull() ?: 0.0
                        if (amt > 0) {
                            viewModel.reloadWallet(amt)
                            showReloadDialog = false
                        }
                    },
                    modifier = Modifier.testTag("reload_confirm_btn")
                ) {
                    Text("Confirm Reload")
                }
            },
            dismissButton = {
                TextButton(onClick = { showReloadDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // SEND MONEY DIALOG
    if (showSendMoneyDialog) {
        var recipientName by remember { mutableStateOf("") }
        var recipientPhone by remember { mutableStateOf("") }
        var transferAmountStr by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showSendMoneyDialog = false },
            title = { Text("Direct Money Transfer", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Send eWallet cash to other users' contact numbers instantly.",
                        fontSize = 13.sp,
                        color = Color.Gray
                    )
                    OutlinedTextField(
                        value = recipientName,
                        onValueChange = { recipientName = it },
                        label = { Text("Recipient Name") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("send_recipient_name")
                    )
                    OutlinedTextField(
                        value = recipientPhone,
                        onValueChange = { recipientPhone = it },
                        label = { Text("Phone Number") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("send_recipient_phone")
                    )
                    OutlinedTextField(
                        value = transferAmountStr,
                        onValueChange = { transferAmountStr = it },
                        label = { Text("Amount (RM)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("send_amount_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amt = transferAmountStr.toDoubleOrNull() ?: 0.0
                        viewModel.sendMoney(recipientName, recipientPhone, amt) { success ->
                            if (success) {
                                showSendMoneyDialog = false
                            }
                        }
                    },
                    modifier = Modifier.testTag("send_confirm_btn")
                ) {
                    Text("Transfer Now")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSendMoneyDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // GO+ DIALOG
    if (showGoPlusDialog) {
        var investAmountStr by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showGoPlusDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("GO+", color = TngGoldAccent, fontWeight = FontWeight.Black)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Savings & Yield", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = TngBluePrimary.copy(alpha = 0.05f))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "Current GO+ Balance",
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "RM ${String.format("%.2f", walletState?.goplusBalance ?: 25.50)}",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = TngBluePrimary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Earn daily interest yields up to 3.4% p.a. cash back on savings.",
                                fontSize = 11.sp,
                                color = Color.Gray
                            )
                        }
                    }

                    OutlinedTextField(
                        value = investAmountStr,
                        onValueChange = { investAmountStr = it },
                        label = { Text("Amount (RM)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("goplus_amount_input")
                    )
                }
            },
            confirmButton = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = {
                            val amt = investAmountStr.toDoubleOrNull() ?: 0.0
                            viewModel.triggerGoPlusInvestment(amt, isWithdrawal = true) { success ->
                                if (success) showGoPlusDialog = false
                            }
                        },
                        modifier = Modifier.testTag("goplus_withdraw_btn")
                    ) {
                        Text("Cash Out")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val amt = investAmountStr.toDoubleOrNull() ?: 0.0
                            viewModel.triggerGoPlusInvestment(amt, isWithdrawal = false) { success ->
                                if (success) showGoPlusDialog = false
                            }
                        },
                        modifier = Modifier.testTag("goplus_invest_btn")
                    ) {
                        Text("Add Funds")
                    }
                }
            }
        )
    }
}



@Composable
fun CardPreviewItem(
    card: TngCardEntity,
    onQuickReload: () -> Unit
) {
    Box(
        modifier = Modifier
            .width(260.dp)
            .height(140.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(
                brush = Brush.linearGradient(
                    colors = if (card.isEnhanced) {
                        listOf(TngBluePrimary, Color(0xFF007A33))
                    } else {
                        listOf(Color(0xFF1E293B), Color(0xFF334155))
                    }
                )
            )
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = card.cardName,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "No. ${card.cardNumber.take(4)} **** ${card.cardNumber.takeLast(2)}",
                        color = Color(0xB3FFFFFF),
                        fontSize = 11.sp
                    )
                }
                if (card.isEnhanced) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(TngYellowAccent)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "NFC",
                            color = TngBluePrimary,
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(
                        text = "Card Balance",
                        color = Color(0xB3FFFFFF),
                        fontSize = 10.sp
                    )
                    Text(
                        text = "RM ${String.format("%.2f", card.balance)}",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Quick Reload Button (+RM10)
                Button(
                    onClick = onQuickReload,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White.copy(alpha = 0.2f),
                        contentColor = Color.White
                    ),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(28.dp)
                ) {
                    Text("+RM10 Reload", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun TransactionListItem(transaction: TransactionEntity) {
    val formatter = remember { SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault()) }
    val dateStr = remember(transaction.timestamp) { formatter.format(Date(transaction.timestamp)) }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(
                        when (transaction.type) {
                            "RELOAD" -> Color(0xFFE0F2FE)
                            "TRANSFER" -> Color(0xFFFEF3C7)
                            "TRANSIT_QR" -> Color(0xFFECFDF5)
                            else -> Color(0xFFF3E8FF)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (transaction.type) {
                        "RELOAD" -> Icons.Default.AddCircle
                        "TRANSFER" -> Icons.Default.Send
                        "TRANSIT_QR" -> Icons.Default.QrCode
                        else -> Icons.Default.DirectionsTransit
                    },
                    contentDescription = null,
                    tint = when (transaction.type) {
                        "RELOAD" -> Color(0xFF0369A1)
                        "TRANSFER" -> Color(0xFFB45309)
                        "TRANSIT_QR" -> Color(0xFF047857)
                        else -> Color(0xFF6B21A8)
                    },
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = transaction.title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    text = transaction.subtitle,
                    fontSize = 11.sp,
                    color = Color.Gray
                )
                Text(
                    text = dateStr,
                    fontSize = 10.sp,
                    color = Color.LightGray
                )
            }
        }

        Text(
            text = if (transaction.isExpense) "- RM ${String.format("%.2f", transaction.amount)}" 
                   else "+ RM ${String.format("%.2f", transaction.amount)}",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = if (transaction.isExpense) Color(0xFFEF4444) else TngBluePrimary
        )
    }
}

@Composable
fun QuickActionItem(
    icon: ImageVector,
    label: String,
    tag: String,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(4.dp)
            .testTag(tag)
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0x33FFFFFF))
                .padding(12.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = Color.White,
                modifier = Modifier.fillMaxSize()
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = label,
            color = Color.White,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun ServiceItem(
    icon: ImageVector,
    label: String,
    color: Color,
    bgColor: Color,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(bgColor),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = color,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 10.sp,
            fontWeight = FontWeight.Medium,
            color = Slate600
        )
    }
}
