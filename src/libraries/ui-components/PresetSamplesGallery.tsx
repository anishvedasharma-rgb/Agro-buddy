/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Preset Botanical & Agricultural Samples Gallery
 * Programmatically renders authentic field specimens onto pixel canvases
 * for testing and offline field demonstrations.
 */

import React, { useRef } from 'react';
import { InspectionDomain } from '../data-processing/types.ts';
import { Sparkles, X } from 'lucide-react';

export interface SampleSpecimen {
  id: string;
  domain: InspectionDomain;
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeColor: 'emerald' | 'amber' | 'rose';
  cropOrItem: string;
  renderCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  padColors?: { nHex?: string; pHex?: string; kHex?: string };
}

export const FIELD_SAMPLES: SampleSpecimen[] = [
  // 1. Plant Leaf Samples
  {
    id: 'sample_tomato_early_blight',
    domain: 'plant_health',
    cropOrItem: 'Tomato',
    title: 'Tomato Early Blight',
    subtitle: 'Concentric target spots & chlorotic yellow halo',
    badgeLabel: 'Moderate Blight',
    badgeColor: 'amber',
    renderCanvas: (ctx, w, h) => {
      // Background
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      // Draw leaf shape
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.42);
      ctx.bezierCurveTo(w * 0.45, -h * 0.25, w * 0.42, h * 0.25, 0, h * 0.42);
      ctx.bezierCurveTo(-w * 0.42, h * 0.25, -w * 0.45, -h * 0.25, 0, -h * 0.42);
      ctx.fillStyle = '#2d6a4f';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1b4332';
      ctx.stroke();

      // Main vein
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.38);
      ctx.lineTo(0, h * 0.38);
      ctx.strokeStyle = '#52b788';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Side veins
      for (let y = -h * 0.25; y <= h * 0.25; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w * 0.25, y - 18);
        ctx.moveTo(0, y);
        ctx.lineTo(-w * 0.25, y - 18);
        ctx.strokeStyle = '#40916c';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Early Blight Target Ring Lesions (Alternaria solani)
      const lesions = [
        { x: -w * 0.12, y: -h * 0.08, r: 24 },
        { x: w * 0.15, y: h * 0.12, r: 28 },
        { x: -w * 0.08, y: h * 0.22, r: 18 }
      ];

      lesions.forEach(l => {
        // Yellow chlorotic halo
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(217, 119, 6, 0.55)';
        ctx.fill();

        // Outer brown zone
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
        ctx.fillStyle = '#451a03';
        ctx.fill();

        // Inner concentric rings
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#290f03';
        ctx.fill();
      });

      ctx.restore();
    }
  },
  {
    id: 'sample_tomato_late_blight',
    domain: 'plant_health',
    cropOrItem: 'Tomato',
    title: 'Tomato Late Blight',
    subtitle: 'Dark water-soaked purplish necrotic collapse',
    badgeLabel: 'Severe Blight',
    badgeColor: 'rose',
    renderCanvas: (ctx, w, h) => {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.42);
      ctx.bezierCurveTo(w * 0.45, -h * 0.25, w * 0.42, h * 0.25, 0, h * 0.42);
      ctx.bezierCurveTo(-w * 0.42, h * 0.25, -w * 0.45, -h * 0.25, 0, -h * 0.42);
      ctx.fillStyle = '#245a43';
      ctx.fill();

      // Large late blight purplish-brown rot sections
      ctx.beginPath();
      ctx.arc(-w * 0.05, -h * 0.05, 55, 0, Math.PI * 2);
      ctx.fillStyle = '#2b1d16';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(w * 0.12, h * 0.15, 45, 0, Math.PI * 2);
      ctx.fillStyle = '#1c120c';
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'sample_tomato_healthy',
    domain: 'plant_health',
    cropOrItem: 'Tomato',
    title: 'Healthy Tomato Foliage',
    subtitle: 'Vibrant chlorophyll, uniform green and intact veins',
    badgeLabel: 'Optimal Health',
    badgeColor: 'emerald',
    renderCanvas: (ctx, w, h) => {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.42);
      ctx.bezierCurveTo(w * 0.45, -h * 0.25, w * 0.42, h * 0.25, 0, h * 0.42);
      ctx.bezierCurveTo(-w * 0.42, h * 0.25, -w * 0.45, -h * 0.25, 0, -h * 0.42);
      ctx.fillStyle = '#15803d';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#14532d';
      ctx.stroke();

      // Main central vein
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.38);
      ctx.lineTo(0, h * 0.38);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.stroke();

      for (let y = -h * 0.28; y <= h * 0.28; y += 26) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w * 0.28, y - 16);
        ctx.moveTo(0, y);
        ctx.lineTo(-w * 0.28, y - 16);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  // 2. Soil Health Test Strip Samples
  {
    id: 'sample_soil_3pad_strip',
    domain: 'soil_health',
    cropOrItem: 'Soil Test Strip',
    title: 'Soil N-P-K Test Strip',
    subtitle: '3-Pad reactive chemical indicator on field soil sample',
    badgeLabel: 'NPK Analysis',
    badgeColor: 'emerald',
    padColors: { nHex: '#F8B67D', pHex: '#3B72AF', kHex: '#A34F18' },
    renderCanvas: (ctx, w, h) => {
      // Dark agricultural soil background
      ctx.fillStyle = '#29201a';
      ctx.fillRect(0, 0, w, h);

      // Soil texture particles
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = Math.random() > 0.5 ? '#1f1814' : '#3d3027';
        ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
      }

      // White test strip backing
      const sw = w * 0.72;
      const sh = 56;
      const sx = (w - sw) / 2;
      const sy = (h - sh) / 2;

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, 8);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pad 1: Nitrogen (N) - Orange-peach
      ctx.fillStyle = '#F8B67D';
      ctx.beginPath();
      ctx.roundRect(sx + sw * 0.12, sy + 10, 42, 36, 4);
      ctx.fill();

      // Pad 2: Phosphorus (P) - Royal Blue
      ctx.fillStyle = '#3B72AF';
      ctx.beginPath();
      ctx.roundRect(sx + sw * 0.42, sy + 10, 42, 36, 4);
      ctx.fill();

      // Pad 3: Potassium (K) - Terracotta Rust
      ctx.fillStyle = '#A34F18';
      ctx.beginPath();
      ctx.roundRect(sx + sw * 0.72, sy + 10, 42, 36, 4);
      ctx.fill();
    }
  },

  // 3. Post-Harvest Produce Samples
  {
    id: 'sample_tomato_firm_ripe',
    domain: 'produce_quality',
    cropOrItem: 'Tomato',
    title: 'Grade A Firm Ripe Tomato',
    subtitle: 'Optimal turning stage, 6 days shelf life, zero bruises',
    badgeLabel: 'Grade A Export',
    badgeColor: 'emerald',
    renderCanvas: (ctx, w, h) => {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Tomato body
      ctx.beginPath();
      ctx.arc(0, 8, 64, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

      // Breaker highlight
      ctx.beginPath();
      ctx.arc(-22, -15, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();

      // Calyx / green stem
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(0, -70);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Calyx leaves
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(Math.cos(angle) * 22, -56 + Math.sin(angle) * 12);
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();
    }
  },
  {
    id: 'sample_produce_unripe_green',
    domain: 'produce_quality',
    cropOrItem: 'Tomato',
    title: 'Unripe Green Tomato',
    subtitle: 'Firm green stage, 10+ days shelf life for transport',
    badgeLabel: 'Unripe Firm',
    badgeColor: 'amber',
    renderCanvas: (ctx, w, h) => {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Unripe green body
      ctx.beginPath();
      ctx.arc(0, 8, 64, 0, Math.PI * 2);
      ctx.fillStyle = '#65a30d';
      ctx.fill();

      // Calyx stem
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(0, -70);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: 'sample_produce_overripe_bruised',
    domain: 'produce_quality',
    cropOrItem: 'Tomato',
    title: 'Overripe Bruised Produce',
    subtitle: 'Softening flesh with surface defect, divert to pulping',
    badgeLabel: 'Grade C Pulp',
    badgeColor: 'rose',
    renderCanvas: (ctx, w, h) => {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Deep dark red soft body
      ctx.beginPath();
      ctx.arc(0, 8, 64, 0, Math.PI * 2);
      ctx.fillStyle = '#991b1b';
      ctx.fill();

      // Soft rot blemish
      ctx.beginPath();
      ctx.arc(20, 16, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#450a0a';
      ctx.fill();

      ctx.restore();
    }
  }
];

interface PresetSamplesGalleryProps {
  isOpen: boolean;
  activeDomain: InspectionDomain;
  onClose: () => void;
  onSelectSample: (sample: SampleSpecimen, imageData: ImageData, dataUrl: string) => void;
}

export const PresetSamplesGallery: React.FC<PresetSamplesGalleryProps> = ({
  isOpen,
  activeDomain,
  onClose,
  onSelectSample
}) => {
  if (!isOpen) return null;

  const relevantSamples = FIELD_SAMPLES.filter(s => s.domain === activeDomain);

  const handleChoose = (sample: SampleSpecimen) => {
    // Render to offline canvas and extract genuine ImageData
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sample.renderCanvas(ctx, 320, 240);
    const imageData = ctx.getImageData(0, 0, 320, 240);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    onSelectSample(sample, imageData, dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-100">Agricultural Field Presets</h3>
              <p className="text-xs text-stone-400">Authentic botanical & soil specimens for 100% offline testing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of specimens */}
        <div className="overflow-y-auto py-3 space-y-3 pr-1">
          {relevantSamples.map(sample => (
            <div
              key={sample.id}
              onClick={() => handleChoose(sample)}
              className="group flex items-center gap-3.5 p-3 rounded-2xl bg-stone-950/60 hover:bg-stone-800/80 border border-stone-800/80 hover:border-emerald-500/40 cursor-pointer transition-all active:scale-[0.99]"
            >
              {/* Miniature specimen canvas preview */}
              <SampleCanvasThumbnail sample={sample} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-stone-100 group-hover:text-emerald-300 transition-colors truncate">
                    {sample.title}
                  </h4>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    sample.badgeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-300' :
                    sample.badgeColor === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {sample.badgeLabel}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{sample.subtitle}</p>
                <div className="text-[11px] text-stone-500 mt-1">
                  <span>{sample.cropOrItem}</span>
                  <span className="mx-1.5">·</span>
                  <span>Authentic Tensor Specimen</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 text-center">
          <p className="text-[11px] text-stone-500">
            Click any specimen to run the local TFLite neural model without internet access.
          </p>
        </div>
      </div>
    </div>
  );
};

const SampleCanvasThumbnail: React.FC<{ sample: SampleSpecimen }> = ({ sample }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        sample.renderCanvas(ctx, 120, 90);
      }
    }
  }, [sample]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={90}
      className="w-20 h-16 rounded-xl object-cover shrink-0 border border-stone-800 bg-stone-900"
    />
  );
};
