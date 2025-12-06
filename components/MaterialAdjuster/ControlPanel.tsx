import React from 'react';
import { AdjustmentState, DEFAULT_ADJUSTMENTS } from '../../types';
import { Slider } from '../UI/Slider';
import { Sun, Contrast, Droplet, Palette, Thermometer, Activity, Download, RotateCcw, Eye, EyeOff, GripHorizontal, Pipette, Triangle, Grid3X3, FlipVertical, Scaling, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  adjustments: AdjustmentState;
  setAdjustments: React.Dispatch<React.SetStateAction<AdjustmentState>>;
  onDownload: () => void;
  onCompareToggle: () => void;
  isCompareMode: boolean;
  imageSrc: string | null;
  isPickingColor: boolean;
  setIsPickingColor: (v: boolean) => void;
  isTilingMode: boolean;
  setIsTilingMode: (v: boolean) => void;
  isMirrorTiling: boolean;
  setIsMirrorTiling: (v: boolean) => void;
  isSeamlessTiling: boolean;
  setIsSeamlessTiling: (v: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  adjustments,
  setAdjustments,
  onDownload,
  onCompareToggle,
  isCompareMode,
  imageSrc,
  isPickingColor,
  setIsPickingColor,
  isTilingMode,
  setIsTilingMode,
  isMirrorTiling,
  setIsMirrorTiling,
  isSeamlessTiling,
  setIsSeamlessTiling
}) => {

  const updateAdj = (key: keyof AdjustmentState, val: number) => {
    setAdjustments(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setIsPickingColor(false);
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-20 shadow-2xl">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          <Activity className="text-cyan-400" size={20} />
          參數調整
        </h2>
        <p className="text-slate-500 text-xs mt-1">微調材質屬性以符合肉眼觀感</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        
        {/* VIEW MODES */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setIsTilingMode(!isTilingMode)}
              disabled={!imageSrc}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all border ${
                isTilingMode
                  ? 'bg-cyan-900/50 text-cyan-300 border-cyan-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="檢查四方連續 (Tiling)"
            >
              <Grid3X3 size={14} />
              {isTilingMode ? '關閉連續' : '連續預覽'}
            </button>
            
            <button
              onClick={() => updateAdj('invert', adjustments.invert === 0 ? 100 : 0)}
              disabled={!imageSrc}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all border ${
                adjustments.invert > 0
                  ? 'bg-purple-900/50 text-purple-300 border-purple-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="反轉顏色 (製作 Roughness Map)"
            >
              <FlipVertical size={14} />
              {adjustments.invert > 0 ? '負片模式' : '色彩反轉'}
            </button>
          </div>

          {/* Seamless / Mirror Options */}
          <div className={`overflow-hidden transition-all duration-300 space-y-2 ${isTilingMode ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
            
            <div className="grid grid-cols-2 gap-2">
               {/* Mirror Button */}
               <button
                  onClick={() => setIsMirrorTiling(!isMirrorTiling)}
                  className={`py-2 px-3 rounded-lg font-medium text-xs flex flex-col items-center justify-center gap-1 transition-all border ${
                    isMirrorTiling
                      ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
                      : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
                  }`}
                  title="鏡像翻轉：快速消除接縫，但有對稱感"
                >
                  <Scaling size={14} />
                  <span>鏡像修復</span>
                </button>

                {/* Seamless Button */}
                <button
                  onClick={() => setIsSeamlessTiling(!isSeamlessTiling)}
                  className={`py-2 px-3 rounded-lg font-medium text-xs flex flex-col items-center justify-center gap-1 transition-all border ${
                    isSeamlessTiling
                      ? 'bg-pink-900/50 text-pink-300 border-pink-700'
                      : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
                  }`}
                  title="無縫混合：邊緣重疊羽化，自然無縫"
                >
                  <Sparkles size={14} />
                  <span>無縫混合</span>
                </button>
            </div>
            
            <p className="text-[10px] text-slate-500 text-center px-1">
              {isMirrorTiling && "鏡像模式：適合幾何圖案或地磚"}
              {isSeamlessTiling && "混合模式：適合木紋、草地、不規則紋理"}
              {!isMirrorTiling && !isSeamlessTiling && "原始平鋪：檢查接縫位置"}
            </p>

          </div>
        </div>

        {/* Manual Tool: White Balance Picker */}
        <div className="mb-6">
           <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
             <Pipette size={12}/> 手動校正
           </h3>
           <button
             onClick={() => {
               setIsPickingColor(!isPickingColor);
               if(!isPickingColor) setIsTilingMode(false); // Disable tiling when picking
             }}
             disabled={!imageSrc}
             className={`w-full py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-between transition-all border ${
               isPickingColor
                 ? 'bg-cyan-600 text-white border-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.5)]'
                 : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
             }`}
           >
             <span className="flex items-center gap-2">
               <Pipette size={16} className={isPickingColor ? "animate-pulse" : ""} />
               {isPickingColor ? '請點擊畫面' : '白平衡滴管工具'}
             </span>
             {isPickingColor && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">選取中</span>}
           </button>
        </div>

        {/* Basic Sliders */}
        <div className="space-y-6 mb-8">
           <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">基礎調整</h3>
          <Slider 
            label="亮度 (Brightness)" 
            value={adjustments.brightness} 
            min={0} max={200} 
            onChange={(v) => updateAdj('brightness', v)} 
            onReset={() => updateAdj('brightness', 100)}
            icon={<Sun size={14} />}
          />
          <Slider 
            label="對比度 (Contrast)" 
            value={adjustments.contrast} 
            min={0} max={200} 
            onChange={(v) => updateAdj('contrast', v)}
            onReset={() => updateAdj('contrast', 100)}
            icon={<Contrast size={14} />}
          />
          <Slider 
            label="飽和度 (Saturation)" 
            value={adjustments.saturation} 
            min={0} max={200} 
            onChange={(v) => updateAdj('saturation', v)}
            onReset={() => updateAdj('saturation', 100)}
            icon={<Droplet size={14} />}
          />
        </div>

        {/* Detail Enhancement (New) */}
        <div className="space-y-6 mb-8 pt-4 border-t border-slate-800/50">
           <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
             <Triangle size={12}/> 細節增強
           </h3>
           <Slider 
            label="銳化 (Sharpen)" 
            value={adjustments.sharpen} 
            min={0} max={5} 
            step={0.1}
            onChange={(v) => updateAdj('sharpen', v)}
            onReset={() => updateAdj('sharpen', 0)}
            icon={<Triangle size={14} className="rotate-180"/>}
          />
          <Slider 
            label="模糊 (Blur)" 
            value={adjustments.blur} 
            min={0} max={10} 
            onChange={(v) => updateAdj('blur', v)}
            onReset={() => updateAdj('blur', 0)}
            unit="px"
            icon={<span className="text-[10px] font-bold">B</span>}
          />
        </div>

        {/* RGB Color Balance */}
        <div className="space-y-6 mb-8 pt-4 border-t border-slate-800/50">
           <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
             <GripHorizontal size={12}/> RGB 色彩平衡
           </h3>
           <Slider 
            label="紅色通道 (Red)" 
            value={adjustments.red} 
            min={0} max={200} 
            onChange={(v) => updateAdj('red', v)}
            onReset={() => updateAdj('red', 100)}
            icon={<div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>}
          />
           <Slider 
            label="綠色通道 (Green)" 
            value={adjustments.green} 
            min={0} max={200} 
            onChange={(v) => updateAdj('green', v)}
            onReset={() => updateAdj('green', 100)}
            icon={<div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>}
          />
           <Slider 
            label="藍色通道 (Blue)" 
            value={adjustments.blue} 
            min={0} max={200} 
            onChange={(v) => updateAdj('blue', v)}
            onReset={() => updateAdj('blue', 100)}
            icon={<div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>}
          />
        </div>

        {/* Advanced */}
        <div className="space-y-6 pt-4 border-t border-slate-800/50">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">進階濾鏡</h3>
          <Slider 
            label="暖色調 (Warmth)" 
            value={adjustments.sepia} 
            min={0} max={100} 
            onChange={(v) => updateAdj('sepia', v)}
            onReset={() => updateAdj('sepia', 0)}
            icon={<Thermometer size={14} />}
          />
           <Slider 
            label="色相偏移 (Hue)" 
            value={adjustments.hue} 
            min={-180} max={180} 
            onChange={(v) => updateAdj('hue', v)}
            onReset={() => updateAdj('hue', 0)}
            unit="°"
            icon={<Palette size={14} />}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-3">
        <div className="flex gap-2">
          <button 
            onClick={onCompareToggle}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all border ${
              isCompareMode 
              ? 'bg-slate-800 text-white border-slate-600' 
              : 'bg-slate-800 text-slate-400 border-slate-800 hover:bg-slate-700'
            }`}
          >
            {isCompareMode ? <EyeOff size={16}/> : <Eye size={16}/>}
            {isCompareMode ? '結束比對' : '比對原圖'}
          </button>
          
          <button 
            onClick={handleReset}
            className="px-4 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 rounded-lg border border-slate-800 transition-colors"
            title="重置所有設定"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <button 
          onClick={onDownload}
          disabled={!imageSrc}
          className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Download size={18} />
          下載材質圖片
        </button>
      </div>
    </div>
  );
};