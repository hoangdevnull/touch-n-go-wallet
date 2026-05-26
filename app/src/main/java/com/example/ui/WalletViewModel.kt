package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.TngCardEntity
import com.example.data.TransactionEntity
import com.example.data.TransitTicketEntity
import com.example.data.WalletDatabase
import com.example.data.WalletRepository
import com.example.data.WalletStateEntity
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class WalletViewModel(application: Application) : AndroidViewModel(application) {
    private val db = WalletDatabase.getDatabase(application)
    private val repository = WalletRepository(db)

    // Reactive State Flows
    val walletState: StateFlow<WalletStateEntity?> = repository.walletState
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = WalletStateEntity()
        )

    val transactions: StateFlow<List<TransactionEntity>> = repository.allTransactions
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val cards: StateFlow<List<TngCardEntity>> = repository.allCards
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val tickets: StateFlow<List<TransitTicketEntity>> = repository.allTickets
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // UI Feedback events
    private val _uiEvents = MutableSharedFlow<String>()
    val uiEvents: SharedFlow<String> = _uiEvents

    fun reloadWallet(amount: Double) {
        viewModelScope.launch {
            repository.reloadWallet(amount)
            _uiEvents.emit("Reloaded RM ${String.format("%.2f", amount)} successfully!")
        }
    }

    fun sendMoney(name: String, phone: String, amount: Double, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            if (name.isBlank() || phone.isBlank() || amount <= 0) {
                _uiEvents.emit("Invalid transfer entries")
                onResult(false)
                return@launch
            }
            val success = repository.sendMoney(name, phone, amount)
            if (success) {
                _uiEvents.emit("Sent RM ${String.format("%.2f", amount)} to $name successfully!")
            } else {
                _uiEvents.emit("Request failed. Insufficient wallet balance.")
            }
            onResult(success)
        }
    }

    fun receiveMoney(sender: String, amount: Double) {
        viewModelScope.launch {
            if (sender.isBlank() || amount <= 0) {
                _uiEvents.emit("Invalid receive parameters")
                return@launch
            }
            repository.receiveMoney(sender, amount)
            _uiEvents.emit("Received RM ${String.format("%.2f", amount)} from $sender!")
        }
    }

    fun reloadPhysicalCard(cardNumber: String, amount: Double, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            if (amount <= 0) {
                _uiEvents.emit("Please enter a valid amount")
                onResult(false)
                return@launch
            }
            val success = repository.reloadPhysicalCard(cardNumber, amount)
            if (success) {
                _uiEvents.emit("TNG Card $cardNumber reloaded with RM ${String.format("%.2f", amount)}!")
            } else {
                _uiEvents.emit("Reload failed. Insufficient wallet balance.")
            }
            onResult(success)
        }
    }

    fun linkTngCard(cardNumber: String, cardName: String, balance: Double) {
        viewModelScope.launch {
            if (cardNumber.length < 5 || cardName.isBlank()) {
                _uiEvents.emit("Please enter a valid card number and alias")
                return@launch
            }
            repository.linkTngCard(cardNumber, cardName, balance)
            _uiEvents.emit("Linked TNG Card '$cardName' successfully!")
        }
    }

    fun removeTngCard(cardNumber: String) {
        viewModelScope.launch {
            repository.removeTngCard(cardNumber)
            _uiEvents.emit("Removed linked TNG Card.")
        }
    }

    fun buyTransitTicket(source: String, destination: String, type: String, fare: Double, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            if (source == destination) {
                _uiEvents.emit("Source and destination cannot be identical")
                onResult(false)
                return@launch
            }
            val success = repository.buyTransitTicket(source, destination, type, fare)
            if (success) {
                _uiEvents.emit("Successfully purchased $type Ticket to $destination!")
            } else {
                _uiEvents.emit("Purchase failed. Insufficient wallet balance.")
            }
            onResult(success)
        }
    }

    fun useTransitQR(fare: Double, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            val success = repository.useTransitQR(fare)
            if (success) {
                _uiEvents.emit("Transit QR gate passage approved! RM ${String.format("%.2f", fare)} charged.")
            } else {
                _uiEvents.emit("Passage entry denied! Please top up your wallet.")
            }
            onResult(success)
        }
    }

    fun markTicketUsed(id: Int) {
        viewModelScope.launch {
            repository.markTicketUsed(id)
            _uiEvents.emit("Ticket validated and used successfully!")
        }
    }

    fun triggerGoPlusInvestment(amount: Double, isWithdrawal: Boolean, onResult: (Boolean) -> Unit) {
        viewModelScope.launch {
            if (amount <= 0) {
                _uiEvents.emit("Please enter a valid amount")
                onResult(false)
                return@launch
            }
            val success = repository.triggerGoPlusInvestment(amount, isWithdrawal)
            if (success) {
                val operation = if (isWithdrawal) "withdrawn from GO+" else "invested into GO+"
                _uiEvents.emit("RM ${String.format("%.2f", amount)} successfully $operation!")
            } else {
                _uiEvents.emit("Operation failed. Insufficient funds.")
            }
            onResult(success)
        }
    }

    fun showEventMessage(msg: String) {
        viewModelScope.launch {
            _uiEvents.emit(msg)
        }
    }

    fun addRewardsPoints(pts: Int) {
        viewModelScope.launch {
            repository.addRewardsPoints(pts)
            _uiEvents.emit("Earned +$pts GO Rewards points!")
        }
    }

    // Factory Class
    class Factory(private val application: Application) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(WalletViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return WalletViewModel(application) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
