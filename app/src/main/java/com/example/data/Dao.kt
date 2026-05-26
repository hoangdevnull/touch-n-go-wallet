package com.example.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface WalletDao {
    @Query("SELECT * FROM wallet_state WHERE id = 1 LIMIT 1")
    fun getWalletStateFlow(): Flow<WalletStateEntity?>

    @Query("SELECT * FROM wallet_state WHERE id = 1 LIMIT 1")
    suspend fun getWalletStateSync(): WalletStateEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun updateWallet(wallet: WalletStateEntity)

    @Transaction
    suspend fun adjustBalance(amount: Double, isExpense: Boolean) {
        val current = getWalletStateSync() ?: WalletStateEntity()
        val nextBalance = if (isExpense) current.balance - amount else current.balance + amount
        updateWallet(current.copy(balance = nextBalance))
    }

    @Transaction
    suspend fun adjustGoPlus(amount: Double, isWithdrawal: Boolean) {
        val current = getWalletStateSync() ?: WalletStateEntity()
        val nextGoPlus = if (isWithdrawal) current.goplusBalance - amount else current.goplusBalance + amount
        val nextBalance = if (isWithdrawal) current.balance + amount else current.balance - amount
        updateWallet(current.copy(balance = nextBalance, goplusBalance = nextGoPlus))
    }

    @Transaction
    suspend fun adjustPoints(pts: Int) {
        val current = getWalletStateSync() ?: WalletStateEntity()
        updateWallet(current.copy(rewardPoints = current.rewardPoints + pts))
    }
}

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY timestamp DESC")
    fun getAllTransactionsFlow(): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity)
}

@Dao
interface TngCardDao {
    @Query("SELECT * FROM tng_cards ORDER BY cardNumber ASC")
    fun getAllCardsFlow(): Flow<List<TngCardEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCard(card: TngCardEntity)

    @Query("DELETE FROM tng_cards WHERE cardNumber = :cardNumber")
    suspend fun deleteCard(cardNumber: String)

    @Query("UPDATE tng_cards SET balance = balance + :amount WHERE cardNumber = :cardNumber")
    suspend fun reloadCard(cardNumber: String, amount: Double)
}

@Dao
interface TransitTicketDao {
    @Query("SELECT * FROM transit_tickets ORDER BY timestamp DESC")
    fun getAllTicketsFlow(): Flow<List<TransitTicketEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTicket(ticket: TransitTicketEntity)

    @Query("UPDATE transit_tickets SET status = :status WHERE id = :id")
    suspend fun updateTicketStatus(id: Int, status: String)
}
