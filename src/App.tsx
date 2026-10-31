/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Smart Agri & Produce Quality Inspector 🌾
 * Offline-first visual agricultural assistant operating 100% locally on device.
 * Architected with clean separated libraries: data-processing, ui-components, and api-communication.
 */

import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  FlaskConical, 
  Apple, 
  Layers, 
  ClipboardList, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Radio, 
  Info,
  ChevronRight,
  Download,
  Flame,
  ArrowRight
} from 'lucide-react';

// 1. Data Processing Library
import { 
  InspectionDomain, 
  TensorProcessingResult, 
  PlantDiseaseDiagnosis, 
  SoilHealthReport, 
  ProduceQualityAssessment,
  dispatchTensorCoroutine,
  CoroutineState
} from './libraries/data-processing/index.ts';

// 2. UI Components Library
import { 
  TopBar, 
  MobileBottomTabBar, 
  AppNavTab, 
  CameraViewfinder, 
  VisualResultCard, 
  PresetSamplesGallery, 
  SampleSpecimen, 
  FIELD_SAMPLES,
  BatchSortingGrid, 
  InspectionLogView, 
  OfflineSyncModal,
  StatusBadge,
  KotlinStudioView
} from './libraries/ui-components/index.ts';

// 3. API Communication & Offline Storage Library
import { 
  OfflineStorageEngine, 
  SyncQueueManager, 
  RemoteAdvisoryAPI, 
  useConnectivity, 
  InspectionRecord 
} from './libraries/api-communication/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppNavTab>('plant_health');
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  const [isProcessing, setIsProcessing] = useState(false);
  const [coroutineState, setCoroutineState] = useState<CoroutineState>({
    isProcessing: false,
    stage: 'idle',
    progressPercent: 0
  });

  // Current analysis result & captured image preview
  const [currentResult, setCurrentResult] = useState<TensorProcessingResult<PlantDiseaseDiagnosis | SoilHealthReport | ProduceQualityAssessment> | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | undefined>(undefined);
  const [isSavedInLog, setIsSavedInLog] = useState(false);

  // Modals & History
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [records, setRecords] = useState<InspectionRecord[]>([]);

  // Real-time connectivity telemetry
  const connectivity = useConnectivity();

  // Load records on mount
  useEffect(() => {
    setRecords(OfflineStorageEngine.getRecords());
  }, []);

  const refreshRecords = () => {
    setRecords(OfflineStorageEngine.getRecords());
  };

  // Convert current tab to inspection domain
  const activeDomain: InspectionDomain = 
    activeTab === 'soil_health' ? 'soil_health' :
    activeTab === 'produce_quality' ? 'produce_quality' : 
    'plant_health';

  // Process image using Coroutine Worker & local TFLite engine
  const handleProcessImage = async (
    imageData: ImageData, 
    previewUrl?: string, 
    padColors?: { nHex?: string; pHex?: string; kHex?: string }
  ) => {
    setIsProcessing(true);
    setCurrentPreviewUrl(previewUrl);
    setIsSavedInLog(false);

    try {
      const result = await dispatchTensorCoroutine(
        activeDomain,
        imageData,
        selectedCrop,
        padColors,
        (progress) => setCoroutineState(progress)
      );

      setCurrentResult(result);

      // Auto-save inspection to offline record log
      const newRecord: InspectionRecord = {
        id: `rec_${Date.now()}`,
        timestamp: Date.now(),
        domain: activeDomain,
        thumbnailDataUrl: previewUrl,
        cropOrItemName: selectedCrop,
        primaryResultTitle: 
          'diseaseName' in result.data ? result.data.diseaseName :
          'overallFertilityScore' in result.data ? `Soil Fertility (${result.data.overallFertilityScore}/100)` :
          `${(result.data as ProduceQualityAssessment).produceItem} (${(result.data as ProduceQualityAssessment).ripenessGrade})`,
        statusBadgeVariant: 
          'diseaseName' in result.data 
            ? (result.data.severity === 'healthy' ? 'emerald' : result.data.severity === 'critical' ? 'rose' : 'amber')
            : 'overallFertilityScore' in result.data 
              ? (result.data.overallFertilityScore >= 75 ? 'emerald' : 'amber')
              : ((result.data as ProduceQualityAssessment).ripenessGrade === 'prime_eating' ? 'emerald' : 'amber'),
        statusBadgeLabel: 
          'diseaseName' in result.data 
            ? (result.data.severity === 'healthy' ? 'Healthy' : `${result.data.severity.toUpperCase()}`)
            : 'overallFertilityScore' in result.data 
              ? `${result.data.overallFertilityScore}/100 Score`
              : `${(result.data as ProduceQualityAssessment).sortingCategory.split(' ')[0]} ${(result.data as ProduceQualityAssessment).sortingCategory.split(' ')[1]}`,
        syncState: 'pending_sync',
        farmLocation: {
          plotName: 'Field Block A'
        },
        plantDiagnosis: 'diseaseName' in result.data ? (result.data as PlantDiseaseDiagnosis) : undefined,
        soilReport: 'overallFertilityScore' in result.data ? (result.data as SoilHealthReport) : undefined,
        produceAssessment: 'ripenessGrade' in result.data ? (result.data as ProduceQualityAssessment) : undefined
      };

      OfflineStorageEngine.addRecord(newRecord);
      refreshRecords();
      setIsSavedInLog(true);

    } catch (err) {
      console.error('Error processing tensor:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Select sample from preset library
  const handleSelectSample = (sample: SampleSpecimen, imageData: ImageData, dataUrl: string) => {
    setSelectedCrop(sample.cropOrItem);
    handleProcessImage(imageData, dataUrl, sample.padColors);
  };

  // Export inspection CSV
  const handleExportCSV = () => {
    RemoteAdvisoryAPI.downloadInspectionCSV();
  };

  // View specific historic record in detail
  const handleSelectHistoricRecord = (record: InspectionRecord) => {
    if (record.plantDiagnosis) {
      setActiveTab('plant_health');
      setCurrentResult({
        data: record.plantDiagnosis,
        inferenceTimeMs: 24,
        modelName: 'MobileNetV3-AgriPathology-INT8',
        hardwareDelegate: 'NPU',
        confidence: record.plantDiagnosis.confidenceScore,
        timestamp: record.timestamp
      });
      setCurrentPreviewUrl(record.thumbnailDataUrl);
      setIsSavedInLog(true);
    } else if (record.soilReport) {
      setActiveTab('soil_health');
      setCurrentResult({
        data: record.soilReport,
        inferenceTimeMs: 19,
        modelName: 'SoilColorimeter-NPK-INT8',
        hardwareDelegate: 'NPU',
        confidence: 0.94,
        timestamp: record.timestamp
      });
      setCurrentPreviewUrl(record.thumbnailDataUrl);
      setIsSavedInLog(true);
    } else if (record.produceAssessment) {
      setActiveTab('produce_quality');
      setCurrentResult({
        data: record.produceAssessment,
        inferenceTimeMs: 28,
        modelName: 'EfficientNet-ProduceRipeness-INT8',
        hardwareDelegate: 'NPU',
        confidence: 0.95,
        timestamp: record.timestamp
      });
      setCurrentPreviewUrl(record.thumbnailDataUrl);
      setIsSavedInLog(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans pb-20 md:pb-12">
      {/* 1. Header (Adheres to 3-Zone Top Bar Contract) */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isOnline={connectivity.isOnline}
        pendingCount={connectivity.pendingSyncCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* Domain Banner / Sub-Header Context Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
              <span>Smart Agriculture & Produce Quality</span>
              <span>·</span>
              <span className="text-stone-400 font-mono text-[11px]">100% Offline Edge Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              {activeTab === 'plant_health' && 'Pre-Harvest Plant Health & Foliar Pathology'}
              {activeTab === 'soil_health' && 'Soil Health & N-P-K Nutrient Check'}
              {activeTab === 'produce_quality' && 'Post-Harvest Ripeness & Spoilage Grader'}
              {activeTab === 'batch_sorter' && 'Produce Sorting Station for Market Vendors'}
              {activeTab === 'inspection_log' && 'Field Inspection History & Co-op Audit Log'}
              {activeTab === 'kotlin_studio' && 'Kotlin Multiplatform Architecture & Source Code'}
            </h1>
          </div>

          {/* Quick Preset Specimen Launcher Button */}
          {activeTab !== 'batch_sorter' && activeTab !== 'inspection_log' && activeTab !== 'kotlin_studio' && (
            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-850 border border-emerald-500/30 text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all hover:border-emerald-500/60 shadow-sm shrink-0 self-start sm:self-auto"
            >
              <Sparkles size={16} className="text-emerald-400" />
              <span>Load Authentic Specimen Presets</span>
            </button>
          )}
        </div>

        {/* 2. INSPECTION WORKFLOW (Plant Health, Soil, Produce) */}
        {(activeTab === 'plant_health' || activeTab === 'soil_health' || activeTab === 'produce_quality') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Camera Viewfinder & Alignment Guides */}
            <div className="lg:col-span-7 space-y-4">
              {/* Crop / Target Selection Segmented Bar */}
              {activeTab === 'plant_health' && (
                <div className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-2xl overflow-x-auto">
                  <span className="text-xs text-stone-500 px-3 font-medium">Crop:</span>
                  {['Tomato', 'Potato', 'Apple', 'Maize', 'Bell Pepper'].map(crop => (
                    <button
                      key={crop}
                      onClick={() => setSelectedCrop(crop)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                        selectedCrop === crop
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'produce_quality' && (
                <div className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-2xl overflow-x-auto">
                  <span className="text-xs text-stone-500 px-3 font-medium">Item:</span>
                  {['Tomato', 'Banana', 'Mango', 'Apple', 'Avocado'].map(item => (
                    <button
                      key={item}
                      onClick={() => setSelectedCrop(item)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                        selectedCrop === item
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {/* CameraX Viewfinder with Alignment Guides */}
              <CameraViewfinder
                domain={activeDomain}
                isProcessing={isProcessing}
                onCaptureImageData={(data, url) => handleProcessImage(data, url)}
                onOpenPresetGallery={() => setIsPresetModalOpen(true)}
              />

              {/* Background Kotlin Coroutine Thread Status */}
              {coroutineState.isProcessing && (
                <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 animate-in fade-in">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-300 font-medium flex items-center gap-2">
                      <Cpu size={14} className="text-emerald-400 animate-spin" />
                      <span>
                        {coroutineState.stage === 'allocating_tensors' && 'Allocating Local Tensors on Background Coroutine...'}
                        {coroutineState.stage === 'normalizing_pixels' && 'Normalizing Color Histogram & Texture Tensors...'}
                        {coroutineState.stage === 'npu_forward_pass' && 'Running Quantized INT8 Inference on Local NPU...'}
                      </span>
                    </span>
                    <span className="font-mono text-emerald-400">{coroutineState.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${coroutineState.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Field Instructions */}
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs space-y-2">
                <h4 className="font-semibold text-stone-200 flex items-center gap-2">
                  <Info size={14} className="text-emerald-400" />
                  <span>Field Operator Guide</span>
                </h4>
                <p className="text-stone-400">
                  {activeTab === 'plant_health' && 'Place single crop leaf flat inside the leaf contour HUD. Ensure good natural daylight. Avoid extreme glare.'}
                  {activeTab === 'soil_health' && 'Align the 3 reactive pads (N-P-K) of the test strip inside the alignment window. Hold strip 15cm from lens against neutral soil.'}
                  {activeTab === 'produce_quality' && 'Fit harvested fruit or vegetable inside the sizing ring. Rotates specimen if checking for soft rot blemishes.'}
                </p>
              </div>
            </div>

            {/* Right Column: Visual Result Card & Diagnosis */}
            <div className="lg:col-span-5 space-y-4">
              {currentResult ? (
                <VisualResultCard
                  result={currentResult}
                  previewUrl={currentPreviewUrl}
                  onSaveToLog={() => setIsSavedInLog(true)}
                  isSaved={isSavedInLog}
                />
              ) : (
                <div className="p-8 rounded-3xl bg-stone-900/70 border border-stone-800 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    {activeTab === 'plant_health' && <Sprout size={32} />}
                    {activeTab === 'soil_health' && <FlaskConical size={32} />}
                    {activeTab === 'produce_quality' && <Apple size={32} />}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-stone-100">Ready to Inspect</h3>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                      Capture an image with the CameraX viewfinder or choose from pre-calibrated agricultural specimens to run on-device inference.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPresetModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    <span>Select Authentic Field Sample</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. VENDOR BATCH SORTER TAB */}
        {activeTab === 'batch_sorter' && (
          <BatchSortingGrid onExportCSV={handleExportCSV} />
        )}

        {/* 4. AUDIT & FIELD INSPECTION LOG TAB */}
        {activeTab === 'inspection_log' && (
          <InspectionLogView
            records={records}
            onRefreshRecords={refreshRecords}
            onSelectRecordForDetail={handleSelectHistoricRecord}
            onExportCSV={handleExportCSV}
          />
        )}

        {/* 5. KOTLIN ANDROID CODE STUDIO TAB */}
        {activeTab === 'kotlin_studio' && (
          <KotlinStudioView />
        )}
      </main>

      {/* 5. Mobile Bottom Tab Bar (Ergonomic Thumb Zones) */}
      <MobileBottomTabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={connectivity.pendingSyncCount}
      />

      {/* 6. Modals */}
      <PresetSamplesGallery
        isOpen={isPresetModalOpen}
        activeDomain={activeDomain}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      <OfflineSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        telemetry={connectivity}
        onSyncComplete={refreshRecords}
      />
    </div>
  );
}
