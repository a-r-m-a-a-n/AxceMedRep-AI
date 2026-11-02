import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, SunMedium } from 'lucide-react';

interface DocumentScanViewerProps {
  imageDataUri: string;
  fileName: string;
  documentType: string;
  highlightedText?: string;
}

export const DocumentScanViewer: React.FC<DocumentScanViewerProps> = ({
  imageDataUri,
  fileName,
  documentType,
  highlightedText,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [highContrast, setHighContrast] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 260));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-white truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 text-[11px] font-mono">{documentType}</span>
        </div>

        {/* Viewer Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out (-20%)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] text-slate-400 w-10 text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom In (+20%)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-3.5 bg-slate-800 mx-1" />
          <button
            onClick={handleRotate}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-1 rounded transition-colors ${
              highContrast ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Toggle High-Contrast Filter (Enhance faint handwriting/pencil)"
          >
            <SunMedium className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Reset Zoom & Orientation"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Highlight Banner if clinician clicked a field */}
      {highlightedText && (
        <div className="bg-slate-800/90 border-b border-blue-500/40 px-3 py-1.5 text-xs text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Active Field Grounding:</span>
            <span className="font-mono text-white text-[11px] truncate">"{highlightedText}"</span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0">Source matched</span>
        </div>
      )}

      {/* Viewport Canvas */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900/90 relative">
        <div
          className="transition-transform duration-150 origin-center shadow-2xl relative"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            filter: highContrast ? 'contrast(1.6) brightness(1.05)' : 'none',
          }}
        >
          <img
            src={imageDataUri}
            alt={`Medical scan: ${fileName}`}
            className="max-w-none rounded border border-slate-700 bg-white"
            style={{ width: '680px', height: 'auto' }}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
        <span>ORIGINAL SOURCE RECORD (UNALTERED)</span>
        <span>AXCEMEDREP OCR EVIDENCE GROUNDING</span>
      </div>
    </div>
  );
};
