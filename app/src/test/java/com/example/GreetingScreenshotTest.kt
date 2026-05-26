package com.example

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.screens.QuickActionItem
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.TngBluePrimary
import com.example.ui.theme.TngYellowAccent
import com.github.takahirom.roborazzi.RobolectricDeviceQualifiers
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(qualifiers = RobolectricDeviceQualifiers.Pixel8, sdk = [36])
class GreetingScreenshotTest {

  @get:Rule val composeTestRule = createComposeRule()

  @Test
  fun greeting_screenshot() {
    composeTestRule.setContent { 
      MyApplicationTheme { 
        Card(
          modifier = Modifier.padding(16.dp).fillMaxWidth(),
          colors = CardDefaults.cardColors(containerColor = TngBluePrimary)
        ) {
          Column(modifier = Modifier.padding(20.dp)) {
            Text("touch 'n go", color = TngYellowAccent, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("eWallet Secure Hub", color = Color.White, fontSize = 11.sp)
            Spacer(modifier = Modifier.height(16.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceAround
            ) {
              QuickActionItem(icon = Icons.Default.QrCodeScanner, label = "Scanner", tag = "test_s") {}
              QuickActionItem(icon = Icons.Default.AddCircle, label = "Reload", tag = "test_r") {}
              QuickActionItem(icon = Icons.Default.Send, label = "Transfer", tag = "test_t") {}
            }
          }
        }
      } 
    }

    composeTestRule.onRoot().captureRoboImage(filePath = "src/test/screenshots/greeting.png")
  }
}
