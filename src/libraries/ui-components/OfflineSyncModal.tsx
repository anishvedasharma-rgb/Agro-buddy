/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Offline Sync & Co-operative Telemetry Modal
 */

import React, { useState } from 'react';
import { 
  X, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  RefreshCw, 
  Download, 
  User, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { SyncTelemetry, FarmProfile } from '../api-communication/types.ts';
import { SyncQueueManager } from '../api-communication/sync-queue.ts';
import { RemoteAdvisoryAPI } from '../api-communication/remote-advisory-api.ts';
import { OfflineStorageEngine } from '../api-communication/offline-storage.ts';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: SyncTelemetry;
  onSyncComplete?: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onSyncComplete
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [farmProfile, setFarmProfile] = useState<FarmProfile>(OfflineStorageEngine.getFarmProfile());

  if (!isOpen) return null;

  const handleToggleOfflineSim = () => {
    SyncQueueManager.toggleSimulatedOffline();
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await SyncQueueManager.syncPendingInspections();
      setSyncMessage(result.message);
      if (result.success && onSyncComplete) {
        onSyncComplete();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadCSV = () => {
    RemoteAdvisoryAPI.downloadInspectionCSV();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <HardDrive size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-100">Offline Field & Co-op Sync</h3>
              <p className="text-xs text-stone-400">100% on-device operations with regional synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Connectivity Mode Switcher */}
        <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                {telemetry.isOnline ? (
                  <Wifi size={16} className="text-emerald-400" />
                ) : (
                  <WifiOff size={16} className="text-amber-400" />
                )}
                <span>{telemetry.isOnline ? 'Online (Co-op Network Connected)' : '100% Remote Field Mode (Offline)'}</span>
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                {telemetry.isOnline 
                  ? 'Ready to transmit field logs to co-operative central ledger.'
                  : 'All tensor inferences and audits run completely on-device without internet.'
                }
              </p>
            </div>

            <button
              onClick={handleToggleOfflineSim}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors shrink-0 ${
                telemetry.simulatedOfflineMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {telemetry.simulatedOfflineMode ? 'Disable Field Mode' : 'Simulate Field Mode'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800/80 text-xs">
            <div>
              <span className="text-stone-400 block">Pending to Sync:</span>
              <span className="font-bold text-stone-200">{telemetry.pendingSyncCount} inspections</span>
            </div>
            <div>
              <span className="text-stone-400 block">Local Device Cache:</span>
              <span className="font-bold text-stone-200">{telemetry.storageUsageKb} KB used</span>
            </div>
          </div>
        </div>

        {/* Co-op Farmer Profile Summary */}
        <div className="p-3.5 rounded-2xl bg-stone-950/40 border border-stone-800 text-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-300 font-medium">
            <User size={14} className="text-emerald-400" />
            <span>{farmProfile.farmerName} ({farmProfile.coopId})</span>
          </div>
          <p className="text-stone-400">{farmProfile.coopName} · {farmProfile.region}</p>
        </div>

        {/* Sync message if any */}
        {syncMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
            <Check size={16} className="shrink-0 mt-0.5" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-700 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV Ledger</span>
          </button>

          <button
            onClick={handleRunSync}
            disabled={isSyncing || !telemetry.isOnline}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
              telemetry.isOnline && !isSyncing
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
            }`}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Co-op'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
