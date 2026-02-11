"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    pannellum: any;
  }
}

const PANORAMA_IMAGES = [
  { id: "1", label: "1.jpg", src: "/pan/1.jpg" },
  { id: "2", label: "2.jpg", src: "/pan/2.jpg" },
  { id: "2-1", label: "2-1.jpg", src: "/pan/2-1.jpg" },
  { id: "3", label: "3.jpg", src: "/pan/3.jpg" },
  { id: "3-1", label: "3-1.jpg", src: "/pan/3-1.jpg" },
  { id: "4", label: "4.jpg", src: "/pan/4.jpg" },
  { id: "11", label: "11.jpg", src: "/pan/11.jpg" },
  { id: "22", label: "22.jpg", src: "/pan/22.jpg" },
];

export default function AdminPage() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(PANORAMA_IMAGES[0]);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [hfov, setHfov] = useState(100);
  const [copied, setCopied] = useState(false);
  const animFrameRef = useRef<number>(0);

  // Load Pannellum scripts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  // Poll viewer for yaw/pitch updates
  const pollValues = useCallback(() => {
    const viewer = viewerInstanceRef.current;
    if (viewer) {
      try {
        setYaw(Math.round(viewer.getYaw() * 100) / 100);
        setPitch(Math.round(viewer.getPitch() * 100) / 100);
        setHfov(Math.round(viewer.getHfov() * 100) / 100);
      } catch {}
    }
    animFrameRef.current = requestAnimationFrame(pollValues);
  }, []);

  // Initialize / reinitialize viewer when image changes
  useEffect(() => {
    if (!isLoaded || !viewerRef.current || !window.pannellum) return;

    // Destroy previous viewer
    if (viewerInstanceRef.current) {
      try {
        viewerInstanceRef.current.destroy();
      } catch {}
      viewerInstanceRef.current = null;
    }
    viewerRef.current.innerHTML = "";

    viewerInstanceRef.current = window.pannellum.viewer(viewerRef.current, {
      type: "equirectangular",
      panorama: selectedImage.src,
      autoLoad: true,
      showControls: true,
      compass: true,
      mouseZoom: true,
      hfov: 100,
    });

    // Start polling
    animFrameRef.current = requestAnimationFrame(pollValues);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLoaded, selectedImage, pollValues]);

  const copyValues = () => {
    const text = `pitch: ${pitch}, yaw: ${yaw}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyAsHotspot = () => {
    const text = `{
  pitch: ${pitch},
  yaw: ${yaw},
  type: "scene",
  text: "Label",
  sceneId: "sceneX"
}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="w-screen h-screen bg-neutral-950 relative overflow-hidden">
      {/* Panorama Viewer */}
      <div ref={viewerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Crosshair / Focus Ring */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-2 border-red-500/80" />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
          {/* Crosshair lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/50 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-red-500/50 -translate-x-1/2" />
        </div>
      </div>

      {/* Top Panel - Scene Selector */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 flex-wrap justify-center">
        {PANORAMA_IMAGES.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedImage.id === img.id
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-black/60 text-white/80 hover:bg-white/20 backdrop-blur-sm"
            }`}
          >
            {img.label}
          </button>
        ))}
      </div>

      {/* Bottom Panel - Yaw / Pitch Readout */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/80 backdrop-blur-md rounded-2xl px-6 py-4 shadow-2xl border border-white/10">
          <div className="flex items-center gap-8">
            {/* Yaw */}
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                Yaw
              </div>
              <div className="text-2xl font-mono font-bold text-white tabular-nums">
                {yaw.toFixed(2)}
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            {/* Pitch */}
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                Pitch
              </div>
              <div className="text-2xl font-mono font-bold text-white tabular-nums">
                {pitch.toFixed(2)}
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            {/* HFOV */}
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                HFOV
              </div>
              <div className="text-2xl font-mono font-bold text-white/60 tabular-nums">
                {hfov.toFixed(1)}
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            {/* Copy Buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={copyValues}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/80 hover:bg-red-500 text-white transition-colors"
              >
                {copied ? "Copied!" : "Copy Values"}
              </button>
              <button
                onClick={copyAsHotspot}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              >
                Copy as Hotspot
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Image Label */}
      <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white/80 text-sm font-medium">
        Admin Mode - {selectedImage.label}
      </div>

      {/* Link back to main */}
      <a
        href="/"
        className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white/80 text-sm font-medium hover:bg-white/20 transition-colors"
      >
        Back to Viewer
      </a>
    </main>
  );
}
