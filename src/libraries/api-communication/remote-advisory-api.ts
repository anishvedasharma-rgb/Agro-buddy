/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Remote Advisory & Export API
 * Facilitates CSV data exports, printable audit summaries, and remote agronomy consultations.
 */

import { InspectionRecord, FarmProfile } from './types.ts';
import { OfflineStorageEngine } from './offline-storage.ts';

export class RemoteAdvisoryAPI {
  /**
   * Generates a CSV data export of all inspections
   */
  static exportToCSV(records: InspectionRecord[], profile: FarmProfile): string {
    const headers = [
      'Record_ID',
      'Date_UTC',
      'Domain',
      'Crop_Produce',
      'Primary_Diagnosis',
      'Status_Grade',
      'Sync_Status',
      'Plot_Location',
      'Farmer_Name',
      'Coop_ID'
    ];

    const rows = records.map(r => {
      const dateStr = new Date(r.timestamp).toISOString();
      const plot = r.farmLocation?.plotName || 'Unspecified';
      return [
        `"${r.id}"`,
        `"${dateStr}"`,
        `"${r.domain}"`,
        `"${r.cropOrItemName}"`,
        `"${r.primaryResultTitle.replace(/"/g, '""')}"`,
        `"${r.statusBadgeLabel}"`,
        `"${r.syncState}"`,
        `"${plot}"`,
        `"${profile.farmerName}"`,
        `"${profile.coopId}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Triggers client-side browser file download for the CSV report
   */
  static downloadInspectionCSV(): void {
    const records = OfflineStorageEngine.getRecords();
    const profile = OfflineStorageEngine.getFarmProfile();
    const csvContent = this.exportToCSV(records, profile);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartAgri_Audit_${profile.coopId}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Submits a difficult sample to regional extension service agronomist
   */
  static async requestAgronomistReview(recordId: string, farmerNote: string): Promise<{ success: boolean; ticketId: string }> {
    // Simulates queuing for regional agronomy review
    await new Promise(r => setTimeout(r, 600));
    return {
      success: true,
      ticketId: `AGRI-EXT-${Math.floor(1000 + Math.random() * 9000)}`
    };
  }
}
