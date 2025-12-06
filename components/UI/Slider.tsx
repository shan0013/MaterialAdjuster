import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  onReset: () => void;
  unit?: string;
  icon?: React.ReactNode;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  onReset, 
  unit = '',
  icon 
}) => {
  return (
    <div className="mb-5 group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          {icon && <span className="text-slate-400">{icon}</span>}
          <label className="text-sm tracking-wider">{label}</label>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-900/50">
            {value}{unit}
          </span>
          <button 
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
            title="重置此項"
          >
            ↺
          </button>
        </div>
       
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
      />
    </div>
  );
};