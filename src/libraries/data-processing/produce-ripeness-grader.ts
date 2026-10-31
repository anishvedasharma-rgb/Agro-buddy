/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Post-Harvest Produce Ripeness & Quality Inspector
 * Grades ripeness stages, shelf-life expectancy, and spoilage defects for market vendors.
 */

import { ProduceQualityAssessment, ColorHistogram, RipenessGrade, SortingCategory, SpoilageDefect } from './types.ts';

/**
 * Assesses harvested produce item from image tensor features
 */
export function assessProduceQuality(
  histogram: ColorHistogram,
  selectedProduceHint?: string
): ProduceQualityAssessment {
  const item = (selectedProduceHint || 'Tomato') as ProduceQualityAssessment['produceItem'];
  const { redMean, greenMean, blueMean, hueMean, necrosisRatio, saturationMean } = histogram;

  let ripenessScore = 50; // 0 (green) to 100 (fully ripe)
  let ripenessGrade: RipenessGrade = 'prime_eating';
  let defect: SpoilageDefect = {
    defectType: 'None Detected',
    extentPercent: 0,
    salvageable: true
  };

  // Check for spoilage or physical defects first
  if (necrosisRatio > 14) {
    defect = {
      defectType: necrosisRatio > 25 ? 'Fungal Soft Rot' : 'Surface Bruising',
      extentPercent: Math.round(necrosisRatio),
      salvageable: necrosisRatio < 20
    };
  }

  if (item === 'Tomato') {
    // Tomato chlorophyll breakdown: green gives way to lycopene red
    // Red ratio vs Green
    const redDominance = (redMean - greenMean) / Math.max(1, redMean + greenMean);
    // Range roughly -0.5 (green) to +0.6 (deep red)
    ripenessScore = Math.max(5, Math.min(98, Math.round(((redDominance + 0.4) / 0.9) * 100)));

    if (ripenessScore < 25) {
      ripenessGrade = 'unripe';
    } else if (ripenessScore < 60) {
      ripenessGrade = 'firm_ripe';
    } else if (ripenessScore < 88) {
      ripenessGrade = 'prime_eating';
    } else {
      ripenessGrade = 'overripe';
    }
  } else if (item === 'Banana') {
    // Banana: Green (Hue ~80-110) -> Bright Yellow (Hue ~50-60) -> Sugar spots/brown
    if (hueMean > 70) {
      ripenessScore = 20;
      ripenessGrade = 'unripe';
    } else if (hueMean >= 45 && necrosisRatio < 5) {
      ripenessScore = 70;
      ripenessGrade = 'prime_eating';
    } else if (necrosisRatio >= 5) {
      ripenessScore = 90;
      ripenessGrade = 'overripe';
    } else {
      ripenessScore = 50;
      ripenessGrade = 'firm_ripe';
    }
  } else if (item === 'Mango') {
    // Mango: Green to golden orange / blush red
    const isGreen = greenMean > redMean;
    if (isGreen) {
      ripenessScore = 30;
      ripenessGrade = 'unripe';
    } else {
      ripenessScore = 80;
      ripenessGrade = 'prime_eating';
    }
  } else {
    // General produce fallback
    ripenessScore = Math.min(95, Math.max(15, Math.round((redMean / (redMean + greenMean + blueMean + 1)) * 180)));
    if (ripenessScore < 35) ripenessGrade = 'unripe';
    else if (ripenessScore < 65) ripenessGrade = 'firm_ripe';
    else if (ripenessScore < 85) ripenessGrade = 'prime_eating';
    else ripenessGrade = 'overripe';
  }

  // If severe rot is present, override grade
  if (defect.defectType === 'Fungal Soft Rot' && defect.extentPercent > 18) {
    ripenessGrade = 'spoiled';
  }

  // Calculate sorting category & shelf life
  let sortingCategory: SortingCategory = 'Grade A (Export / Premium)';
  let shelfLifeAmbientDays = 6;
  let shelfLifeChilledDays = 14;
  let firmnessPsi = 12.5; // Firmness pressure
  let priceRetention = 100;
  let vendorMarketAdvice = 'Premium table condition. Ideal for retail display or long-distance transport.';

  switch (ripenessGrade) {
    case 'unripe':
      sortingCategory = 'Grade A (Export / Premium)';
      shelfLifeAmbientDays = 10;
      shelfLifeChilledDays = 21;
      firmnessPsi = 18.0;
      priceRetention = 95;
      vendorMarketAdvice = 'Best for transit to distant wholesale markets. Store at ambient room temp (20°C) with good ventilation to trigger uniform ripening.';
      break;

    case 'firm_ripe':
      sortingCategory = 'Grade A (Export / Premium)';
      shelfLifeAmbientDays = 6;
      shelfLifeChilledDays = 14;
      firmnessPsi = 14.2;
      priceRetention = 100;
      vendorMarketAdvice = 'Optimal commercial window. High skin firmness withstands customer handling without bruising.';
      break;

    case 'prime_eating':
      if (defect.extentPercent > 8) {
        sortingCategory = 'Grade B (Local Market Immediate)';
        shelfLifeAmbientDays = 2;
        shelfLifeChilledDays = 5;
        firmnessPsi = 8.5;
        priceRetention = 75;
        vendorMarketAdvice = 'Prime sweetness reached with minor cosmetic skin touch. Sell today at local stall or discount 15-20% for rapid clearance.';
      } else {
        sortingCategory = 'Grade A (Export / Premium)';
        shelfLifeAmbientDays = 4;
        shelfLifeChilledDays = 9;
        firmnessPsi = 10.0;
        priceRetention = 100;
        vendorMarketAdvice = 'Peak aromatic flavor and optimal sugar Brix. Position at front of market stand for premium pricing.';
      }
      break;

    case 'overripe':
      if (defect.salvageable) {
        sortingCategory = 'Grade C (Pulping / Processing)';
        shelfLifeAmbientDays = 1;
        shelfLifeChilledDays = 3;
        firmnessPsi = 4.8;
        priceRetention = 45;
        vendorMarketAdvice = 'Soft flesh. Divert immediately to food processing: tomato puree, canning, banana bread, or dried fruit slices to prevent total loss.';
      } else {
        sortingCategory = 'Discard / Compost';
        shelfLifeAmbientDays = 0;
        shelfLifeChilledDays = 0;
        firmnessPsi = 2.0;
        priceRetention = 0;
        vendorMarketAdvice = 'Severe breakdown. Remove from batch to prevent fungal spore cross-contamination of adjacent crates.';
      }
      break;

    case 'spoiled':
      sortingCategory = 'Discard / Compost';
      shelfLifeAmbientDays = 0;
      shelfLifeChilledDays = 0;
      firmnessPsi = 1.0;
      priceRetention = 0;
      vendorMarketAdvice = 'Active rot detected. Isolate crate immediately. Sanitize storage bins with mild chlorine wash.';
      break;
  }

  return {
    produceItem: item,
    ripenessGrade,
    ripenessScore,
    firmnessEstimatedPsi: firmnessPsi,
    shelfLifeAmbientDays,
    shelfLifeChilledDays,
    sortingCategory,
    spoilage: defect,
    vendorMarketAdvice,
    resalePriceRetentionPercent: priceRetention
  };
}
