package com.smartagri.uicomponents.cards

import android.speech.tts.TextToSpeech
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartagri.dataprocessing.models.PlantDiseaseDiagnosis
import com.smartagri.dataprocessing.models.TensorInferenceResult
import com.smartagri.uicomponents.badges.BadgeTone
import com.smartagri.uicomponents.badges.StatusBadge
import java.util.*

/**
 * Jetpack Compose Visual Result Card
 * Displays low-text diagnosis with audio voice speech synthesis for multi-literacy farmers.
 */
@Composable
fun PlantDiagnosisCard(
    result: TensorInferenceResult<PlantDiseaseDiagnosis>,
    onSaveLog: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var tts by remember { mutableStateOf<TextToSpeech?>(null) }
    var isSpeaking by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        val speech = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                speech?.language = Locale.getDefault()
            }
        }
        tts = speech
        onDispose {
            speech.stop()
            speech.shutdown()
        }
    }

    val diagnosis = result.data

    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1917)),
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF292524), RoundedCornerShape(24.dp))
            .padding(16.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            // Header: Status Badge & TTS Speech Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                StatusBadge(
                    label = diagnosis.diseaseName,
                    tone = if (diagnosis.severity.name == "HEALTHY") BadgeTone.EMERALD else BadgeTone.AMBER,
                    sublabel = "${result.inferenceTimeMs}ms on ${result.delegate}"
                )

                IconButton(
                    onClick = {
                        if (isSpeaking) {
                            tts?.stop()
                            isSpeaking = false
                        } else {
                            val text = "Diagnosis: ${diagnosis.diseaseName}. Pathogen: ${diagnosis.scientificPathogen}. Recommended organic remedy: ${diagnosis.lowCostRemedies.firstOrNull()?.name}"
                            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "agri_tts")
                            isSpeaking = true
                        }
                    },
                    modifier = Modifier
                        .background(Color(0xFF292524), RoundedCornerShape(12.dp))
                ) {
                    Icon(
                        imageVector = if (isSpeaking) Icons.Default.Stop else Icons.Default.PlayArrow,
                        contentDescription = "Read out loud",
                        tint = Color(0xFF10B981)
                    )
                }
            }

            // Pathogen & Severity Info
            Column {
                Text(
                    text = diagnosis.diseaseName,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "${diagnosis.scientificPathogen} · ${(diagnosis.confidenceScore * 100).toInt()}% confidence",
                    fontSize = 12.sp,
                    color = Color(0xFFA8A29E)
                )
            }

            // Low-Cost Organic Remedy Steps
            diagnosis.lowCostRemedies.firstOrNull()?.let { remedy ->
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0C0A09)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "Low-Cost Organic Remedy: ${remedy.name}",
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF34D399),
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        remedy.steps.forEachIndexed { i, step ->
                            Text(
                                text = "${i + 1}. $step",
                                color = Color(0xFFE7E5E4),
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }

            // Action Button
            Button(
                onClick = onSaveLog,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Save to Offline Field Log", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}
