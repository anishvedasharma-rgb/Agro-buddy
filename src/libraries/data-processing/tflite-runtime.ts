/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local TensorFlow Lite Runtime Simulator
 * Simulates local on-device quantized INT8 neural network inference with hardware delegate acceleration.
 */

import { extractImageTensorMetrics } from './image-tensor.ts';
import { classifyPlantHealth } from './plant-health-classifier.ts';
import { analyzeSoilHealth } from './soil-health-analyzer.ts';
import { assessProduceQuality } from './produce-ripeness-grader.ts';
import { 
  InspectionDomain, 
  TensorProcessingResult, 
  PlantDiseaseDiagnosis, 
  SoilHealthReport, 
  ProduceQualityAssessment 
} from './types.ts';

export interface TFLiteModelMetadata {
  id: string;
  name: string;
  version: string;
  sizeKb: number;
  inputResolution: [number, number, number];
  quantization: 'INT8' | 'FP16';
  delegate: 'NPU' | 'GPU' | 'CPU_NEON';
}

export const EMBEDDED_MODELS: Record<InspectionDomain, TFLiteModelMetadata> = {
  plant_health: {
    id: 'mobilenetv3_plant_pathology_int8',
    name: 'MobileNetV3-AgriPathology-INT8',
    version: '2.4.1',
    sizeKb: 3420,
    inputResolution: [224, 224, 3],
    quantization: 'INT8',
    delegate: 'NPU'
  },
  soil_health: {
    id: 'soil_npk_strip_regressor_int8',
    name: 'SoilColorimeter-NPK-INT8',
    version: '1.8.0',
    sizeKb: 1850,
    inputResolution: [192, 192, 3],
    quantization: 'INT8',
    delegate: 'NPU'
  },
  produce_quality: {
    id: 'efficientnet_produce_grading_int8',
    name: 'EfficientNet-ProduceRipeness-INT8',
    version: '3.1.2',
    sizeKb: 4120,
    inputResolution: [256, 256, 3],
    quantization: 'INT8',
    delegate: 'NPU'
  }
};

/**
 * Executes on-device local model inference
 */
export async function runLocalTFLiteInference(
  domain: InspectionDomain,
  imageData: ImageData,
  itemHint?: string,
  padColors?: { nHex?: string; pHex?: string; kHex?: string }
): Promise<TensorProcessingResult<PlantDiseaseDiagnosis | SoilHealthReport | ProduceQualityAssessment>> {
  const model = EMBEDDED_MODELS[domain];
  const startTime = performance.now();

  // 1. Image Tensor Normalization & Feature Extraction
  const histogram = extractImageTensorMetrics(imageData);

  // 2. Simulated Quantized Neural Network Forward Pass
  // Real hardware NPU inference typically takes 18ms - 42ms
  const simLatencyMs = Math.round(18 + Math.random() * 24);
  await new Promise(resolve => setTimeout(resolve, simLatencyMs));

  let diagnosisData: PlantDiseaseDiagnosis | SoilHealthReport | ProduceQualityAssessment;

  switch (domain) {
    case 'plant_health':
      diagnosisData = classifyPlantHealth(histogram, itemHint);
      break;
    case 'soil_health':
      diagnosisData = analyzeSoilHealth(histogram, padColors);
      break;
    case 'produce_quality':
      diagnosisData = assessProduceQuality(histogram, itemHint);
      break;
  }

  const totalTime = Math.round(performance.now() - startTime);

  return {
    data: diagnosisData,
    inferenceTimeMs: Math.max(simLatencyMs, totalTime),
    modelName: model.name,
    hardwareDelegate: model.delegate,
    confidence: 'confidenceScore' in diagnosisData ? diagnosisData.confidenceScore : 0.93,
    timestamp: Date.now()
  };
}
