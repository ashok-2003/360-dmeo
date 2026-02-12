"use client";

import { useState } from "react";
import exifr from "exifr";

// The images from your project
const PROJECT_IMAGES = [
  "/pan/1.jpg",
  "/pan/2.jpg",
  "/pan/3.jpg",
  "/pan/4.jpg",
  "/pan/2-1.jpg",
  "/pan/3-1.jpg",
];

interface ScanResult {
  fileName: string;
  heading: number | null;
  projection: string;
  status: "success" | "error";
  raw?: any;
}

export default function MetadataInspector() {
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scanProjectImages = async () => {
    setIsScanning(true);
    setResults([]);
    const scanData: ScanResult[] = [];

    for (const url of PROJECT_IMAGES) {
      try {
        // 1. Fetch the image from public folder
        const response = await fetch(url);
        if (!response.ok) throw new Error("Image not found");
        const blob = await response.blob();

        // 2. Parse Metadata
        const output = await exifr.parse(blob, {
          xmp: true,
          gps: true,
        });

        // 3. Store Result
        scanData.push({
          fileName: url,
          heading: output?.GPano?.PoseHeadingDegrees ?? null,
          projection: output?.GPano?.ProjectionType ?? "Unknown",
          status: "success",
          raw: output?.GPano
        });

      } catch (err) {
        console.error(`Failed to scan ${url}`, err);
        scanData.push({
          fileName: url,
          heading: null,
          projection: "Error",
          status: "error"
        });
      }
    }

    setResults(scanData);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Project Metadata Scanner</h1>
            <p className="text-gray-400 mt-2">Scanning public images in <code>/pan/</code> folder</p>
          </div>
          
          <button
            onClick={scanProjectImages}
            disabled={isScanning}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              "Start Scan"
            )}
          </button>
        </div>

        <div className="space-y-4">
          {results.length === 0 && !isScanning && (
            <div className="text-center p-12 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-500">
              Click "Start Scan" to check your project images.
            </div>
          )}

          {results.map((res, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300 delay-${idx * 100} ${
                res.status === "error" 
                  ? "bg-red-900/10 border-red-900/50" 
                  : res.heading !== null 
                    ? "bg-green-900/10 border-green-900/50" 
                    : "bg-yellow-900/10 border-yellow-900/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                  res.status === "error" ? "bg-red-500/20 text-red-400" : "bg-neutral-800"
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-mono font-bold text-lg">{res.fileName}</h3>
                  <div className="flex gap-4 text-xs text-gray-400 mt-1">
                    <span>Projection: {res.projection}</span>
                    {res.status === "error" && <span className="text-red-400">Failed to load</span>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-xs uppercase tracking-wider opacity-60 mb-1">North Offset</span>
                <span className={`text-2xl font-mono font-bold ${
                  res.heading !== null ? "text-green-400" : "text-yellow-500"
                }`}>
                  {res.heading !== null ? `${res.heading}°` : "MISSING"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="mt-8 p-4 bg-neutral-800 rounded-lg text-sm text-gray-400">
            <strong>Tip:</strong> If "North Offset" shows a number (e.g., 185°), Pannellum can use this to auto-align the scene. If it says "MISSING", you must manually set <code>northOffset</code> in your config or align it by eye.
          </div>
        )}
      </div>
    </div>
  );
}