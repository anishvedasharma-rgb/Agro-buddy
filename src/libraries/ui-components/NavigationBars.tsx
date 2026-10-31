/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Top Bar & Mobile Thumb-Zone Navigation
 * Adheres strictly to the 3-Zone Top Bar Contract on desktop
 * and Jetpack Compose thumb navigation on mobile devices.
 */

import React from 'react';
import { 
  Sprout, 
  FlaskConical, 
  Apple, 
  Layers, 
  ClipboardList, 
  Wifi, 
  WifiOff, 
  Share2 
} from 'lucide-react';
import { InspectionDomain } from '../data-processing/types.ts';

export type AppNavTab = 'plant_health' | 'soil_health' | 'produce_quality' | 'batch_sorter' | 'inspection_log' | 'kotlin_studio';

interface TopBarProps {
  activeTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  onOpenSyncModal: () => void;
  isOnline: boolean;
  pendingCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSyncModal,
  isOnline,
  pendingCount
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-stone-900/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('plant_health')}
          className="text-lg font-bold tracking-tight text-stone-100 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>SmartAgri Inspector</span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
          <button
            onClick={() => onSelectTab('plant_health')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'plant_health'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-stone-300 hover:text-stone-100 border-transparent'
            }`}
          >
            Plant Health
          </button>

          <button
            onClick={() => onSelectTab('soil_health')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'soil_health'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-stone-300 hover:text-stone-100 border-transparent'
            }`}
          >
            Soil N-P-K
          </button>

          <button
            onClick={() => onSelectTab('produce_quality')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'produce_quality'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-stone-300 hover:text-stone-100 border-transparent'
            }`}
          >
            Produce
          </button>

          <button
            onClick={() => onSelectTab('batch_sorter')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'batch_sorter'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-stone-300 hover:text-stone-100 border-transparent'
            }`}
          >
            Sorter
          </button>

          <button
            onClick={() => onSelectTab('inspection_log')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'inspection_log'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-stone-300 hover:text-stone-100 border-transparent'
            }`}
          >
            Field Log
          </button>

          <button
            onClick={() => onSelectTab('kotlin_studio')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              activeTab === 'kotlin_studio'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-stone-300 hover:text-stone-100 border-transparent'
            }`}
          >
            Kotlin Code
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSyncModal}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-2 border shadow-sm ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/60'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            {isOnline ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-amber-400" />}
            <span>{isOnline ? 'Co-op Online' : '100% Offline'}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-500 text-stone-950 text-[10px] font-bold rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

interface MobileBottomTabBarProps {
  activeTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  pendingCount: number;
}

export const MobileBottomTabBar: React.FC<MobileBottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount
}) => {
  const tabs: Array<{
    id: AppNavTab;
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number;
  }> = [
    { id: 'plant_health', label: 'Plant', Icon: Sprout },
    { id: 'soil_health', label: 'Soil NPK', Icon: FlaskConical },
    { id: 'produce_quality', label: 'Produce', Icon: Apple },
    { id: 'batch_sorter', label: 'Sorter', Icon: Layers },
    { id: 'kotlin_studio', label: 'Kotlin', Icon: ClipboardList }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 grid grid-cols-5 items-center h-16 pb-safe px-1 select-none">
      {tabs.map(({ id, label, Icon, badge }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onSelectTab(id)}
            className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center transition-colors relative ${
              isActive ? 'text-emerald-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className="relative">
              <Icon size={20} className={isActive ? 'scale-110 transition-transform' : ''} />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-emerald-500 text-stone-950 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-[64px]">
              {label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
