/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image Tensor Extraction & Computer Vision Helpers
 * Analyzes pixel buffers for agricultural diagnostics (color spaces, chlorophyll index,
 * necrosis detection, test strip colorimeter, and spectral ripeness).
 */

import { ColorHistogram } from './types.ts';

/**
 * Converts RGB to HSV (Hue: 0-360, Saturation: 0-1, Value: 0-1)
 */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return [h, s, v];
}

/**
 * Calculates Euclidean color distance between two hex/RGB colors
 */
export function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

/**
 * Extracts comprehensive image histogram and botanical metrics from an ImageData buffer
 */
export function extractImageTensorMetrics(imageData: ImageData): ColorHistogram {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumH = 0;
  let sumS = 0;
  let sumV = 0;
  let necrosisPixels = 0;
  let chlorophyllPixels = 0;

  // Stride of 4 bytes per pixel (RGBA), sampling every 2nd pixel for speed
  const step = 2;
  let sampledCount = 0;

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a < 50) continue;

    sumR += r;
    sumG += g;
    sumB += b;

    const [h, s, v] = rgbToHsv(r, g, b);
    sumH += h;
    sumS += s;
    sumV += v;
    sampledCount++;

    // Chlorophyll signature: Green dominant (hue ~ 65-155), reasonable saturation
    if (h >= 65 && h <= 160 && s > 0.25) {
      chlorophyllPixels++;
    }

    // Necrosis / Lesion signature: Brown / dark yellow / black spots
    // Hue in yellow-orange range (20-55) with lower brightness or low hue with high redness
    const isBrownOrRot = (h >= 15 && h <= 55 && v < 0.65 && s > 0.2) || (r > 100 && g < 70 && b < 70) || (v < 0.25 && s < 0.3);
    if (isBrownOrRot) {
      necrosisPixels++;
    }
  }

  const validCount = Math.max(1, sampledCount);
  const redMean = sumR / validCount;
  const greenMean = sumG / validCount;
  const blueMean = sumB / validCount;
  const hueMean = sumH / validCount;
  const saturationMean = sumS / validCount;
  const valueMean = sumV / validCount;

  // Chlorophyll index: normalized green excess
  const chlorophyllIndex = Math.max(0, Math.min(1, (greenMean * 2) / (redMean + blueMean + greenMean + 1)));
  const necrosisRatio = Math.max(0, Math.min(100, (necrosisPixels / validCount) * 100));

  return {
    redMean,
    greenMean,
    blueMean,
    hueMean,
    saturationMean,
    valueMean,
    chlorophyllIndex,
    necrosisRatio: Math.round(necrosisRatio * 10) / 10,
  };
}

/**
 * Samples a specific region of an image (e.g. for a 3-pad soil test strip)
 */
export function sampleRegionColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  boxWidth: number,
  boxHeight: number
): { hex: string; r: number; g: number; b: number } {
  try {
    const data = ctx.getImageData(x, y, boxWidth, boxHeight).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    const avgR = Math.round(r / Math.max(1, count));
    const avgG = Math.round(g / Math.max(1, count));
    const avgB = Math.round(b / Math.max(1, count));
    const hex = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`;
    return { hex, r: avgR, g: avgG, b: avgB };
  } catch {
    return { hex: '#777777', r: 120, g: 120, b: 120 };
  }
}
