package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.example.ui.WalletViewModel
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.PayScanScreen
import com.example.ui.screens.TransactionsScreen
import com.example.ui.screens.TransportScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.TngBluePrimary
import kotlinx.coroutines.flow.collectLatest

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                // Initialize ViewModel with factory
                val viewModel: WalletViewModel by viewModels {
                    WalletViewModel.Factory(application)
                }

                TngAppScaffold(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun TngAppScaffold(viewModel: WalletViewModel) {
    var selectedTab by remember { mutableStateOf(0) }
    val snackbarHostState = remember { SnackbarHostState() }
    val context = LocalContext.current

    // Listen to UI events from the viewmodel to show Snackbars/Toasts
    LaunchedEffect(viewModel.uiEvents) {
        viewModel.uiEvents.collectLatest { message ->
            snackbarHostState.showSnackbar(
                message = message,
                duration = SnackbarDuration.Short
            )
        }
    }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("app_main_scaffold"),
        snackbarHost = {
            SnackbarHost(
                hostState = snackbarHostState,
                modifier = Modifier.padding(bottom = 80.dp) // Lift snackbar above navigation bar
            )
        },
        bottomBar = {
            NavigationBar(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding() // Properly handle android system bottom navigation pill buffer
                    .testTag("app_bottom_nav"),
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 0) Icons.Filled.Home else Icons.Outlined.Home,
                            contentDescription = "Home"
                        )
                    },
                    label = { Text("eWallet") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TngBluePrimary,
                        selectedTextColor = TngBluePrimary,
                        indicatorColor = TngBluePrimary.copy(alpha = 0.1f)
                    ),
                    modifier = Modifier.testTag("nav_home_tab")
                )

                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 1) Icons.Filled.DirectionsTransit else Icons.Outlined.DirectionsTransit,
                            contentDescription = "Transport"
                        )
                    },
                    label = { Text("Transit") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TngBluePrimary,
                        selectedTextColor = TngBluePrimary,
                        indicatorColor = TngBluePrimary.copy(alpha = 0.1f)
                    ),
                    modifier = Modifier.testTag("nav_transport_tab")
                )

                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 2) Icons.Filled.QrCodeScanner else Icons.Outlined.QrCodeScanner,
                            contentDescription = "Pay & Scan"
                        )
                    },
                    label = { Text("Scan Pay") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TngBluePrimary,
                        selectedTextColor = TngBluePrimary,
                        indicatorColor = TngBluePrimary.copy(alpha = 0.1f)
                    ),
                    modifier = Modifier.testTag("nav_payscan_tab")
                )

                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 3) Icons.Filled.History else Icons.Outlined.History,
                            contentDescription = "History"
                        )
                    },
                    label = { Text("History") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TngBluePrimary,
                        selectedTextColor = TngBluePrimary,
                        indicatorColor = TngBluePrimary.copy(alpha = 0.1f)
                    ),
                    modifier = Modifier.testTag("nav_history_tab")
                )
            }
        },
        contentWindowInsets = WindowInsets.safeDrawing // Prevent camera notches and top cuts clipping layout views
    ) { innerPadding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            when (selectedTab) {
                0 -> DashboardScreen(
                    viewModel = viewModel,
                    onNavigateToTab = { tab ->
                        selectedTab = tab
                    }
                )
                1 -> TransportScreen(viewModel = viewModel)
                2 -> PayScanScreen(viewModel = viewModel)
                3 -> TransactionsScreen(viewModel = viewModel)
            }
        }
    }
}

