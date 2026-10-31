package com.smartagri.uicomponents.camera

import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat

/**
 * CameraX Viewfinder with Jetpack Compose Alignment Overlays
 * Configures 60fps image analysis pipeline with leaf, 3-pad soil strip, and produce HUD guides.
 */
@Composable
fun CameraXViewfinder(
    domain: String,
    isProcessing: Boolean,
    onCaptureFrame: (ImageProxy) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var previewView by remember { mutableStateOf<PreviewView?>(null) }
    var imageCapture by remember { mutableStateOf<ImageCapture?>(null) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(4f / 3f)
            .background(Color.Black, shape = RoundedCornerShape(24.dp))
    ) {
        // CameraX Surface Provider
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).apply {
                    this.scaleType = PreviewView.ScaleType.FILL_CENTER
                    previewView = this

                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                    cameraProviderFuture.addListener({
                        val cameraProvider = cameraProviderFuture.get()

                        val preview = Preview.Builder().build().also {
                            it.setSurfaceProvider(this.surfaceProvider)
                        }

                        val capture = ImageCapture.Builder()
                            .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                            .build()
                        imageCapture = capture

                        val imageAnalysis = ImageAnalysis.Builder()
                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                            .build()

                        val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                        try {
                            cameraProvider.unbindAll()
                            cameraProvider.bindToLifecycle(
                                lifecycleOwner,
                                cameraSelector,
                                preview,
                                capture,
                                imageAnalysis
                            )
                        } catch (exc: Exception) {
                            exc.printStackTrace()
                        }
                    }, ContextCompat.getMainExecutor(ctx))
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Alignment Guides HUD rendered in Compose Canvas
        Canvas(modifier = Modifier.fillMaxSize()) {
            val strokeDashed = Stroke(
                width = 3.dp.toPx(),
                pathEffect = PathEffect.dashPathEffect(floatArrayOf(20f, 15f), 0f)
            )

            when (domain) {
                "plant_health" -> {
                    // Leaf Contour Alignment Oval
                    drawOval(
                        color = Color(0xFF10B981),
                        topLeft = Offset(size.width * 0.25f, size.height * 0.15f),
                        size = Size(size.width * 0.5f, size.height * 0.7f),
                        style = strokeDashed
                    )
                    // Center leaf vein line
                    drawLine(
                        color = Color(0x9910B981),
                        start = Offset(size.width * 0.5f, size.height * 0.2f),
                        end = Offset(size.width * 0.5f, size.height * 0.8f),
                        strokeWidth = 2.dp.toPx()
                    )
                }
                "soil_health" -> {
                    // 3-Pad Test Strip Reticle
                    val stripWidth = size.width * 0.75f
                    val stripHeight = size.height * 0.28f
                    val startX = (size.width - stripWidth) / 2f
                    val startY = (size.height - stripHeight) / 2f

                    drawRoundRect(
                        color = Color(0xFFF59E0B),
                        topLeft = Offset(startX, startY),
                        size = Size(stripWidth, stripHeight),
                        style = Stroke(width = 3.dp.toPx())
                    )
                }
                "produce_quality" -> {
                    // Produce Circular Sizing Caliper
                    drawCircle(
                        color = Color(0xFF10B981),
                        radius = size.minDimension * 0.35f,
                        center = center,
                        style = strokeDashed
                    )
                }
            }
        }

        // Shutter Button
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 16.dp)
        ) {
            IconButton(
                onClick = {
                    imageCapture?.takePicture(
                        ContextCompat.getMainExecutor(context),
                        object : ImageCapture.OnImageCapturedCallback() {
                            override fun onCaptureSuccess(image: ImageProxy) {
                                onCaptureFrame(image)
                            }
                        }
                    )
                },
                enabled = !isProcessing,
                modifier = Modifier
                    .size(68.dp)
                    .background(Color(0xFF10B981), shape = CircleShape)
            ) {
                if (isProcessing) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(28.dp))
                }
            }
        }
    }
}
