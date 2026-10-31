package com.smartagri.dataprocessing

import com.smartagri.dataprocessing.classifier.PlantHealthClassifier
import com.smartagri.dataprocessing.models.ColorHistogram
import com.smartagri.dataprocessing.models.SeverityLevel
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test

class PlantClassifierTest {

    private val classifier = PlantHealthClassifier()

    @Test
    fun testHealthyFoliageDetection() = runBlocking {
        val healthyHistogram = ColorHistogram(
            redMean = 40f,
            greenMean = 140f,
            blueMean = 35f,
            hueMean = 115f,
            saturationMean = 0.7f,
            valueMean = 0.55f,
            chlorophyllIndex = 0.52f,
            necrosisRatio = 1.2f
        )

        val result = classifier.diagnose("Tomato", healthyHistogram)
        assertEquals(SeverityLevel.HEALTHY, result.data.severity)
        assertTrue(result.data.confidenceScore > 0.85f)
        assertEquals("Healthy Vigorous Foliage", result.data.diseaseName)
    }

    @Test
    fun testLateBlightSevereDetection() = runBlocking {
        val diseasedHistogram = ColorHistogram(
            redMean = 120f,
            greenMean = 60f,
            blueMean = 50f,
            hueMean = 40f,
            saturationMean = 0.5f,
            valueMean = 0.35f,
            chlorophyllIndex = 0.25f,
            necrosisRatio = 22.5f
        )

        val result = classifier.diagnose("Tomato", diseasedHistogram)
        assertEquals(SeverityLevel.SEVERE, result.data.severity)
        assertEquals("Tomato Late Blight", result.data.diseaseName)
        assertTrue(result.data.lowCostRemedies.isNotEmpty())
    }
}
