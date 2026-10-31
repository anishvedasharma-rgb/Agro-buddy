/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Data Processing Library - Core Types & Contracts
 * High-performance, offline-first image tensor processing and diagnosis types.
 */

export type InspectionDomain = 'plant_health' | 'soil_health' | 'produce_quality';

export type SeverityLevel = 'healthy' | 'mild' | 'moderate' | 'severe' | 'critical';

export interface ColorHistogram {
  redMean: number;
  greenMean: number;
  blueMean: number;
  hueMean: number;
  saturationMean: number;
  valueMean: number;
  chlorophyllIndex: number; // Green vs (Red + Blue) ratio
  necrosisRatio: number; // Brown / dark yellow lesion area %
}

export interface TensorProcessingResult<T> {
  data: T;
  inferenceTimeMs: number;
  modelName: string;
  hardwareDelegate: 'NPU' | 'GPU' | 'CPU_NEON';
  confidence: number;
  timestamp: number;
}

// 1. Pre-Harvest Plant Health Types
export interface LowCostRemedy {
  id: string;
  name: string;
  costTier: 'free' | 'very_low' | 'low';
  preparationTime: string;
  ingredients: string[];
  steps: string[];
  organicCertified: boolean;
  preventionTip: string;
  visualIcon: 'leaf' | 'droplet' | 'sun' | 'shield' | 'flame';
}

export interface PlantDiseaseDiagnosis {
  cropType: 'Tomato' | 'Potato' | 'Apple' | 'Maize' | 'Bell Pepper' | 'General Crop';
  diseaseName: string;
  scientificPathogen: string;
  pathogenType: 'fungal' | 'bacterial' | 'viral' | 'pest_damage' | 'nutrient_deficiency' | 'healthy';
  confidenceScore: number; // 0.0 to 1.0
  severity: SeverityLevel;
  affectedLeafAreaPercent: number;
  keyVisualSigns: string[];
  lowCostRemedies: LowCostRemedy[];
  urgencyDaysToAct: number;
}

// 2. Soil Health Check Types
export interface SoilNutrientStatus {
  nutrient: 'Nitrogen (N)' | 'Phosphorus (P)' | 'Potassium (K)' | 'Soil pH' | 'Organic Matter';
  level: 'Deficient' | 'Low' | 'Optimal' | 'High' | 'Excessive';
  estimatedPpmOrPh: string;
  colorMatchedHex: string;
  referenceHex: string;
  impactOnCrop: string;
  organicRemedy: string;
}

export interface SoilHealthReport {
  soilTypeEst: 'Clay Loam' | 'Sandy Loam' | 'Silt Loam' | 'Rich Humus' | 'Degraded Mineral';
  nutrients: SoilNutrientStatus[];
  overallFertilityScore: number; // 0 - 100
  recommendedImmediateAction: string;
  recommendedCompostBlend: string;
  testMethod: 'Visual Test Strip (3-Pad)' | 'Soil Slurry Optical' | 'Texture Colorimetric';
}

// 3. Post-Harvest Produce Ripeness & Quality Types
export type RipenessGrade = 'unripe' | 'firm_ripe' | 'prime_eating' | 'overripe' | 'spoiled';
export type SortingCategory = 'Grade A (Export / Premium)' | 'Grade B (Local Market Immediate)' | 'Grade C (Pulping / Processing)' | 'Discard / Compost';

export interface SpoilageDefect {
  defectType: 'Fungal Soft Rot' | 'Surface Bruising' | 'Anthracnose Spots' | 'Dehydration Wrinkles' | 'Insect Puncture' | 'None Detected';
  extentPercent: number;
  salvageable: boolean;
}

export interface ProduceQualityAssessment {
  produceItem: 'Tomato' | 'Banana' | 'Apple' | 'Mango' | 'Avocado' | 'Papaya' | 'Bell Pepper';
  ripenessGrade: RipenessGrade;
  ripenessScore: number; // 0 (raw green) to 100 (fully ripe/soft)
  firmnessEstimatedPsi: number;
  shelfLifeAmbientDays: number;
  shelfLifeChilledDays: number;
  sortingCategory: SortingCategory;
  spoilage: SpoilageDefect;
  vendorMarketAdvice: string;
  resalePriceRetentionPercent: number;
}
