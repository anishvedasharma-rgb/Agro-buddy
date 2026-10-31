/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Offline Storage Engine
 * 100% offline-first local persistence for field inspection records,
 * pre-harvest plant disease logs, soil N-P-K assays, and produce batch audits.
 */

import { InspectionRecord, FarmProfile } from './types.ts';
import { LOW_COST_REMEDIES } from '../data-processing/plant-health-classifier.ts';

const STORAGE_KEY_RECORDS = 'smart_agri_inspections_v1';
const STORAGE_KEY_PROFILE = 'smart_agri_farm_profile_v1';
const STORAGE_KEY_OFFLINE_TOGGLE = 'smart_agri_sim_offline_v1';

export const DEFAULT_FARM_PROFILE: FarmProfile = {
  farmerName: 'Solomon Mwangi',
  coopId: 'RUK-9042',
  coopName: 'Highland Growers Agricultural Co-operative',
  region: 'Nakuru Basin Sector 4',
  storageCapacityTons: 12.5
};

// Seed records to demonstrate real pre-harvest, soil, and produce history
export const INITIAL_SEED_RECORDS: InspectionRecord[] = [
  {
    id: 'rec_seed_plant_01',
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    domain: 'plant_health',
    cropOrItemName: 'Tomato',
    primaryResultTitle: 'Tomato Early Blight (Alternaria)',
    statusBadgeVariant: 'amber',
    statusBadgeLabel: 'Moderate Blight',
    syncState: 'pending_sync',
    farmLocation: {
      plotName: 'North Greenhouse Plot B',
      coordinates: '0.2827° S, 36.0683° E'
    },
    plantDiagnosis: {
      cropType: 'Tomato',
      diseaseName: 'Tomato Early Blight',
      scientificPathogen: 'Alternaria solani',
      pathogenType: 'fungal',
      confidenceScore: 0.93,
      severity: 'moderate',
      affectedLeafAreaPercent: 14,
      keyVisualSigns: [
        'Concentric target-board rings on older foliage',
        'Chlorotic yellow margins spreading from lesion center'
      ],
      lowCostRemedies: [
        LOW_COST_REMEDIES.baking_soda_spray,
        LOW_COST_REMEDIES.neem_oil_emulsion
      ],
      urgencyDaysToAct: 3
    }
  },
  {
    id: 'rec_seed_soil_02',
    timestamp: Date.now() - 1000 * 60 * 60 * 26, // yesterday
    domain: 'soil_health',
    cropOrItemName: 'Loam Bed 3',
    primaryResultTitle: 'Optimal N-P-K Fertility (Score: 88/100)',
    statusBadgeVariant: 'emerald',
    statusBadgeLabel: 'Fertile Soil',
    syncState: 'synced',
    farmLocation: {
      plotName: 'Terrace Bed 3',
      coordinates: '0.2831° S, 36.0690° E'
    },
    soilReport: {
      soilTypeEst: 'Rich Humus',
      nutrients: [
        {
          nutrient: 'Nitrogen (N)',
          level: 'Optimal',
          estimatedPpmOrPh: '38 ppm',
          colorMatchedHex: '#D94E34',
          referenceHex: '#D94E34',
          impactOnCrop: 'Strong dark vegetative canopy growth.',
          organicRemedy: 'Maintain organic mulch to retain moisture.'
        },
        {
          nutrient: 'Phosphorus (P)',
          level: 'Optimal',
          estimatedPpmOrPh: '24 ppm',
          colorMatchedHex: '#3B72AF',
          referenceHex: '#3B72AF',
          impactOnCrop: 'Deep root anchorage and dense blossom formation.',
          organicRemedy: 'None required. Soil reserves optimal.'
        },
        {
          nutrient: 'Potassium (K)',
          level: 'Optimal',
          estimatedPpmOrPh: '185 ppm',
          colorMatchedHex: '#A34F18',
          referenceHex: '#A34F18',
          impactOnCrop: 'High drought resistance and turgor.',
          organicRemedy: 'Wood ash dusting scheduled for next quarter.'
        },
        {
          nutrient: 'Soil pH',
          level: 'Optimal',
          estimatedPpmOrPh: '6.6 pH',
          colorMatchedHex: '#52A447',
          referenceHex: '#52A447',
          impactOnCrop: 'Peak nutrient solubility range.',
          organicRemedy: 'Buffer with cured compost.'
        }
      ],
      overallFertilityScore: 88,
      recommendedImmediateAction: 'Bed is primed for planting heavy feeders like brassicas or nightshades.',
      recommendedCompostBlend: 'Standard 60:40 carbon/nitrogen cured compost.',
      testMethod: 'Visual Test Strip (3-Pad)'
    }
  },
  {
    id: 'rec_seed_produce_03',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    domain: 'produce_quality',
    cropOrItemName: 'Tomato Crate #14',
    primaryResultTitle: 'Grade A Firm Ripe (Shelf Life: 6 Days)',
    statusBadgeVariant: 'emerald',
    statusBadgeLabel: 'Grade A Market',
    syncState: 'pending_sync',
    farmLocation: {
      plotName: 'Packing Shed Crate #14'
    },
    produceAssessment: {
      produceItem: 'Tomato',
      ripenessGrade: 'firm_ripe',
      ripenessScore: 55,
      firmnessEstimatedPsi: 14.5,
      shelfLifeAmbientDays: 6,
      shelfLifeChilledDays: 14,
      sortingCategory: 'Grade A (Export / Premium)',
      spoilage: {
        defectType: 'None Detected',
        extentPercent: 0,
        salvageable: true
      },
      vendorMarketAdvice: 'Firm skin withstands market handling and transport. High price retention.',
      resalePriceRetentionPercent: 100
    }
  }
];

export class OfflineStorageEngine {
  /**
   * Retrieves all stored inspections
   */
  static getRecords(): InspectionRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (!raw) {
        // Seed initial data on first run
        this.saveRecords(INITIAL_SEED_RECORDS);
        return INITIAL_SEED_RECORDS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_SEED_RECORDS;
    }
  }

  /**
   * Saves records to local persistence
   */
  static saveRecords(records: InspectionRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.warn('Local storage write warning (possibly quota):', e);
    }
  }

  /**
   * Adds a new inspection record
   */
  static addRecord(record: InspectionRecord): InspectionRecord[] {
    const existing = this.getRecords();
    const updated = [record, ...existing];
    this.saveRecords(updated);
    return updated;
  }

  /**
   * Deletes a record by ID
   */
  static deleteRecord(id: string): InspectionRecord[] {
    const existing = this.getRecords();
    const updated = existing.filter(r => r.id !== id);
    this.saveRecords(updated);
    return updated;
  }

  /**
   * Marks records as synced
   */
  static markRecordsSynced(ids: string[]): InspectionRecord[] {
    const existing = this.getRecords();
    const idSet = new Set(ids);
    const updated = existing.map(r => {
      if (idSet.has(r.id)) {
        return { ...r, syncState: 'synced' as const };
      }
      return r;
    });
    this.saveRecords(updated);
    return updated;
  }

  /**
   * Farm profile getter & setter
   */
  static getFarmProfile(): FarmProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
      return raw ? JSON.parse(raw) : DEFAULT_FARM_PROFILE;
    } catch {
      return DEFAULT_FARM_PROFILE;
    }
  }

  static saveFarmProfile(profile: FarmProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving profile:', e);
    }
  }

  /**
   * Gets approximate local storage footprint in KB
   */
  static getStorageFootprintKb(): number {
    try {
      const rawRecords = localStorage.getItem(STORAGE_KEY_RECORDS) || '';
      return Math.round(new Blob([rawRecords]).size / 1024);
    } catch {
      return 12;
    }
  }

  /**
   * Simulated offline mode toggle
   */
  static getSimulatedOffline(): boolean {
    return localStorage.getItem(STORAGE_KEY_OFFLINE_TOGGLE) === 'true';
  }

  static setSimulatedOffline(val: boolean): void {
    localStorage.setItem(STORAGE_KEY_OFFLINE_TOGGLE, val ? 'true' : 'false');
  }
}
