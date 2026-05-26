package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.WalletViewModel
import com.example.ui.theme.TngBluePrimary
import com.example.ui.theme.TngYellowAccent

@Composable
fun PayScanScreen(
    viewModel: WalletViewModel,
    modifier: Modifier = Modifier
) {
    var isReceiveTab by remember { mutableStateOf(false) } // false = "Scan & Pay", true = "Receive Money"

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0C131F)) // Elegant pitch dark blue dashboard background
    ) {
        // Toggle Switcher between Scan Pay / Receive QR
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0x1AFFFFFF)),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .padding(4.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (!isReceiveTab) TngBluePrimary else Color.Transparent)
                    .clickable { isReceiveTab = false }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.QrCodeScanner,
                        contentDescription = null,
                        tint = if (!isReceiveTab) Color.White else Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Merchant Pay",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (!isReceiveTab) Color.White else Color.Gray
                    )
                }
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .padding(4.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (isReceiveTab) TngBluePrimary else Color.Transparent)
                    .clickable { isReceiveTab = true }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.QrCode,
                        contentDescription = null,
                        tint = if (isReceiveTab) Color.White else Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Receive Money",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isReceiveTab) Color.White else Color.Gray
                    )
                }
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f),
            horizontalAlignment = Alignment.CenterHorizontally,
            contentPadding = PaddingValues(bottom = 24.dp),
            verticalArrangement = Arrangement.Center
        ) {
            if (!isReceiveTab) {
                // MERCHANT SCANNER MOCK
                item {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "Scan Merchant QR / Show Barcode",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )

                        // 1. Merchant visual payment barcode
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(130.dp)
                                .padding(horizontal = 16.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(14.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                // Draw high fidelity stripes barcode
                                Canvas(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(55.dp)
                                ) {
                                    val count = 45
                                    val stripeSpacing = size.width / count
                                    for (i in 0 until count) {
                                        val w = if (i % 5 == 0) 8f else if (i % 2 == 0) 3.5f else 1.5f
                                        drawRect(
                                            color = Color.Black,
                                            topLeft = androidx.compose.ui.geometry.Offset(i * stripeSpacing, 0f),
                                            size = androidx.compose.ui.geometry.Size(w, size.height)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(
                                    text = "9820-1094-8254-8162",
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 13.sp,
                                    color = Color.Black,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // 2. Camera simulated focus overlay
                        Box(
                            modifier = Modifier
                                .size(230.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0x0DFFFFFF)),
                            contentAlignment = Alignment.Center
                        ) {
                            // Focus frame corner ticks
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                val s = 30f
                                val stroke = 6f
                                // Top-Left
                                drawLine(Color.White, androidx.compose.ui.geometry.Offset(20f, 20f), androidx.compose.ui.geometry.Offset(20f + s, 20f), stroke)
                                drawLine(Color.White, androidx.compose.ui.geometry.Offset(20f, 20f), androidx.compose.ui.geometry.Offset(20f, 20f + s), stroke)
                                // Top-Right
                                drawLine(Color.White, androidx.compose.ui.geometry.Offset(size.width - 20f, 20f), androidx.compose.ui.geometry.Offset(size.width - 20f - s, 20f), stroke)
                                drawLine(Color.White, androidx.compose.ui.geometry.Offset(size.width - 20f, 20f), androidx.compose.ui.geometry.Offset(size.width - 20f, 20f + s), stroke)
                                // Bottom-Left
                                drawLine(Color.White, androidx.compose.ui.geometry.Offset(20f, size.height - 20f), androidx.compose.ui.geometry.Offset(20f + s, size.height - 20f), stroke)
                                drawLine(Color.White, androidx.compose.ui.geometry.Offset(20f, size.height - 20f), androidx.compose.ui.geometry.Offset(20f, size.height - 20f - s), stroke)
                                // Bottom-Right
                                drawLine(Color.White, androidx.compose.ui.geometry.Offset(size.width - 20f, size.height - 20f), androidx.compose.ui.geometry.Offset(size.width - 20f - s, size.height - 20f), stroke)
                                drawLine(Color.White, androidx.compose.ui.geometry.Offset(size.width - 20f, size.height - 20f), androidx.compose.ui.geometry.Offset(size.width - 20f, size.height - 20f - s), stroke)
                            }

                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = Icons.Default.QrCodeScanner,
                                    contentDescription = null,
                                    tint = TngYellowAccent,
                                    modifier = Modifier.size(60.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "ALIGN QR CODE",
                                    color = Color.LightGray,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        // Form for simulate paying a merchant
                        SimulateMerchantPaymentBlock(viewModel)
                    }
                }
            } else {
                // RECEIVE PORTAL (Receive simulated money from another person)
                item {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "Your eWallet Personal QR Code",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )

                        // Visual QR card
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .size(220.dp)
                                .padding(8.dp)
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Canvas(modifier = Modifier.size(120.dp)) {
                                        drawRect(
                                            color = Color.Black,
                                            style = Stroke(width = 4f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(15f, 15f), 0f))
                                        )
                                        // QR Corner squares
                                        drawRect(Color.Black, topLeft = androidx.compose.ui.geometry.Offset(10f, 10f), size = androidx.compose.ui.geometry.Size(35f, 35f))
                                        drawRect(Color.Black, topLeft = androidx.compose.ui.geometry.Offset(75f, 10f), size = androidx.compose.ui.geometry.Size(35f, 35f))
                                        drawRect(Color.Black, topLeft = androidx.compose.ui.geometry.Offset(10f, 75f), size = androidx.compose.ui.geometry.Size(35f, 35f))
                                        // Center core dot
                                        drawRect(Color.Black, topLeft = androidx.compose.ui.geometry.Offset(50f, 50f), size = androidx.compose.ui.geometry.Size(20f, 20f))
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text(
                                        text = "SCAN TO PAY USER",
                                        color = TngBluePrimary,
                                        fontWeight = FontWeight.Black,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }

                        // Simulator block for payments received
                        SimulateReceivePaymentBlock(viewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun SimulateMerchantPaymentBlock(viewModel: WalletViewModel) {
    var merchantName by remember { mutableStateOf("") }
    var payAmountStr by remember { mutableStateOf("") }

    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0x1F293B59)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "Simulate Merchant Payment scan",
                color = TngYellowAccent,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp
            )
            Text(
                text = "Simulate scanning a grocery shop or transit provider barcode to purchase goods.",
                fontSize = 11.sp,
                color = Color.LightGray
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = merchantName,
                    onValueChange = { merchantName = it },
                    label = { Text("Merchant / Shop Name", color = Color.White) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = TngBluePrimary,
                        unfocusedBorderColor = Color.Gray
                    ),
                    modifier = Modifier
                        .weight(1.2f)
                        .testTag("merchant_pay_name")
                )
                OutlinedTextField(
                    value = payAmountStr,
                    onValueChange = { payAmountStr = it },
                    label = { Text("Amount (RM)", color = Color.White) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = TngBluePrimary,
                        unfocusedBorderColor = Color.Gray
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("merchant_pay_amount")
                )
            }

            Button(
                onClick = {
                    val amt = payAmountStr.toDoubleOrNull() ?: 0.0
                    if (merchantName.isNotBlank() && amt > 0.0) {
                        viewModel.sendMoney(merchantName, "Merchant scanner", amt) { success ->
                            if (success) {
                                merchantName = ""
                                payAmountStr = ""
                            }
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = TngYellowAccent, contentColor = Color.Black),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("merchant_pay_submit_btn")
            ) {
                Text("Scan and Deduct Wallet Cash", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun SimulateReceivePaymentBlock(viewModel: WalletViewModel) {
    var senderName by remember { mutableStateOf("") }
    var receiveAmountStr by remember { mutableStateOf("") }

    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0x1F293B59)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "Simulate incoming peer transfer",
                color = TngYellowAccent,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp
            )
            Text(
                text = "Let a friend scan your personal QR code shown above to transfer funds into your wallet.",
                fontSize = 11.sp,
                color = Color.LightGray
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = senderName,
                    onValueChange = { senderName = it },
                    label = { Text("Friend's Name", color = Color.White) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = TngBluePrimary,
                        unfocusedBorderColor = Color.Gray
                    ),
                    modifier = Modifier
                        .weight(1.2f)
                        .testTag("incoming_pay_sender")
                )
                OutlinedTextField(
                    value = receiveAmountStr,
                    onValueChange = { receiveAmountStr = it },
                    label = { Text("Amount (RM)", color = Color.White) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = TngBluePrimary,
                        unfocusedBorderColor = Color.Gray
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("incoming_pay_amount")
                )
            }

            Button(
                onClick = {
                    val amt = receiveAmountStr.toDoubleOrNull() ?: 0.0
                    if (senderName.isNotBlank() && amt > 0.0) {
                        viewModel.receiveMoney(senderName, amt)
                        senderName = ""
                        receiveAmountStr = ""
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = TngBluePrimary, contentColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("incoming_pay_submit_btn")
            ) {
                Text("Process Incoming simulated Cash", fontWeight = FontWeight.Bold)
            }
        }
    }
}
