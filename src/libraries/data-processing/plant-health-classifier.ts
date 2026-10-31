/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Plant Health & Crop Disease Classifier
 * Implements multi-class botanical disease inference with low-cost remedy formulations.
 */

import { PlantDiseaseDiagnosis, ColorHistogram, LowCostRemedy, SeverityLevel } from './types.ts';

// Comprehensive low-cost remedy catalog
export const LOW_COST_REMEDIES: Record<string, LowCostRemedy> = {
  baking_soda_spray: {
    id: 'baking_soda_spray',
    name: 'Baking Soda & Vegetable Oil Fungicide',
    costTier: 'very_low',
    preparationTime: '5 minutes',
    ingredients: [
      '1 tablespoon (15g) Baking Soda (Sodium Bicarbonate)',
      '1 teaspoon (5ml) Mild vegetable oil or liquid dish soap (acts as spreader-sticker)',
      '1 gallon (3.8 Liters) of clean water'
    ],
    steps: [
      'Mix baking soda into 1 liter of warm water until fully dissolved.',
      'Add vegetable oil or soap and shake thoroughly to create an emulsion.',
      'Dilute with remaining water in a clean spray bottle or backpack sprayer.',
      'Spray both upper and underside of affected leaves early morning or late dusk.'
    ],
    organicCertified: true,
    preventionTip: 'Repeat every 7 days or immediately following heavy rainfall.',
    visualIcon: 'droplet'
  },
  neem_oil_emulsion: {
    id: 'neem_oil_emulsion',
    name: 'Cold-Pressed Neem Leaf / Oil Solution',
    costTier: 'low',
    preparationTime: '15 minutes',
    ingredients: [
      '2 tablespoons pure cold-pressed neem oil (or 500g boiled fresh neem leaves)',
      '1 teaspoon natural soap (emulsifier)',
      '1 gallon tepid water'
    ],
    steps: [
      'Whisk soap and neem oil together until cloudy before adding water.',
      'Stir vigorously into warm water.',
      'Coat stems, leaf axils, and leaf undersides thoroughly.',
      'Avoid spraying during intense midday sun to prevent phototoxicity.'
    ],
    organicCertified: true,
    preventionTip: 'Disrupts fungal spore germination and repels whiteflies/aphids.',
    visualIcon: 'shield'
  },
  wood_ash_dusting: {
    id: 'wood_ash_dusting',
    name: 'Fine Hardwood Ash Foliar Barrier',
    costTier: 'free',
    preparationTime: 'Ready immediately',
    ingredients: [
      '2 cups sifted cool wood ash from clean hardwood firewood'
    ],
    steps: [
      'Sift wood ash through wire mesh to remove sharp charcoal chunks.',
      'Dust lightly over damp leaves in the morning while dew is present.',
      'Forms a protective alkaline barrier that suppresses fungal hyphae penetration.'
    ],
    organicCertified: true,
    preventionTip: 'Do not over-apply to avoid raising soil pH excessively around base.',
    visualIcon: 'flame'
  },
  buttermilk_spray: {
    id: 'buttermilk_spray',
    name: 'Sour Whey / Buttermilk Probiotic Foliar Wash',
    costTier: 'very_low',
    preparationTime: '5 minutes',
    ingredients: [
      '1 cup fermented sour milk or buttermilk / whey',
      '9 cups clean water (1:9 ratio)'
    ],
    steps: [
      'Dilute sour whey into water.',
      'The lactic acid bacteria and proteins outcompete pathogen spore colonizers.',
      'Spray liberally across foliage weekly.'
    ],
    organicCertified: true,
    preventionTip: 'Highly effective against powdery mildews and surface leaf molds.',
    visualIcon: 'leaf'
  },
  copper_sulfate_bordeaux: {
    id: 'copper_sulfate_bordeaux',
    name: 'Dilute Bordeaux Mix (Copper + Slaked Lime)',
    costTier: 'low',
    preparationTime: '20 minutes',
    ingredients: [
      '100g Copper Sulfate crystals',
      '100g Hydrated Lime (calcium hydroxide)',
      '10 Liters water'
    ],
    steps: [
      'Dissolve copper sulfate in 5L plastic bucket (never metal).',
      'Mix hydrated lime in separate 5L water.',
      'Pour copper solution into lime solution while stirring continuously.',
      'Strain through cloth and apply to prevent aggressive blight spread.'
    ],
    organicCertified: true,
    preventionTip: 'Prune heavily infected lower leaves first and burn/bury them.',
    visualIcon: 'shield'
  }
};

/**
 * Multi-class botanical leaf pathology inference
 */
export function classifyPlantHealth(
  histogram: ColorHistogram,
  selectedCropHint?: string
): PlantDiseaseDiagnosis {
  const crop = (selectedCropHint || 'Tomato') as PlantDiseaseDiagnosis['cropType'];
  const { necrosisRatio, chlorophyllIndex, redMean, greenMean } = histogram;

  // Decision logic based on extracted image tensor features
  if (necrosisRatio < 3.5 && chlorophyllIndex > 0.42) {
    // Healthy foliage
    return {
      cropType: crop,
      diseaseName: 'Healthy Vigorous Foliage',
      scientificPathogen: 'None (Optimal Plant Health)',
      pathogenType: 'healthy',
      confidenceScore: Math.min(0.98, 0.88 + chlorophyllIndex * 0.1),
      severity: 'healthy',
      affectedLeafAreaPercent: Math.max(0, necrosisRatio),
      keyVisualSigns: [
        'Uniform emerald green coloration',
        'Intact leaf margin and prominent healthy vascular veins',
        'No concentric target rings or necrotic spots'
      ],
      lowCostRemedies: [
        LOW_COST_REMEDIES.buttermilk_spray,
        LOW_COST_REMEDIES.wood_ash_dusting
      ],
      urgencyDaysToAct: 14 // Routine monitoring
    };
  }

  if (crop === 'Tomato') {
    if (necrosisRatio > 18 || (redMean > greenMean && necrosisRatio > 12)) {
      // Tomato Late Blight
      return {
        cropType: 'Tomato',
        diseaseName: 'Tomato Late Blight',
        scientificPathogen: 'Phytophthora infestans',
        pathogenType: 'fungal',
        confidenceScore: 0.94,
        severity: necrosisRatio > 25 ? 'severe' : 'moderate',
        affectedLeafAreaPercent: Math.round(necrosisRatio * 1.3),
        keyVisualSigns: [
          'Dark water-soaked lesions that rapidly turn purplish-brown',
          'Pale green margin around expanding necrotic spots',
          'White downy fungal fuzz visible on leaf underside in humid conditions'
        ],
        lowCostRemedies: [
          LOW_COST_REMEDIES.copper_sulfate_bordeaux,
          LOW_COST_REMEDIES.baking_soda_spray
        ],
        urgencyDaysToAct: 2 // Highly contagious
      };
    } else {
      // Tomato Early Blight
      return {
        cropType: 'Tomato',
        diseaseName: 'Tomato Early Blight',
        scientificPathogen: 'Alternaria solani',
        pathogenType: 'fungal',
        confidenceScore: 0.91,
        severity: necrosisRatio > 10 ? 'moderate' : 'mild',
        affectedLeafAreaPercent: Math.round(necrosisRatio),
        keyVisualSigns: [
          'Concentric target-board rings on older lower leaves',
          'Yellow chlorotic halo surrounding brown necrotic lesions',
          'Premature leaf senescence starting from plant base'
        ],
        lowCostRemedies: [
          LOW_COST_REMEDIES.baking_soda_spray,
          LOW_COST_REMEDIES.neem_oil_emulsion
        ],
        urgencyDaysToAct: 4
      };
    }
  }

  if (crop === 'Potato') {
    return {
      cropType: 'Potato',
      diseaseName: 'Potato Late Blight',
      scientificPathogen: 'Phytophthora infestans',
      pathogenType: 'fungal',
      confidenceScore: 0.92,
      severity: necrosisRatio > 15 ? 'severe' : 'moderate',
      affectedLeafAreaPercent: Math.round(necrosisRatio),
      keyVisualSigns: [
        'Water-soaked lesions on leaf tips margins',
        'Rapid stem blackening and leaf collapse',
        'Tuber vulnerability if spores wash into soil ridges'
      ],
      lowCostRemedies: [
        LOW_COST_REMEDIES.copper_sulfate_bordeaux,
        LOW_COST_REMEDIES.wood_ash_dusting
      ],
      urgencyDaysToAct: 2
    };
  }

  if (crop === 'Apple') {
    return {
      cropType: 'Apple',
      diseaseName: 'Apple Scab',
      scientificPathogen: 'Venturia inaequalis',
      pathogenType: 'fungal',
      confidenceScore: 0.89,
      severity: necrosisRatio > 12 ? 'moderate' : 'mild',
      affectedLeafAreaPercent: Math.round(necrosisRatio),
      keyVisualSigns: [
        'Olive-green to velvety brown-black circular spots',
        'Curling and puckering of young tender leaf blade',
        'Surface scabs that cork and crack upon drying'
      ],
      lowCostRemedies: [
        LOW_COST_REMEDIES.neem_oil_emulsion,
        LOW_COST_REMEDIES.baking_soda_spray
      ],
      urgencyDaysToAct: 5
    };
  }

  // General crop leaf disease fallback
  return {
    cropType: crop,
    diseaseName: 'Foliar Leaf Spot / Blight Complex',
    scientificPathogen: 'Cercospora / Septoria spp.',
    pathogenType: 'fungal',
    confidenceScore: 0.87,
    severity: necrosisRatio > 15 ? 'moderate' : 'mild',
    affectedLeafAreaPercent: Math.round(necrosisRatio),
    keyVisualSigns: [
      'Irregular brown spotting on foliar surface',
      'Chlorotic yellow margins indicating toxin secretion',
      'Weakened photosynthesizing canopy'
    ],
    lowCostRemedies: [
      LOW_COST_REMEDIES.baking_soda_spray,
      LOW_COST_REMEDIES.neem_oil_emulsion
    ],
    urgencyDaysToAct: 4
  };
}
