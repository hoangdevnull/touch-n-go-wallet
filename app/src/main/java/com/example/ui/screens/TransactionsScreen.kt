package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.TransactionEntity
import com.example.ui.WalletViewModel
import com.example.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun TransactionsScreen(
    viewModel: WalletViewModel,
    modifier: Modifier = Modifier
) {
    val transactions by viewModel.transactions.collectAsState()
    var selectedFilter by remember { mutableStateOf("ALL") } // "ALL", "RELOADS", "TRANSFERS", "TRANSIT"
    var selectedTxnForReceipt by remember { mutableStateOf<TransactionEntity?>(null) }

    val filteredList = remember(transactions, selectedFilter) {
        when (selectedFilter) {
            "RELOADS" -> transactions.filter { it.type == "RELOAD" }
            "TRANSFERS" -> transactions.filter { it.type == "TRANSFER" }
            "TRANSIT" -> transactions.filter { it.type == "TRANSIT_QR" || it.type == "TICKET_BUY" }
            else -> transactions
        }
    }

    // Dynamic ledger aggregations based on selected filter list
    val totalExpense = remember(filteredList) {
        filteredList.filter { it.isExpense }.sumOf { it.amount }
    }
    val totalIncome = remember(filteredList) {
        filteredList.filter { !it.isExpense }.sumOf { it.amount }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(TngBackground)
    ) {
        // High-Density Modern Gradient Header Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(bottomStart = 32.dp, bottomEnd = 32.dp))
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            WalletHeaderGradientStart,
                            WalletHeaderGradientEnd
                        )
                    )
                )
                .padding(top = 18.dp, bottom = 24.dp, start = 20.dp, end = 20.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ReceiptLong,
                        contentDescription = "Passbook",
                        tint = TngYellowAccent,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = "eWallet Passbook",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                Text(
                    text = "Observe secure digital transactions, reloads history, and multi-modal transit rides below.",
                    fontSize = 11.sp,
                    color = Color(0xFFD0E1F9),
                    lineHeight = 16.sp
                )
            }
        }

        // Horizontal Category Selection Pills with layout safety
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            listOf(
                "ALL" to "All Logs",
                "RELOADS" to "Reloads",
                "TRANSFERS" to "Transfers",
                "TRANSIT" to "Transit rides"
            ).forEach { (id, label) ->
                val active = selectedFilter == id
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (active) TngBluePrimary else Color.White)
                        .border(
                            width = 1.dp,
                            color = if (active) TngBluePrimary else Slate100,
                            shape = RoundedCornerShape(14.dp)
                        )
                        .clickable { selectedFilter = id }
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = label,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (active) Color.White else Slate600
                    )
                }
            }
        }

        // Live Summary ledger stats block
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 16.dp, end = 16.dp, bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Received Stat Card
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, Color(0xFFDCFCE7)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFFDCFCE7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.TrendingUp,
                            contentDescription = "Received",
                            tint = Color(0xFF16A34A),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Received",
                            color = Color(0xFF15803D),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "RM ${String.format("%.2f", totalIncome)}",
                            color = Color(0xFF16A34A),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Spent Stat Card
            Card(
                modifier = Modifier.weight(1f),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, Color(0xFFFEE2E2)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFFFEE2E2)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.TrendingDown,
                            contentDescription = "Spent",
                            tint = Color(0xFFDC2626),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Spent",
                            color = Color(0xFFB91C1C),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "RM ${String.format("%.2f", totalExpense)}",
                            color = Color(0xFFDC2626),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Ledger list main body
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f)
                .testTag("transactions_scroll"),
            contentPadding = PaddingValues(bottom = 24.dp, start = 16.dp, end = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (filteredList.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 24.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(24.dp),
                        border = BorderStroke(1.dp, Slate100),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(CircleShape)
                                    .background(Slate50),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Inbox,
                                    contentDescription = null,
                                    tint = Slate500,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "No Ledger Entry Found",
                                fontSize = 14.sp,
                                color = Slate900,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Change filtering tabs to check other transaction records.",
                                fontSize = 12.sp,
                                color = Slate500,
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            } else {
                items(filteredList) { txn ->
                    TransactionHistoryRow(transaction = txn) {
                        selectedTxnForReceipt = txn
                    }
                }
            }
        }
    }

    // REALISTIC DIGITAL TRANSACTION TICKET RECEIPT DIALOG
    if (selectedTxnForReceipt != null) {
        val txn = selectedTxnForReceipt!!
        val formatter = remember { SimpleDateFormat("dd MMMM yyyy, hh:mm a", Locale.getDefault()) }
        val dateStr = remember(txn.timestamp) { formatter.format(Date(txn.timestamp)) }

        AlertDialog(
            onDismissRequest = { selectedTxnForReceipt = null },
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ReceiptLong,
                        contentDescription = null,
                        tint = TngBluePrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = "eWallet Receipt",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = Slate900
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Slate50),
                        shape = RoundedCornerShape(16.dp),
                        border = BorderStroke(1.dp, Slate100),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = txn.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Slate900
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = txn.subtitle,
                                color = Slate500,
                                fontSize = 11.sp
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = if (txn.isExpense) "- RM ${String.format("%.2f", txn.amount)}" 
                                       else "+ RM ${String.format("%.2f", txn.amount)}",
                                color = if (txn.isExpense) Color(0xFFDC2626) else Color(0xFF16A34A),
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFFD1FAE5))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "SECURELY COMPLETED",
                                    color = Color(0xFF065F46),
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Properties Receipt Column
                    Column(
                        modifier = Modifier.padding(horizontal = 4.dp)
                    ) {
                        ReceiptRowItem(label = "Payment Date", value = dateStr)
                        HorizontalDivider(color = Slate100, modifier = Modifier.padding(vertical = 4.dp))
                        ReceiptRowItem(label = "Reference ID", value = txn.reference)
                        HorizontalDivider(color = Slate100, modifier = Modifier.padding(vertical = 4.dp))
                        ReceiptRowItem(
                            label = "TNG Core Service",
                            value = when (txn.type) {
                                "RELOAD" -> "eWallet Direct Reload"
                                "TRANSFER" -> "eWallet Fund Send"
                                "TRANSIT_QR" -> "NFC Transit QR Gateway"
                                else -> "Transit Hub Fare"
                            }
                        )
                        HorizontalDivider(color = Slate100, modifier = Modifier.padding(vertical = 4.dp))
                        ReceiptRowItem(label = "System Verification", value = "TNGD Auth Core V2")
                    }

                    // Realistic validation barcode drawing
                    Canvas(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(40.dp)
                            .padding(top = 8.dp)
                    ) {
                        val stripes = 45
                        val gap = size.width / stripes
                        for (i in 0 until stripes) {
                            val strokeWidth = if (i % 4 == 0) 5.5f else if (i % 2 == 0) 3f else 1.2f
                            drawRect(
                                color = Slate900.copy(alpha = 0.85f),
                                topLeft = androidx.compose.ui.geometry.Offset(i * gap, 0f),
                                size = androidx.compose.ui.geometry.Size(strokeWidth, size.height)
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { selectedTxnForReceipt = null },
                    colors = ButtonDefaults.buttonColors(containerColor = TngBluePrimary),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "Dismiss Receipt",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = Color.White
                    )
                }
            }
        )
    }
}

@Composable
fun TransactionHistoryRow(
    transaction: TransactionEntity,
    onClick: () -> Unit
) {
    val formatter = remember { SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault()) }
    val dateStr = remember(transaction.timestamp) { formatter.format(Date(transaction.timestamp)) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .testTag("txn_row_${transaction.id}"),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(20.dp),
        border = BorderStroke(1.dp, Slate100),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
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
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            when (transaction.type) {
                                "RELOAD" -> Color(0xFFEFF6FF) // light blue
                                "TRANSFER" -> Color(0xFFFEF3C7) // light gold
                                "TRANSIT_QR" -> Color(0xFFECFDF5) // light green
                                else -> Color(0xFFFAF5FF) // light purple
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = when (transaction.type) {
                            "RELOAD" -> Icons.Default.AddCard
                            "TRANSFER" -> Icons.Default.Send
                            "TRANSIT_QR" -> Icons.Default.QrCode
                            else -> Icons.Default.DirectionsTransit
                        },
                        contentDescription = null,
                        tint = when (transaction.type) {
                            "RELOAD" -> Color(0xFF2563EB)
                            "TRANSFER" -> Color(0xFFD97706)
                            "TRANSIT_QR" -> Color(0xFF16A34A)
                            else -> Color(0xFF9333EA)
                        },
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = transaction.title,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = transaction.subtitle,
                        fontSize = 11.sp,
                        color = Slate500
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = dateStr,
                        fontSize = 9.sp,
                        color = Slate500,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = if (transaction.isExpense) "- RM ${String.format("%.2f", transaction.amount)}" 
                           else "+ RM ${String.format("%.2f", transaction.amount)}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = if (transaction.isExpense) Color(0xFFDC2626) else Color(0xFF16A34A)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Text(
                        text = "Receipt",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = TngBluePrimary
                    )
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = null,
                        tint = TngBluePrimary,
                        modifier = Modifier.size(10.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun ReceiptRowItem(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label, 
            color = Slate500, 
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
        Text(
            text = value, 
            fontWeight = FontWeight.SemiBold, 
            color = Slate900, 
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace
        )
    }
}
