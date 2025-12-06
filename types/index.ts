export interface AdjustmentState {
  brightness: number; // 0-200, default 100
  contrast: number;   // 0-200, default 100
  saturation: number; // 0-200, default 100
  hue: number;        // -180 to 180, default 0
  sepia: number;      // 0-100, default 0 (Warmth proxy)
  blur: number;       // 0-20, default 0
  sharpen: number;    // 0-10, default 0 (New)
  invert: number;     // 0 or 100, default 0 (New)
  red: number;        // 0-200, default 100
  green: number;      // 0-200, default 100
  blue: number;       // 0-200, default 100
}

export const DEFAULT_ADJUSTMENTS: AdjustmentState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  sepia: 0,
  blur: 0,
  sharpen: 0,
  invert: 0,
  red: 100,
  green: 100,
  blue: 100,
};