package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "wallet_state")
data class WalletStateEntity(
    @PrimaryKey val id: Int = 1,
    val balance: Double = 150.00, // Initial mock balance
    val goplusBalance: Double = 25.50, // GO+ earnings
    val rewardPoints: Int = 450
)

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val type: String, // "RELOAD", "TRANSFER", "TRANSIT_QR", "TICKET_BUY"
    val title: String,
    val subtitle: String,
    val amount: Double,
    val isExpense: Boolean,
    val timestamp: Long = System.currentTimeMillis(),
    val reference: String = "TXN-" + UUID.randomUUID().toString().substring(0, 8).uppercase(),
    val status: String = "SUCCESS"
)

@Entity(tableName = "tng_cards")
data class TngCardEntity(
    @PrimaryKey val cardNumber: String, // 10 digits
    val cardName: String,
    val balance: Double = 20.00,
    val isEnhanced: Boolean = true, // NFC-friendly Reload Card
    val lastUpdated: Long = System.currentTimeMillis()
)

@Entity(tableName = "transit_tickets")
data class TransitTicketEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val sourceStation: String,
    val destinationStation: String,
    val transportType: String, // "MRT", "LRT", "BUS"
    val fare: Double,
    val timestamp: Long = System.currentTimeMillis(),
    val status: String = "ACTIVE", // "ACTIVE", "USED", "EXPIRED"
    val qrCodePayload: String = "TNGTICKET-" + UUID.randomUUID().toString().substring(0, 12).uppercase()
)
