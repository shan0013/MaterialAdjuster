import React, { useState } from 'react';
import { ImageWorkspace } from './components/MaterialAdjuster/ImageWorkspace';
import { ControlPanel } from './components/MaterialAdjuster/ControlPanel';
import { AdjustmentState, DEFAULT_ADJUSTMENTS } from './types';
import { readFileAsDataURL, downloadCanvas } from './utils/imageUtils';
import { Layers, MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  // Start with null to show upload screen immediately
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<AdjustmentState>(DEFAULT_ADJUSTMENTS);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isPickingColor, setIsPickingColor] = useState(false);
  const [isTilingMode, setIsTilingMode] = useState(false);
  const [isMirrorTiling, setIsMirrorTiling] = useState(false); 
  const [isSeamlessTiling, setIsSeamlessTiling] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await readFileAsDataURL(e.target.files[0]);
        setImageSrc(url);
        setAdjustments(DEFAULT_ADJUSTMENTS); // Reset on new image
        setIsCompareMode(false);
        setIsPickingColor(false);
        setIsTilingMode(false);
        setIsMirrorTiling(false);
        setIsSeamlessTiling(false);
      } catch (err) {
        console.error("Failed to load image", err);
      }
    }
  };

  const handleLoadError = () => {
    console.warn("Image failed to load. Reverting to upload state.");
    setImageSrc(null);
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Create a sensible filename
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadCanvas(canvas, `lumina-texture-${timestamp}.png`);
    }
  };

  // White Balance Calculation Logic
  const handleColorPicked = (rgb: { r: number, g: number, b: number }) => {
    const r = Math.max(rgb.r, 1);
    const g = Math.max(rgb.g, 1);
    const b = Math.max(rgb.b, 1);

    const maxVal = Math.max(r, g, b);

    const scaleR = maxVal / r;
    const scaleG = maxVal / g;
    const scaleB = maxVal / b;

    const newRed = Math.min(Math.round(scaleR * 100), 200);
    const newGreen = Math.min(Math.round(scaleG * 100), 200);
    const newBlue = Math.min(Math.round(scaleB * 100), 200);

    setAdjustments(prev => ({
      ...prev,
      red: newRed,
      green: newGreen,
      blue: newBlue
    }));

    setIsPickingColor(false);
  };

  // State Management for Tiling Modes (Mutual Exclusivity)
  const handleSetMirrorTiling = (val: boolean) => {
    setIsMirrorTiling(val);
    if (val) setIsSeamlessTiling(false);
  };

  const handleSetSeamlessTiling = (val: boolean) => {
    setIsSeamlessTiling(val);
    if (val) setIsMirrorTiling(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-6 justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white flex items-center">
            <a 
              href="https://www.threads.net/@33.shan.design?hl=zh-tw"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              材質調整小幫手
            </a>
            <span className="text-slate-500 font-normal ml-2 text-sm">Texture Lab</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://lin.ee/aOOWimo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors shadow-sm shadow-green-900/20 group"
          >
            <MessageCircle size={12} className="fill-current" />
            <span>LINE 聯繫 33.Shan</span>
          </a>

          <a 
            href="https://www.threads.net/@33.shan.design?hl=zh-tw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 group"
            title="Designed by 33.Shan"
          >
            <span className="opacity-50 group-hover:opacity-100 transition-opacity">Designed by</span>
            <span className="font-medium border-b border-transparent group-hover:border-cyan-400/50">33.Shan</span>
          </a>
          <div className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            v1.3.2
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <ImageWorkspace 
          imageSrc={imageSrc} 
          adjustments={adjustments}
          onImageUpload={handleImageUpload}
          isCompareMode={isCompareMode}
          isPickingColor={isPickingColor}
          onPickColor={handleColorPicked}
          isTilingMode={isTilingMode}
          isMirrorTiling={isMirrorTiling}
          isSeamlessTiling={isSeamlessTiling}
          onLoadError={handleLoadError}
        />
        <ControlPanel 
          key={imageSrc || 'panel-reset'}
          imageSrc={imageSrc}
          adjustments={adjustments} 
          setAdjustments={setAdjustments}
          onDownload={handleDownload}
          onCompareToggle={() => setIsCompareMode(!isCompareMode)}
          isCompareMode={isCompareMode}
          isPickingColor={isPickingColor}
          setIsPickingColor={setIsPickingColor}
          isTilingMode={isTilingMode}
          setIsTilingMode={setIsTilingMode}
          isMirrorTiling={isMirrorTiling}
          setIsMirrorTiling={handleSetMirrorTiling}
          isSeamlessTiling={isSeamlessTiling}
          setIsSeamlessTiling={handleSetSeamlessTiling}
        />
      </main>
    </div>
  );
};

export default App;