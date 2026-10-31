package com.smartagri.uicomponents.badges

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class BadgeTone(val bg: Color, val border: Color, val text: Color) {
    EMERALD(Color(0x2610B981), Color(0x6610B981), Color(0xFF34D399)),
    AMBER(Color(0x26F59E0B), Color(0x66F59E0B), Color(0xFFFBBF24)),
    ROSE(Color(0x26EF4444), Color(0x66EF4444), Color(0xFFF87171)),
    NEUTRAL(Color(0xFF292524), Color(0xFF44403C), Color(0xFFD6D3D1))
}

/**
 * Jetpack Compose Color-Coded Status Badge
 * Accessible high-contrast visual badge designed for outdoor visibility.
 */
@Composable
fun StatusBadge(
    label: String,
    tone: BadgeTone,
    modifier: Modifier = Modifier,
    sublabel: String? = null
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .background(color = tone.bg, shape = RoundedCornerShape(12.dp))
            .border(width = 1.dp, color = tone.border, shape = RoundedCornerShape(12.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Column {
            Text(
                text = label,
                color = tone.text,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
            if (sublabel != null) {
                Text(
                    text = sublabel,
                    color = tone.text.copy(alpha = 0.8f),
                    fontSize = 10.sp
                )
            }
        }
    }
}
