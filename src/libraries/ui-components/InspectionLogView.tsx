/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Field Inspection Log View
 * Interactive audit trail of pre-harvest foliar diagnoses, soil assays, and produce gradings.
 */

import React, { useState } from 'react';
import { 
  ClipboardList, 
  Trash2, 
  FileSpreadsheet, 
  Sprout, 
  FlaskConical, 
  Apple, 
  Search, 
  Filter, 
  Volume2, 
  ExternalLink 
} from 'lucide-react';
import { InspectionRecord } from '../api-communication/types.ts';
import { OfflineStorageEngine } from '../api-communication/offline-storage.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface InspectionLogViewProps {
  records: InspectionRecord[];
  onRefreshRecords: () => void;
  onSelectRecordForDetail: (record: InspectionRecord) => void;
  onExportCSV: () => void;
}

export const InspectionLogView: React.FC<InspectionLogViewProps> = ({
  records,
  onRefreshRecords,
  onSelectRecordForDetail,
  onExportCSV
}) => {
  const [domainFilter, setDomainFilter] = useState<'all' | 'plant_health' | 'soil_health' | 'produce_quality'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    OfflineStorageEngine.deleteRecord(id);
    onRefreshRecords();
  };

  const filtered = records.filter(r => {
    if (domainFilter !== 'all' && r.domain !== domainFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = r.primaryResultTitle.toLowerCase().includes(q);
      const matchCrop = r.cropOrItemName.toLowerCase().includes(q);
      const matchPlot = r.farmLocation?.plotName.toLowerCase().includes(q);
      return matchTitle || matchCrop || matchPlot;
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Controls: Search, Filter Tabs, and Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search crops, diseases, or plots..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Domain Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              domainFilter === 'all' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setDomainFilter('plant_health')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              domainFilter === 'plant_health' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sprout size={13} />
            <span>Plant</span>
          </button>
          <button
            onClick={() => setDomainFilter('soil_health')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              domainFilter === 'soil_health' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FlaskConical size={13} />
            <span>Soil</span>
          </button>
          <button
            onClick={() => setDomainFilter('produce_quality')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              domainFilter === 'produce_quality' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Apple size={13} />
            <span>Produce</span>
          </button>
        </div>

        {/* CSV Export */}
        <button
          onClick={onExportCSV}
          className="px-3.5 py-2 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <FileSpreadsheet size={14} className="text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Record Rows */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-stone-900/50 border border-stone-800 rounded-2xl">
          <ClipboardList size={32} className="mx-auto text-stone-600 mb-2" />
          <p className="text-sm font-semibold text-stone-300">No matching field records</p>
          <p className="text-xs text-stone-500 mt-1">Capture a leaf, test strip, or produce crate to start your offline audit log.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(record => {
            const timeAgo = formatTimeAgo(record.timestamp);
            return (
              <div
                key={record.id}
                onClick={() => onSelectRecordForDetail(record)}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-emerald-500/30 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Domain Icon Container */}
                  <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center shrink-0">
                    {record.domain === 'plant_health' && <Sprout size={18} className="text-emerald-400" />}
                    {record.domain === 'soil_health' && <FlaskConical size={18} className="text-amber-400" />}
                    {record.domain === 'produce_quality' && <Apple size={18} className="text-rose-400" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-100 group-hover:text-emerald-300 transition-colors truncate">
                        {record.primaryResultTitle}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        record.statusBadgeVariant === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        record.statusBadgeVariant === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {record.statusBadgeLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5 truncate">
                      <span>{record.cropOrItemName}</span>
                      <span>·</span>
                      <span>{record.farmLocation.plotName}</span>
                      <span>·</span>
                      <span className="text-stone-500">{timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                    record.syncState === 'synced' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {record.syncState === 'synced' ? 'Synced' : 'Local Only'}
                  </span>

                  <button
                    onClick={(e) => handleDelete(record.id, e)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}
