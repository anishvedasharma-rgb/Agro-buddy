/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * API Communication & Offline Storage Library - Core Types
 */

import { PlantDiseaseDiagnosis, SoilHealthReport, ProduceQualityAssessment, InspectionDomain } from '../data-processing/types.ts';

export type SyncState = 'local_only' | 'pending_sync' | 'synced' | 'sync_error';

export interface InspectionRecord {
  id: string;
  timestamp: number;
  domain: InspectionDomain;
  thumbnailDataUrl?: string;
  cropOrItemName: string;
  primaryResultTitle: string;
  statusBadgeVariant: 'emerald' | 'amber' | 'rose' | 'neutral';
  statusBadgeLabel: string;
  syncState: SyncState;
  farmLocation: {
    plotName: string;
    coordinates?: string;
  };
  batchId?: string;
  plantDiagnosis?: PlantDiseaseDiagnosis;
  soilReport?: SoilHealthReport;
  produceAssessment?: ProduceQualityAssessment;
  notes?: string;
}

export interface FarmProfile {
  farmerName: string;
  coopId: string;
  coopName: string;
  region: string;
  storageCapacityTons: number;
}

export interface SyncTelemetry {
  isOnline: boolean;
  simulatedOfflineMode: boolean;
  pendingSyncCount: number;
  lastSyncedTimestamp: number | null;
  serverEndpoint: string;
  storageUsageKb: number;
}
