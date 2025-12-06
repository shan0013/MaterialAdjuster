import React, { useRef, useEffect, useState } from 'react';
import { AdjustmentState } from '../../types';
import { generateFilterString, loadImage } from '../../utils/imageUtils';
import { Upload, AlertCircle, RefreshCw, Pipette, Grid3X3, Scaling, Sparkles } from 'lucide-react';

interface ImageWorkspaceProps {
  imageSrc: string | null;
  adjustments: AdjustmentState;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCompareMode: boolean;
  isPickingColor: boolean;
  onPickColor: (rgb: { r: number, g: number, b: number }) => void;
  isTilingMode: boolean;
  isMirrorTiling: boolean;
  isSeamlessTiling: boolean;
  onLoadError?: () => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({ 
  imageSrc, 
  adjustments, 
  onImageUpload,
  isCompareMode,
  isPickingColor,
  onPickColor,
  isTilingMode,
  isMirrorTiling,
  isSeamlessTiling,
  onLoadError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 1. Color Matrix for RGB channels
  const r = adjustments.red / 100;
  const g = adjustments.green / 100;
  const b = adjustments.blue / 100;

  // 2. Convolution Matrix for Sharpening
  const k = adjustments.sharpen; // 0 to 10
  const center = 1 + 4 * k;
  const kernelMatrix = `0 ${-k} 0 ${-k} ${center} ${-k} 0 ${-k} 0`;

  // Function to generate seamless texture via edge blending
  const generateSeamlessTexture = (sourceImg: HTMLImageElement): HTMLCanvasElement => {
    const W = sourceImg.width;
    const H = sourceImg.height;
    // Overlap 15% - Ensure integer
    const overlapX = Math.floor(W * 0.15);
    const overlapY = Math.floor(H * 0.15);

    const newW = Math.floor(W - overlapX);
    const newH = Math.floor(H - overlapY);

    // --- 1. Horizontal Pass ---
    // Create an intermediate canvas to hold the horizontal blend
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newW;
    tempCanvas.height = H;
    const tCtx = tempCanvas.getContext('2d');
    
    if (!tCtx) return sourceImg as unknown as HTMLCanvasElement; // Fallback

    // Draw Right Strip of original at x=0
    // We want the LEFT edge of new image to match the RIGHT edge of original.
    // So we put the Right Strip at x=0.
    tCtx.drawImage(sourceImg, W - overlapX, 0, overlapX, H, 0, 0, overlapX, H);

    // Fade it out towards the right (keep Overlay on Left, fade to Base on Right)
    // Gradient: Left (Alpha 0 -> 0) to Right (Alpha 1 -> Erase)
    // Wait, 'destination-out': Removes existing content.
    // If we want to KEEP the overlay at x=0, Alpha should be 0 there.
    // If we want to REMOVE the overlay at x=overlapX, Alpha should be 1 there.
    const gH = tCtx.createLinearGradient(0, 0, overlapX, 0);
    gH.addColorStop(0, 'rgba(0,0,0,0)'); // Keep overlay
    gH.addColorStop(1, 'rgba(0,0,0,1)'); // Erase overlay
    
    tCtx.globalCompositeOperation = 'destination-out';
    tCtx.fillStyle = gH;
    tCtx.fillRect(0, 0, overlapX, H);

    // Draw the Base Image UNDERNEATH ('destination-over')
    // The Base image is drawn at 0,0 (so its left side is at 0)
    tCtx.globalCompositeOperation = 'destination-over';
    tCtx.drawImage(sourceImg, 0, 0); 

    // --- 2. Vertical Pass ---
    // Input: tempCanvas (W=newW, H=H)
    // Output: finalCanvas (W=newW, H=newH)
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = newW;
    finalCanvas.height = newH;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return tempCanvas;

    // Draw Bottom Strip of tempCanvas at y=0
    ctx.drawImage(tempCanvas, 0, H - overlapY, newW, overlapY, 0, 0, newW, overlapY);

    // Fade out towards bottom
    const gV = ctx.createLinearGradient(0, 0, 0, overlapY);
    gV.addColorStop(0, 'rgba(0,0,0,0)');
    gV.addColorStop(1, 'rgba(0,0,0,1)');

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gV;
    ctx.fillRect(0, 0, newW, overlapY);

    // Draw base tempCanvas underneath
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(tempCanvas, 0, 0);

    return finalCanvas;
  };

  // Draw image to canvas
  useEffect(() => {
    if (!imageSrc || !canvasRef.current || !containerRef.current) return;

    let isMounted = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;

    const render = async () => {
      try {
        const rawImg = await loadImage(imageSrc);
        
        if (!isMounted) return;

        // Determine which image source to use
        let drawImg: HTMLImageElement | HTMLCanvasElement = rawImg;
        
        // If Seamless Mode is on, generate the seamless version
        if (isTilingMode && isSeamlessTiling) {
           drawImg = generateSeamlessTexture(rawImg);
        }

        const containerW = containerRef.current?.clientWidth || 800;
        const containerH = containerRef.current?.clientHeight || 600;
        
        // --- FIX: Integer Snapping for scaling ---
        // Floating point dimensions cause sub-pixel rendering bleeding (black lines)
        const rawScale = Math.min(containerW / drawImg.width, containerH / drawImg.height);
        
        const singleW = Math.ceil(drawImg.width * rawScale);
        const singleH = Math.ceil(drawImg.height * rawScale);
        
        let drawW = singleW;
        let drawH = singleH;
        
        // Determine canvas size based on Tiling Mode
        if (isTilingMode) {
          // Show 2x2 grid (zoom out effectively)
          // We use ceil to ensure we cover the space
          drawW = Math.ceil(singleW / 2); 
          drawH = Math.ceil(singleH / 2);
          
          // Canvas size must be exact multiple
          canvas.width = drawW * 2; 
          canvas.height = drawH * 2;
        } else {
          canvas.width = singleW;
          canvas.height = singleH;
        }

        setDimensions({ width: canvas.width, height: canvas.height });

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply Filters
        const standardFilters = generateFilterString(adjustments);
        ctx.filter = `url(#sharpen) url(#rgb-adjust) ${standardFilters}`;

        // --- FIX: Bleed Overlap ---
        // We draw the image slightly larger (0.5px) to overlap and seal the seams
        // caused by anti-aliasing transparency.
        const overlapFix = 0.5;

        if (isTilingMode) {
          // Draw 2x2 Grid
          for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
               // Logic for Mirror Tiling (Only if NOT seamless)
               ctx.save();
               
               // Move to the center of the cell where we want to draw
               const posX = x * drawW;
               const posY = y * drawH;
               
               ctx.translate(posX, posY);

               if (isMirrorTiling && !isSeamlessTiling) {
                 let scaleX = 1;
                 let scaleY = 1;
                 let translateX = 0;
                 let translateY = 0;

                 // Mirror every second column
                 if (x % 2 !== 0) {
                   scaleX = -1;
                   translateX = -drawW; 
                 }

                 // Mirror every second row
                 if (y % 2 !== 0) {
                   scaleY = -1;
                   translateY = -drawH;
                 }

                 ctx.scale(scaleX, scaleY);
                 
                 // Apply overlap fix to mirrored drawing as well
                 // We need to expand the draw rectangle slightly in the "unscaled" direction
                 // But since we translate/scale, simpler to just draw slightly larger.
                 ctx.drawImage(
                   drawImg, 
                   translateX - overlapFix, 
                   translateY - overlapFix, 
                   drawW + (overlapFix * 2), 
                   drawH + (overlapFix * 2)
                 );
                 
               } else {
                 // Standard tiling (or Seamless tiling which is already processed in drawImg)
                 // Draw with overlap to seal seams
                 ctx.drawImage(
                   drawImg, 
                   0 - overlapFix, 
                   0 - overlapFix, 
                   drawW + (overlapFix * 2), 
                   drawH + (overlapFix * 2)
                 );
               }
               
               ctx.restore();
            }
          }
        } else {
          ctx.drawImage(drawImg, 0, 0, drawW, drawH);
        }
      } catch (err) {
        console.error("Render error:", err);
        if (isMounted && onLoadError) {
          onLoadError();
        }
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [imageSrc, adjustments, isTilingMode, isMirrorTiling, isSeamlessTiling, onLoadError]); 

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor || !imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const img = await loadImage(imageSrc);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      
      const scaleX = img.width / canvas.width;
      const scaleY = img.height / canvas.height;
      
      const sourceX = Math.floor(x * scaleX);
      const sourceY = Math.floor(y * scaleY);
      
      // Safety check for bounds
      if (sourceX >= 0 && sourceX < img.width && sourceY >= 0 && sourceY < img.height) {
        const pixel = ctx.getImageData(sourceX, sourceY, 1, 1).data;
        onPickColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      }
    } catch (err) {
      console.error("Error reading pixel data", err);
    }
  };

  if (!imageSrc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20 m-4 relative group hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all">
        <input 
          type="file" 
          accept="image/*" 
          onChange={onImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="p-8 rounded-full bg-slate-800 mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10">
          <Upload className="w-10 h-10 text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">上傳材質圖片</h3>
        <p className="text-slate-400 text-sm max-w-xs text-center">
          拖放或點擊以上傳圖片 (支援 JPG, PNG, WEBP)
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900/50 overflow-hidden flex items-center justify-center p-8">
      
      {/* Hidden File Input for Re-upload */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={onImageUpload}
        className="hidden"
      />

      {/* Top Left Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
         {/* Tiling Mode Indicator */}
         {isTilingMode && (
           <div className="bg-cyan-600/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-white/20 flex items-center gap-2">
             <Grid3X3 size={12} /> 四方連續預覽中
           </div>
         )}
         {/* Mirror Mode Indicator */}
         {isMirrorTiling && isTilingMode && (
           <div className="bg-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-white/20 flex items-center gap-2">
             <Scaling size={12} /> 鏡像接縫修復中
           </div>
         )}
         {/* Seamless Mode Indicator */}
         {isSeamlessTiling && isTilingMode && (
           <div className="bg-pink-600/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-white/20 flex items-center gap-2">
             <Sparkles size={12} /> 無縫混合運算中
           </div>
         )}
         {/* Picking Mode Indicator */}
         {isPickingColor && (
           <div className="bg-amber-600/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-white/20 flex items-center gap-2 animate-pulse">
             <Pipette size={12} /> 點擊畫面取色
           </div>
         )}
      </div>

      {/* Re-upload Button Overlay */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-4 right-4 z-20 bg-slate-800/80 hover:bg-cyan-600/90 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-2 transition-all shadow-lg"
      >
        <RefreshCw size={14} />
        更換圖片
      </button>

      {/* SVG Filters Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          {/* 1. RGB Channel Adjustment */}
          <filter id="rgb-adjust" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values={`
                ${r} 0 0 0 0
                0 ${g} 0 0 0
                0 0 ${b} 0 0
                0 0 0 1 0
              `} 
            />
          </filter>

          {/* 2. Dynamic Sharpening */}
          <filter id="sharpen" colorInterpolationFilters="sRGB">
             <feConvolveMatrix 
               order="3" 
               kernelMatrix={kernelMatrix}
               preserveAlpha="true"
             />
          </filter>
        </defs>
      </svg>

      <div className={`relative shadow-2xl shadow-black/50 rounded-sm overflow-hidden ring-1 ring-white/10 transition-cursor ${isPickingColor ? 'cursor-crosshair' : 'cursor-default'}`}>
        <canvas 
          ref={canvasRef} 
          className="block max-w-full max-h-full"
          onClick={handleCanvasClick}
        />
        
        {/* Compare Mode Overlay: Show Original */}
        {isCompareMode && !isPickingColor && !isTilingMode && (
          <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none">
             <img 
               src={imageSrc} 
               alt="Original" 
               className="w-full h-full object-contain"
               style={{ width: dimensions.width, height: dimensions.height }}
             />
             <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded border border-white/20">
               原始圖片
             </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-500 text-xs flex gap-2 items-center">
        <AlertCircle size={12} />
        <span>畫布預覽 • 真實渲染</span>
      </div>
    </div>
  );
};