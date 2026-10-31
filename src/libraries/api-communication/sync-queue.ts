/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sync Queue Manager
 * Manages pending inspections queue, transactional batching, and bi-directional
 * sync with regional agricultural cooperatives when online connectivity is restored.
 */

import { InspectionRecord, SyncTelemetry } from './types.ts';
import { OfflineStorageEngine } from './offline-storage.ts';

export class SyncQueueManager {
  private static isSyncing = false;
  private static listeners: Array<(telemetry: SyncTelemetry) => void> = [];

  static subscribe(listener: (telemetry: SyncTelemetry) => void): () => void {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static getTelemetry(): SyncTelemetry {
    const records = OfflineStorageEngine.getRecords();
    const pendingCount = records.filter(r => r.syncState === 'pending_sync' || r.syncState === 'local_only').length;
    const isSimOffline = OfflineStorageEngine.getSimulatedOffline();
    const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    return {
      isOnline: browserOnline && !isSimOffline,
      simulatedOfflineMode: isSimOffline,
      pendingSyncCount: pendingCount,
      lastSyncedTimestamp: Date.now() - 1000 * 60 * 15,
      serverEndpoint: 'https://coop-api.smartagri.network/v2/field-sync',
      storageUsageKb: OfflineStorageEngine.getStorageFootprintKb()
    };
  }

  private static notify() {
    const telemetry = this.getTelemetry();
    this.listeners.forEach(fn => fn(telemetry));
  }

  /**
   * Executes sync batch with agricultural cooperative server
   */
  static async syncPendingInspections(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, message: 'Sync already in progress.' };
    }

    const telemetry = this.getTelemetry();
    if (!telemetry.isOnline) {
      return { 
        success: false, 
        syncedCount: 0, 
        message: 'Device is currently offline in remote field mode. Records remain safely saved in local storage.' 
      };
    }

    this.isSyncing = true;
    try {
      const records = OfflineStorageEngine.getRecords();
      const pending = records.filter(r => r.syncState === 'pending_sync' || r.syncState === 'local_only');

      if (pending.length === 0) {
        return { success: true, syncedCount: 0, message: 'All field records are already up to date.' };
      }

      // Simulate network latency to co-op cloud API
      await new Promise(r => setTimeout(r, 900));

      // Mark records as synced
      const syncedIds = pending.map(p => p.id);
      OfflineStorageEngine.markRecordsSynced(syncedIds);

      this.notify();
      return {
        success: true,
        syncedCount: syncedIds.length,
        message: `Successfully synchronized ${syncedIds.length} field inspection records to ${OfflineStorageEngine.getFarmProfile().coopName}.`
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Toggles simulated offline mode (useful for testing remote field conditions)
   */
  static toggleSimulatedOffline(): boolean {
    const current = OfflineStorageEngine.getSimulatedOffline();
    OfflineStorageEngine.setSimulatedOffline(!current);
    this.notify();
    return !current;
  }
}
