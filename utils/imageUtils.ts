import { AdjustmentState } from "../types";

export const generateFilterString = (adj: AdjustmentState): string => {
  // Sharpen is handled via SVG filter ID separately in the component
  return `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%) hue-rotate(${adj.hue}deg) sepia(${adj.sepia}%) blur(${adj.blur}px) invert(${adj.invert}%)`;
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string = 'material-adjusted.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from ${src}`));
    img.src = src;
  });
};