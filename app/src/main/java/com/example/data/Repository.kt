package com.example.data

import kotlinx.coroutines.flow.Flow

class WalletRepository(private val db: WalletDatabase) {
    val walletState: Flow<WalletStateEntity?> = db.walletDao().getWalletStateFlow()
    val allTransactions: Flow<List<TransactionEntity>> = db.transactionDao().getAllTransactionsFlow()
    val allCards: Flow<List<TngCardEntity>> = db.tngCardDao().getAllCardsFlow()
    val allTickets: Flow<List<TransitTicketEntity>> = db.transitTicketDao().getAllTicketsFlow()

    suspend fun reloadWallet(amount: Double) {
        db.walletDao().adjustBalance(amount, isExpense = false)
        db.transactionDao().insertTransaction(
            TransactionEntity(
                type = "RELOAD",
                title = "Wallet Reload",
                subtitle = "eWallet Top Up",
                amount = amount,
                isExpense = false
            )
        )
    }

    suspend fun sendMoney(recipientName: String, phoneNumber: String, amount: Double) : Boolean {
        val current = db.walletDao().getWalletStateSync() ?: WalletStateEntity()
        if (current.balance < amount) return false

        db.walletDao().adjustBalance(amount, isExpense = true)
        db.transactionDao().insertTransaction(
            TransactionEntity(
                type = "TRANSFER",
                title = "Transfer to $recipientName",
                subtitle = "Transfer to $phoneNumber",
                amount = amount,
                isExpense = true
            )
        )
        return true
    }

    suspend fun receiveMoney(senderName: String, amount: Double) {
        db.walletDao().adjustBalance(amount, isExpense = false)
        db.transactionDao().insertTransaction(
            TransactionEntity(
                type = "TRANSFER",
                title = "Received from $senderName",
                subtitle = "Direct Peer Transfer",
                amount = amount,
                isExpense = false
            )
        )
    }

    suspend fun reloadPhysicalCard(cardNumber: String, amount: Double) : Boolean {
        val current = db.walletDao().getWalletStateSync() ?: WalletStateEntity()
        if (current.balance < amount) return false

        db.walletDao().adjustBalance(amount, isExpense = true)
        db.tngCardDao().reloadCard(cardNumber, amount)
        
        db.transactionDao().insertTransaction(
            TransactionEntity(
                type = "RELOAD",
                title = "TNG Card Reload",
                subtitle = "Card: $cardNumber",
                amount = amount,
                isExpense = true
            )
        )
        return true
    }

    suspend fun linkTngCard(cardNumber: String, cardName: String, balance: Double) {
        db.tngCardDao().insertCard(
            TngCardEntity(
                cardNumber = cardNumber,
                cardName = cardName,
                balance = balance,
                isEnhanced = true
            )
        )
    }

    suspend fun removeTngCard(cardNumber: String) {
        db.tngCardDao().deleteCard(cardNumber)
    }

    suspend fun buyTransitTicket(source: String, destination: String, type: String, fare: Double) : Boolean {
        val current = db.walletDao().getWalletStateSync() ?: WalletStateEntity()
        if (current.balance < fare) return false

        db.walletDao().adjustBalance(fare, isExpense = true)
        db.transitTicketDao().insertTicket(
            TransitTicketEntity(
                sourceStation = source,
                destinationStation = destination,
                transportType = type,
                fare = fare,
                status = "ACTIVE"
            )
        )
        db.transactionDao().insertTransaction(
            TransactionEntity(
                type = "TICKET_BUY",
                title = "$type Ticket Purchase",
                subtitle = "$source to $destination",
                amount = fare,
                isExpense = true
            )
        )
        return true
    }

    suspend fun useTransitQR(fare: Double) : Boolean {
        val current = db.walletDao().getWalletStateSync() ?: WalletStateEntity()
        if (current.balance < fare) return false

        db.walletDao().adjustBalance(fare, isExpense = true)
        db.transactionDao().insertTransaction(
            TransactionEntity(
                type = "TRANSIT_QR",
                title = "Transit Tap Fare",
                subtitle = "Gate QR Passage Auto-charge",
                amount = fare,
                isExpense = true
            )
        )
        return true
    }

    suspend fun markTicketUsed(ticketId: Int) {
        db.transitTicketDao().updateTicketStatus(ticketId, "USED")
    }

    suspend fun triggerGoPlusInvestment(amount: Double, isWithdrawal: Boolean) : Boolean {
        val current = db.walletDao().getWalletStateSync() ?: WalletStateEntity()
        if (!isWithdrawal && current.balance < amount) return false
        if (isWithdrawal && current.goplusBalance < amount) return false

        db.walletDao().adjustGoPlus(amount, isWithdrawal)
        db.transactionDao().insertTransaction(
            TransactionEntity(
                type = if (isWithdrawal) "RELOAD" else "TRANSFER",
                title = if (isWithdrawal) "Cash out from GO+" else "Transfer into GO+",
                subtitle = if (isWithdrawal) "Earn & Save Withdrawal" else "Auto-Yield Daily Savings",
                amount = amount,
                isExpense = !isWithdrawal
            )
        )
        return true
    }

    suspend fun addRewardsPoints(pts: Int) {
        db.walletDao().adjustPoints(pts)
    }
}
