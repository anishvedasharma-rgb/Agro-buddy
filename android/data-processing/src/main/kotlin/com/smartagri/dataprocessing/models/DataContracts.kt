package com.smartagri.dataprocessing.models

/**
 * Data Processing Library - Core Domain Models
 * Idiomatic Kotlin data classes for Plant Health, Soil N-P-K assays, and Produce Quality.
 */

enum class SeverityLevel {
    HEALTHY, MILD, MODERATE, SEVERE, CRITICAL
}

enum class RipenessGrade {
    UNRIPE, FIRM_RIPE, PRIME_EATING, OVERRIPE, SPOILED
}

enum class SortingCategory(val displayName: String) {
    GRADE_A("Grade A (Export / Premium)"),
    GRADE_B("Grade B (Local Market Immediate)"),
    GRADE_C("Grade C (Pulping / Processing)"),
    DISCARD("Discard / Compost")
}

data class ColorHistogram(
    val redMean: Float,
    val greenMean: Float,
    val blueMean: Float,
    val hueMean: Float,
    val saturationMean: Float,
    val valueMean: Float,
    val chlorophyllIndex: Float,
    val necrosisRatio: Float
)

data class LowCostRemedy(
    val id: String,
    val name: String,
    val costTier: String,
    val preparationTime: String,
    val ingredients: List<String>,
    val steps: List<String>,
    val organicCertified: Boolean = true,
    val preventionTip: String,
    val visualIcon: String
)

data class PlantDiseaseDiagnosis(
    val cropType: String,
    val diseaseName: String,
    val scientificPathogen: String,
    val pathogenType: String,
    val confidenceScore: Float,
    val severity: SeverityLevel,
    val affectedLeafAreaPercent: Float,
    val keyVisualSigns: List<String>,
    val lowCostRemedies: List<LowCostRemedy>,
    val urgencyDaysToAct: Int
)

data class SoilNutrientStatus(
    val nutrient: String,
    val level: String,
    val estimatedPpmOrPh: String,
    val colorMatchedHex: String,
    val impactOnCrop: String,
    val organicRemedy: String
)

data class SoilHealthReport(
    val soilTypeEst: String,
    val nutrients: List<SoilNutrientStatus>,
    val overallFertilityScore: Int,
    val recommendedImmediateAction: String,
    val recommendedCompostBlend: String,
    val testMethod: String = "Visual Test Strip (3-Pad)"
)

data class SpoilageDefect(
    val defectType: String,
    val extentPercent: Float,
    val salvageable: Boolean
)

data class ProduceQualityAssessment(
    val produceItem: String,
    val ripenessGrade: RipenessGrade,
    val ripenessScore: Int,
    val firmnessEstimatedPsi: Float,
    val shelfLifeAmbientDays: Int,
    val shelfLifeChilledDays: Int,
    val sortingCategory: SortingCategory,
    val spoilage: SpoilageDefect,
    val vendorMarketAdvice: String,
    val resalePriceRetentionPercent: Int
)

data class TensorInferenceResult<T>(
    val data: T,
    val inferenceTimeMs: Long,
    val modelName: String,
    val delegate: String = "NPU",
    val confidence: Float,
    val timestamp: Long = System.currentTimeMillis()
)
