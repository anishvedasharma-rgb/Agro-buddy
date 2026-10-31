/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Coroutine Worker Dispatcher
 * Simulates Kotlin Coroutines (Dispatchers.Default & withContext) pattern for non-blocking
 * image tensor processing on background threads.
 */

import { runLocalTFLiteInference } from './tflite-runtime.ts';
import { 
  InspectionDomain, 
  TensorProcessingResult, 
  PlantDiseaseDiagnosis, 
  SoilHealthReport, 
  ProduceQualityAssessment 
} from './types.ts';

export interface CoroutineState {
  isProcessing: boolean;
  stage: 'idle' | 'allocating_tensors' | 'normalizing_pixels' | 'npu_forward_pass' | 'completed' | 'error';
  progressPercent: number;
}

export type CoroutineProgressCallback = (state: CoroutineState) => void;

/**
 * Dispatches tensor processing asynchronously off the main UI thread
 */
export async function dispatchTensorCoroutine(
  domain: InspectionDomain,
  imageData: ImageData,
  itemHint?: string,
  padColors?: { nHex?: string; pHex?: string; kHex?: string },
  onProgress?: CoroutineProgressCallback
): Promise<TensorProcessingResult<PlantDiseaseDiagnosis | SoilHealthReport | ProduceQualityAssessment>> {
  // Stage 1: Allocating Tensors
  onProgress?.({
    isProcessing: true,
    stage: 'allocating_tensors',
    progressPercent: 20
  });
  await new Promise(r => setTimeout(r, 40));

  // Stage 2: Pixel Normalization
  onProgress?.({
    isProcessing: true,
    stage: 'normalizing_pixels',
    progressPercent: 55
  });
  await new Promise(r => setTimeout(r, 60));

  // Stage 3: Local NPU Forward Pass
  onProgress?.({
    isProcessing: true,
    stage: 'npu_forward_pass',
    progressPercent: 85
  });

  const result = await runLocalTFLiteInference(domain, imageData, itemHint, padColors);

  // Stage 4: Completed
  onProgress?.({
    isProcessing: false,
    stage: 'completed',
    progressPercent: 100
  });

  return result;
}
