package com.example.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        WalletStateEntity::class,
        TransactionEntity::class,
        TngCardEntity::class,
        TransitTicketEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class WalletDatabase : RoomDatabase() {
    abstract fun walletDao(): WalletDao
    abstract fun transactionDao(): TransactionDao
    abstract fun tngCardDao(): TngCardDao
    abstract fun transitTicketDao(): TransitTicketDao

    companion object {
        @Volatile
        private var INSTANCE: WalletDatabase? = null

        fun getDatabase(context: Context): WalletDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    WalletDatabase::class.java,
                    "tng_wallet_database"
                )
                .addCallback(DatabaseCallback())
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        populateDatabase(database)
                    }
                }
            }

            suspend fun populateDatabase(db: WalletDatabase) {
                // 1. Initialise main wallet
                db.walletDao().updateWallet(
                    WalletStateEntity(
                        id = 1,
                        balance = 180.50,
                        goplusBalance = 42.10,
                        rewardPoints = 640
                    )
                )

                // 2. Pre-add physical TNG cards
                db.tngCardDao().insertCard(
                    TngCardEntity(
                        cardNumber = "1098485295",
                        cardName = "My Main NFC Card",
                        balance = 32.50,
                        isEnhanced = true
                    )
                )
                db.tngCardDao().insertCard(
                    TngCardEntity(
                        cardNumber = "0539128574",
                        cardName = "Partner's Card",
                        balance = 12.00,
                        isEnhanced = false
                    )
                )

                // 3. Pre-add transactions
                val now = System.currentTimeMillis()
                db.transactionDao().insertTransaction(
                    TransactionEntity(
                        type = "RELOAD",
                        title = "Wallet Reload",
                        subtitle = "Via Bank Transfer",
                        amount = 50.00,
                        isExpense = false,
                        timestamp = now - 3600000 * 2 // 2 hours ago
                    )
                )
                db.transactionDao().insertTransaction(
                    TransactionEntity(
                        type = "TRANSFER",
                        title = "Sent to Ahmad",
                        subtitle = "Transfer to 012-3456789",
                        amount = 15.00,
                        isExpense = true,
                        timestamp = now - 3600000 * 5 // 5 hours ago
                    )
                )
                db.transactionDao().insertTransaction(
                    TransactionEntity(
                        type = "TRANSIT_QR",
                        title = "LRT Passage Fare",
                        subtitle = "Gate Transit - KL Sentral",
                        amount = 3.20,
                        isExpense = true,
                        timestamp = now - 3600000 * 24 // 1 day ago
                    )
                )
                db.transactionDao().insertTransaction(
                    TransactionEntity(
                        type = "TICKET_BUY",
                        title = "MRT Journey Ticket",
                        subtitle = "Muzium Negara to KLCC",
                        amount = 4.40,
                        isExpense = true,
                        timestamp = now - 3600000 * 30 // 30 hours ago
                    )
                )

                // 4. Pre-add a transit ticket
                db.transitTicketDao().insertTicket(
                    TransitTicketEntity(
                        sourceStation = "KL Sentral",
                        destinationStation = "KLCC",
                        transportType = "LRT",
                        fare = 2.40,
                        status = "ACTIVE"
                    )
                )
            }
        }
    }
}
