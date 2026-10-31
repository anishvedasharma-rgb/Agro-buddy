/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Batch Sorting Grid for Vendors & Market Co-operatives
 * Rapid crate triage station for grading produce lots into Grade A, B, C, and Reject
 * to prevent post-harvest food waste.
 */

import React, { useState } from 'react';
import { 
  PackageCheck, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ProduceQualityAssessment, RipenessGrade, SortingCategory } from '../data-processing/types.ts';
import { assessProduceQuality } from '../data-processing/produce-ripeness-grader.ts';

export interface BatchItem {
  id: string;
  produceName: string;
  weightKg: number;
  ripeness: RipenessGrade;
  category: SortingCategory;
  pricePerKgEst: number;
  shelfLifeDays: number;
}

export const BatchSortingGrid: React.FC<{
  onExportCSV: () => void;
}> = ({ onExportCSV }) => {
  const [items, setItems] = useState<BatchItem[]>([
    {
      id: 'lot_01',
      produceName: 'Roma Tomato Crate #1',
      weightKg: 18.5,
      ripeness: 'firm_ripe',
      category: 'Grade A (Export / Premium)',
      pricePerKgEst: 1.80,
      shelfLifeDays: 6
    },
    {
      id: 'lot_02',
      produceName: 'Roma Tomato Crate #2',
      weightKg: 14.0,
      ripeness: 'prime_eating',
      category: 'Grade B (Local Market Immediate)',
      pricePerKgEst: 1.40,
      shelfLifeDays: 2
    },
    {
      id: 'lot_03',
      produceName: 'Roma Tomato Crate #3',
      weightKg: 12.0,
      ripeness: 'overripe',
      category: 'Grade C (Pulping / Processing)',
      pricePerKgEst: 0.70,
      shelfLifeDays: 1
    },
    {
      id: 'lot_04',
      produceName: 'Cavendish Banana Bundle',
      weightKg: 22.0,
      ripeness: 'prime_eating',
      category: 'Grade A (Export / Premium)',
      pricePerKgEst: 1.20,
      shelfLifeDays: 4
    }
  ]);

  const [newProduceName, setNewProduceName] = useState('Tomato Crate');
  const [newWeight, setNewWeight] = useState('15');
  const [newRipeness, setNewRipeness] = useState<RipenessGrade>('firm_ripe');

  // Add item into batch
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight) || 10;
    
    // Simulate assessment
    let cat: SortingCategory = 'Grade A (Export / Premium)';
    let price = 1.8;
    let shelf = 6;

    if (newRipeness === 'unripe') {
      cat = 'Grade A (Export / Premium)';
      price = 1.7;
      shelf = 10;
    } else if (newRipeness === 'firm_ripe') {
      cat = 'Grade A (Export / Premium)';
      price = 1.9;
      shelf = 6;
    } else if (newRipeness === 'prime_eating') {
      cat = 'Grade B (Local Market Immediate)';
      price = 1.4;
      shelf = 3;
    } else if (newRipeness === 'overripe') {
      cat = 'Grade C (Pulping / Processing)';
      price = 0.75;
      shelf = 1;
    } else {
      cat = 'Discard / Compost';
      price = 0;
      shelf = 0;
    }

    const newItem: BatchItem = {
      id: `lot_${Date.now()}`,
      produceName: `${newProduceName} #${items.length + 1}`,
      weightKg: w,
      ripeness: newRipeness,
      category: cat,
      pricePerKgEst: price,
      shelfLifeDays: shelf
    };

    setItems([newItem, ...items]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Aggregated vendor metrics
  const totalWeightKg = items.reduce((acc, i) => acc + i.weightKg, 0);
  const totalValue = items.reduce((acc, i) => acc + (i.weightKg * i.pricePerKgEst), 0);
  const divertedFromWasteKg = items.filter(i => i.category !== 'Discard / Compost').reduce((acc, i) => acc + i.weightKg, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Vendor Market Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-xs text-stone-400">Total Produce Sorted</span>
          <p className="text-2xl font-bold text-stone-100 mt-1 tabular-nums">
            {totalWeightKg.toFixed(1)} <span className="text-sm font-normal text-stone-400">kg</span>
          </p>
          <span className="text-[11px] text-stone-500">{items.length} crates audited</span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-xs text-stone-400">Waste Diverted (Food Saved)</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            {divertedFromWasteKg.toFixed(1)} <span className="text-sm font-normal text-stone-400">kg</span>
          </p>
          <span className="text-[11px] text-emerald-400 font-medium">
            {totalWeightKg > 0 ? Math.round((divertedFromWasteKg / totalWeightKg) * 100) : 0}% recovery rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
          <span className="text-xs text-stone-400">Estimated Market Value</span>
          <p className="text-2xl font-bold text-amber-300 mt-1 tabular-nums">
            ${totalValue.toFixed(2)}
          </p>
          <span className="text-[11px] text-stone-500">Local stall & export revenue</span>
        </div>
      </div>

      {/* Manual Quick Add Form */}
      <form onSubmit={handleAddItem} className="p-4 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
            <PlusCircle size={16} className="text-emerald-400" />
            <span>Add Batch Crate</span>
          </h4>
          <span className="text-xs text-stone-400">Quick Manual or Camera Triage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-stone-400 font-medium block mb-1">Produce Name</label>
            <input
              type="text"
              value={newProduceName}
              onChange={e => setNewProduceName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Tomato, Avocado"
            />
          </div>

          <div>
            <label className="text-[11px] text-stone-400 font-medium block mb-1">Crate Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
              placeholder="15"
            />
          </div>

          <div>
            <label className="text-[11px] text-stone-400 font-medium block mb-1">Ripeness Grade</label>
            <select
              value={newRipeness}
              onChange={e => setNewRipeness(e.target.value as RipenessGrade)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-950 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="unripe">Unripe (Firm Green)</option>
              <option value="firm_ripe">Firm Ripe (Breaker)</option>
              <option value="prime_eating">Prime Table Ripe</option>
              <option value="overripe">Overripe (Pulping)</option>
              <option value="spoiled">Spoiled (Compost)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <PackageCheck size={14} />
            <span>Sort Crate into Category</span>
          </button>
        </div>
      </form>

      {/* Sorted Crates Inventory List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-200">Sorted Batch Inventory</h4>
          <button
            onClick={onExportCSV}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} />
            <span>Export Batch Ledger</span>
          </button>
        </div>

        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-10 rounded-full ${
                  item.category.includes('Grade A') ? 'bg-emerald-500' :
                  item.category.includes('Grade B') ? 'bg-amber-400' :
                  item.category.includes('Grade C') ? 'bg-orange-500' :
                  'bg-rose-500'
                }`} />

                <div>
                  <h5 className="text-xs font-bold text-stone-100">{item.produceName}</h5>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                    <span>{item.weightKg} kg</span>
                    <span>·</span>
                    <span className="text-stone-300">{item.category}</span>
                    <span>·</span>
                    <span>{item.shelfLifeDays}d Shelf</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-bold text-stone-100 tabular-nums">
                    ${(item.weightKg * item.pricePerKgEst).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    ${item.pricePerKgEst.toFixed(2)}/kg
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                  title="Remove from batch"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
