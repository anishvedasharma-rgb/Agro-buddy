/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Visual Result Card Component
 * Low-text, visual presentation with color-coded status badges,
 * audio speech narration for multi-literacy support, and low-cost remedy instructions.
 */

import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  Shield, 
  Flame, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Save,
  Check
} from 'lucide-react';
import { 
  TensorProcessingResult, 
  PlantDiseaseDiagnosis, 
  SoilHealthReport, 
  ProduceQualityAssessment 
} from '../data-processing/types.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface VisualResultCardProps {
  result: TensorProcessingResult<PlantDiseaseDiagnosis | SoilHealthReport | ProduceQualityAssessment>;
  previewUrl?: string;
  onSaveToLog: () => void;
  isSaved?: boolean;
}

export const VisualResultCard: React.FC<VisualResultCardProps> = ({
  result,
  previewUrl,
  onSaveToLog,
  isSaved = false
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeRemedyIndex, setActiveRemedyIndex] = useState(0);

  const { data, inferenceTimeMs, hardwareDelegate, confidence } = result;

  // Text-to-speech audio reader for multi-literacy farmers
  const speakDiagnosis = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Determine domain of result
  const isPlant = 'diseaseName' in data;
  const isSoil = 'overallFertilityScore' in data;
  const isProduce = 'ripenessGrade' in data;

  return (
    <div className="w-full bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Banner: Diagnosis Title & Audio Readout */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isPlant && (
              <StatusBadge
                tone={
                  (data as PlantDiseaseDiagnosis).severity === 'healthy' ? 'emerald' :
                  (data as PlantDiseaseDiagnosis).severity === 'critical' || (data as PlantDiseaseDiagnosis).severity === 'severe' ? 'rose' :
                  'amber'
                }
                label={
                  (data as PlantDiseaseDiagnosis).severity === 'healthy' ? 'Healthy Crop' :
                  `${(data as PlantDiseaseDiagnosis).severity.toUpperCase()} ALERT`
                }
                size="sm"
              />
            )}
            {isSoil && (
              <StatusBadge
                tone={(data as SoilHealthReport).overallFertilityScore >= 75 ? 'emerald' : 'amber'}
                label={`Fertility: ${(data as SoilHealthReport).overallFertilityScore}/100`}
                size="sm"
              />
            )}
            {isProduce && (
              <StatusBadge
                tone={
                  (data as ProduceQualityAssessment).ripenessGrade === 'prime_eating' || (data as ProduceQualityAssessment).ripenessGrade === 'firm_ripe'
                    ? 'emerald'
                    : (data as ProduceQualityAssessment).ripenessGrade === 'spoiled' ? 'rose' : 'amber'
                }
                label={(data as ProduceQualityAssessment).sortingCategory.split(' ')[0] + ' ' + (data as ProduceQualityAssessment).sortingCategory.split(' ')[1]}
                size="sm"
              />
            )}

            {/* Hardware Telemetry Indicator */}
            <span className="text-[11px] text-stone-400 font-mono">
              {hardwareDelegate} · {inferenceTimeMs}ms
            </span>
          </div>

          <h3 className="text-xl font-bold text-stone-100 tracking-tight">
            {isPlant && (data as PlantDiseaseDiagnosis).diseaseName}
            {isSoil && `${(data as SoilHealthReport).soilTypeEst} Analysis`}
            {isProduce && `${(data as ProduceQualityAssessment).produceItem}: ${(data as ProduceQualityAssessment).ripenessGrade.replace('_', ' ').toUpperCase()}`}
          </h3>

          <p className="text-xs text-stone-400 mt-0.5">
            {isPlant && `${(data as PlantDiseaseDiagnosis).scientificPathogen} · ${Math.round(confidence * 100)}% Confidence`}
            {isSoil && `Test Method: ${(data as SoilHealthReport).testMethod}`}
            {isProduce && `Firmness: ${(data as ProduceQualityAssessment).firmnessEstimatedPsi} PSI · ${(data as ProduceQualityAssessment).sortingCategory}`}
          </p>
        </div>

        {/* Audio Speech Narration Button */}
        <button
          onClick={() => {
            let script = '';
            if (isPlant) {
              const p = data as PlantDiseaseDiagnosis;
              script = `Diagnosis: ${p.diseaseName}. Pathogen: ${p.scientificPathogen}. Severity is ${p.severity}. Recommended low cost remedy: ${p.lowCostRemedies[0]?.name}. ${p.lowCostRemedies[0]?.steps[0]}`;
            } else if (isSoil) {
              const s = data as SoilHealthReport;
              script = `Soil health analysis. Overall fertility score: ${s.overallFertilityScore} out of 100. Immediate recommendation: ${s.recommendedImmediateAction}`;
            } else if (isProduce) {
              const pr = data as ProduceQualityAssessment;
              script = `Produce ripeness assessment: ${pr.produceItem} is graded as ${pr.ripenessGrade}. Shelf life at room temperature is ${pr.shelfLifeAmbientDays} days. Market recommendation: ${pr.vendorMarketAdvice}`;
            }
            speakDiagnosis(script);
          }}
          className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center gap-2 ${
            isPlayingAudio 
              ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md' 
              : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
          }`}
          title="Listen in plain audio speech"
          aria-label="Listen in plain audio speech"
        >
          {isPlayingAudio ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span className="text-xs font-semibold">{isPlayingAudio ? 'Stop' : 'Listen'}</span>
        </button>
      </div>

      {/* Visual Specimen Preview & Gauges Row */}
      {previewUrl && (
        <div className="flex gap-4 items-center p-3 rounded-2xl bg-stone-950/60 border border-stone-800">
          <img 
            src={previewUrl} 
            alt="Scanned Specimen" 
            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-stone-800"
          />

          <div className="flex-1">
            {isPlant && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Affected Foliage Area</span>
                  <span className="font-semibold text-stone-200">{(data as PlantDiseaseDiagnosis).affectedLeafAreaPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (data as PlantDiseaseDiagnosis).affectedLeafAreaPercent > 20 ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (data as PlantDiseaseDiagnosis).affectedLeafAreaPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>Urgency: Act within {(data as PlantDiseaseDiagnosis).urgencyDaysToAct} days</span>
                  <span>{Math.round(confidence * 100)}% match</span>
                </div>
              </div>
            )}

            {isSoil && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Overall Fertility Index</span>
                  <span className="font-semibold text-emerald-400">{(data as SoilHealthReport).overallFertilityScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(data as SoilHealthReport).overallFertilityScore}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500">
                  <span>{(data as SoilHealthReport).soilTypeEst}</span>
                </div>
              </div>
            )}

            {isProduce && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Maturity / Ripeness Score</span>
                  <span className="font-semibold text-stone-200">{(data as ProduceQualityAssessment).ripenessScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-lime-500 via-amber-400 to-rose-500 transition-all duration-500"
                    style={{ width: `${(data as ProduceQualityAssessment).ripenessScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Ambient: {(data as ProduceQualityAssessment).shelfLifeAmbientDays} days</span>
                  <span>Chilled: {(data as ProduceQualityAssessment).shelfLifeChilledDays} days</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PLANT HEALTH DETAILS & LOW-COST REMEDIES */}
      {isPlant && (
        <div className="space-y-4">
          {/* Key Visual Signs (Visual low-text bullets) */}
          <div className="p-3 rounded-2xl bg-stone-950/40 border border-stone-800/80">
            <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">Key Visual Indicators</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(data as PlantDiseaseDiagnosis).keyVisualSigns.map((sign, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low-Cost Remedies Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Low-Cost Remedies (No Synthetic Chemical Needed)
              </h4>
              <span className="text-[11px] text-emerald-400 font-medium">100% Organic & Accessible</span>
            </div>

            {/* Remedy Tab Selector */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {(data as PlantDiseaseDiagnosis).lowCostRemedies.map((remedy, idx) => (
                <button
                  key={remedy.id}
                  onClick={() => setActiveRemedyIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeRemedyIndex === idx
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {remedy.visualIcon === 'droplet' && <Droplets size={14} />}
                  {remedy.visualIcon === 'shield' && <Shield size={14} />}
                  {remedy.visualIcon === 'flame' && <Flame size={14} />}
                  <span>{remedy.name.split(' ')[0]} {remedy.name.split(' ')[1]}</span>
                </button>
              ))}
            </div>

            {/* Active Remedy Card */}
            {((data as PlantDiseaseDiagnosis).lowCostRemedies[activeRemedyIndex] || (data as PlantDiseaseDiagnosis).lowCostRemedies[0]) && (
              <div className="p-4 rounded-2xl bg-stone-950/70 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <h5 className="text-sm font-bold text-emerald-400">
                    {(data as PlantDiseaseDiagnosis).lowCostRemedies[activeRemedyIndex]?.name}
                  </h5>
                  <span className="text-[11px] text-stone-400">
                    Prep: {(data as PlantDiseaseDiagnosis).lowCostRemedies[activeRemedyIndex]?.preparationTime}
                  </span>
                </div>

                {/* Ingredients */}
                <div>
                  <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Common Farm Ingredients:</span>
                  <ul className="mt-1 space-y-1">
                    {(data as PlantDiseaseDiagnosis).lowCostRemedies[activeRemedyIndex]?.ingredients.map((ing, i) => (
                      <li key={i} className="text-xs text-stone-200 flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preparation Steps */}
                <div>
                  <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Application Steps:</span>
                  <ol className="mt-1 space-y-1.5">
                    {(data as PlantDiseaseDiagnosis).lowCostRemedies[activeRemedyIndex]?.steps.map((st, i) => (
                      <li key={i} className="text-xs text-stone-300 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Prevention note */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                  <span className="font-semibold">Agronomist Tip: </span>
                  {(data as PlantDiseaseDiagnosis).lowCostRemedies[activeRemedyIndex]?.preventionTip}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SOIL HEALTH DETAILS */}
      {isSoil && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(data as SoilHealthReport).nutrients.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-200">{item.nutrient}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    item.level === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.level === 'Low' || item.level === 'Deficient' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-sky-500/20 text-sky-300'
                  }`}>
                    {item.level} ({item.estimatedPpmOrPh})
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">{item.impactOnCrop}</p>
                <div className="pt-1.5 border-t border-stone-800/80 text-[11px] text-emerald-400 font-medium">
                  Fix: {item.organicRemedy}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-amber-500/30">
            <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Recommended Soil Action</h5>
            <p className="text-xs text-stone-200">{(data as SoilHealthReport).recommendedImmediateAction}</p>
            <p className="text-[11px] text-stone-400 mt-1.5">
              <span className="font-medium text-stone-300">Compost Blend: </span>
              {(data as SoilHealthReport).recommendedCompostBlend}
            </p>
          </div>
        </div>
      )}

      {/* PRODUCE QUALITY DETAILS */}
      {isProduce && (
        <div className="space-y-4">
          {/* Market Sorting Action Box */}
          <div className="p-4 rounded-2xl bg-stone-950/70 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 uppercase tracking-wider">Vendor Sorting Grade</span>
                <h4 className="text-base font-bold text-stone-100">{(data as ProduceQualityAssessment).sortingCategory}</h4>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-400">Price Retention</span>
                <p className="text-base font-bold text-emerald-400">{(data as ProduceQualityAssessment).resalePriceRetentionPercent}%</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 pt-1 border-t border-stone-800">
              {(data as ProduceQualityAssessment).vendorMarketAdvice}
            </p>
          </div>

          {/* Shelf Life Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-stone-950/50 border border-stone-800 text-center">
              <span className="text-[11px] text-stone-400 block">Ambient Stall Shelf Life</span>
              <span className="text-xl font-bold text-amber-400 mt-0.5 block">
                {(data as ProduceQualityAssessment).shelfLifeAmbientDays} Days
              </span>
              <span className="text-[10px] text-stone-500">at 20°C - 24°C room temp</span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950/50 border border-stone-800 text-center">
              <span className="text-[11px] text-stone-400 block">Cold Storage / Chilled</span>
              <span className="text-xl font-bold text-sky-400 mt-0.5 block">
                {(data as ProduceQualityAssessment).shelfLifeChilledDays} Days
              </span>
              <span className="text-[10px] text-stone-500">at 10°C - 12°C cool shed</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action: Save to Offline Field Log */}
      <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
        <span className="text-xs text-stone-500">
          Stored locally on device · No internet needed
        </span>

        <button
          onClick={onSaveToLog}
          disabled={isSaved}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
            isSaved
              ? 'bg-stone-800 text-emerald-400 border border-emerald-500/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
          }`}
        >
          {isSaved ? (
            <>
              <Check size={14} />
              <span>Saved in Offline Log</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save to Field Log</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
