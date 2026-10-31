/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Jetpack Compose Inspired Status Badges
 * High-contrast visual indicators engineered for rapid visual recognition
 * and ease of use across different literacy levels in harsh outdoor sunlight.
 */

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

export type StatusBadgeTone = 'emerald' | 'amber' | 'rose' | 'blue' | 'neutral';

interface StatusBadgeProps {
  tone: StatusBadgeTone;
  label: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  sublabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  tone,
  label,
  iconOnly = false,
  size = 'md',
  sublabel
}) => {
  const toneStyles = {
    emerald: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      iconColor: 'text-emerald-400',
      solidBg: 'bg-emerald-600 text-white',
      Icon: CheckCircle2,
    },
    amber: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      iconColor: 'text-amber-400',
      solidBg: 'bg-amber-600 text-white',
      Icon: AlertTriangle,
    },
    rose: {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      iconColor: 'text-rose-400',
      solidBg: 'bg-rose-600 text-white',
      Icon: AlertOctagon,
    },
    blue: {
      bg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
      iconColor: 'text-sky-400',
      solidBg: 'bg-sky-600 text-white',
      Icon: Info,
    },
    neutral: {
      bg: 'bg-stone-800 border-stone-700 text-stone-300',
      iconColor: 'text-stone-400',
      solidBg: 'bg-stone-700 text-white',
      Icon: ShieldAlert,
    }
  };

  const style = toneStyles[tone] || toneStyles.neutral;
  const IconComponent = style.Icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-medium'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  if (iconOnly) {
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-xl p-2 border ${style.bg}`}
        title={label}
        aria-label={label}
      >
        <IconComponent size={iconSizes[size]} className={style.iconColor} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center rounded-xl border ${style.bg} ${sizeClasses[size]} select-none shadow-sm`}>
      <IconComponent size={iconSizes[size]} className={`shrink-0 ${style.iconColor}`} />
      <div className="flex flex-col text-left">
        <span className="font-semibold tracking-tight whitespace-nowrap">{label}</span>
        {sublabel && (
          <span className="text-[11px] opacity-80 whitespace-nowrap">{sublabel}</span>
        )}
      </div>
    </div>
  );
};
