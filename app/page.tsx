"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// --- TYPES ---
declare global {
  interface Window {
    pannellum: any;
  }
}

interface HotSpotConfig {
  pitch: number;
  yaw: number;
  type: "scene" | "info";
  text: string;
  targetSceneId?: string; // For navigation
  title?: string;         // For info cards
  description?: string;   // For info cards
}

interface SceneConfig {
  title: string;
  panorama: string;
  northOffset: number; 
  hotSpots: HotSpotConfig[];
}

// --- 1. CONFIGURATION ---
const SCENES_DATA: Record<string, SceneConfig> = {
  scene1: {
    title: "Dev Team Area",
    panorama: "/pan/1.jpg",
    northOffset: 0, 
    hotSpots: [
      { pitch: -15, yaw: 95, type: "scene", text: "Walk to Corridor", targetSceneId: "scene2" },
      { pitch: -6, yaw: -4, type: "info", text: "Subha Sir", title: "Lead", description: "Full stack developer lead" }
    ],
  },
  scene2: {
    title: "Raj sir Cabin Area",
    panorama: "/pan/2.jpg",
    northOffset: 0,
    hotSpots: [
      { pitch: -11, yaw: -85, type: "scene", text: "Back to dev Area", targetSceneId: "scene1" },
      { pitch: -12, yaw: 95, type: "scene", text: "Enter Main Hall", targetSceneId: "scene3" },
      { pitch: -13, yaw: -1, type: "scene", text: "Go to workstation B", targetSceneId: "scene5" }
    ],
  },
  scene3: {
    title: "Main Hallway",
    panorama: "/pan/3.jpg",
    northOffset: 0,
    hotSpots: [
      { pitch: -13, yaw: 4, type: "scene", text: "Back to Corridor", targetSceneId: "scene2" },
      { pitch: -13, yaw: -92, type: "scene", text: "Go to workStation", targetSceneId: "scene4" },
      { pitch: -5, yaw: 69, type: "scene", text: "Go to Washroom", targetSceneId: "scene6" }
    ],
  },
  scene4: {
    title: "Workstations A",
    panorama: "/pan/4.jpg",
    northOffset: 0,
    hotSpots: [
      { pitch: -14, yaw: 127, type: "scene", text: "Back to Hallway", targetSceneId: "scene3" }
    ],
  },
  scene5: {
    title: "Workstations B",
    panorama: "/pan/2-1.jpg",
    northOffset: 0,
    hotSpots: [
      { pitch: -5, yaw: 0, type: "scene", text: "Go Back to Dev Team", targetSceneId: "scene2" },
      { pitch: -11, yaw: -76, type: "scene", text: "Go to Washroom", targetSceneId: "scene6" }
    ],
  },
  scene6: {
    title: "Back Office",
    panorama: "/pan/3-1.jpg",
    northOffset: 0,
    hotSpots: [
      { pitch: -9, yaw: 0, type: "scene", text: "Return to Raj office", targetSceneId: "scene3" },
      { pitch: -8, yaw: 94, type: "scene", text: "Go back to work-Station B", targetSceneId: "scene5" },
      { pitch: -5, yaw: 57, type: "scene", text: "Go back to Dev Team", targetSceneId: "scene2" }
    ],
  },
};

export default function PannellumExperiment() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [activeInfo, setActiveInfo] = useState<{ title: string; description: string } | null>(null);

  // --- 2. PRELOAD LOGIC ---
  useEffect(() => {
    Object.values(SCENES_DATA).forEach((scene) => {
      const img = new Image();
      img.src = scene.panorama;
    });
  }, []);

  // --- 3. LOAD SCRIPTS ---
  useEffect(() => {
    if (window.pannellum) {
      setIsScriptLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // --- 4. NAVIGATION ENGINE ---
  const navigateToScene = useCallback((evt: MouseEvent, args: any) => {
    if (!viewerInstance.current || !args.targetSceneId) return;

    const currentSceneId = viewerInstance.current.getScene();
    const targetSceneId = args.targetSceneId;

    const currentPitch = viewerInstance.current.getPitch();
    const currentYaw = viewerInstance.current.getYaw();

    const currentOffset = SCENES_DATA[currentSceneId]?.northOffset || 0;
    const targetOffset = SCENES_DATA[targetSceneId]?.northOffset || 0;

    const rotationDifference = currentOffset - targetOffset;
    const correctedYaw = currentYaw + rotationDifference;

    viewerInstance.current.loadScene(targetSceneId, currentPitch, correctedYaw, "same");
  }, []);

  const showInfo = useCallback((evt: MouseEvent, args: any) => {
    setActiveInfo({ title: args.title, description: args.description });
  }, []);

  // --- 5. INITIALIZE VIEWER ---
  useEffect(() => {
    if (!isScriptLoaded || !viewerRef.current || !window.pannellum) return;

    if (viewerInstance.current) {
      viewerInstance.current = null;
      viewerRef.current.innerHTML = "";
    }

    // Convert Data -> Pannellum Format with "street-view-arrow" class
    const processedScenes: any = {};
    Object.keys(SCENES_DATA).forEach((key) => {
      const scene = SCENES_DATA[key];
      processedScenes[key] = {
        title: scene.title,
        panorama: scene.panorama,
        northOffset: scene.northOffset, 
        hotSpots: scene.hotSpots.map((hs) => {
          if (hs.type === "scene") {
            return {
              pitch: hs.pitch,
              yaw: hs.yaw,
              type: "scene",
              cssClass: "street-view-arrow", // <--- THIS APPLIES THE NEW CSS
              text: hs.text,
              clickHandlerFunc: navigateToScene,
              clickHandlerArgs: { targetSceneId: hs.targetSceneId }
            };
          } else {
            return {
              pitch: hs.pitch,
              yaw: hs.yaw,
              type: "info",
              text: hs.text,
              clickHandlerFunc: showInfo,
              clickHandlerArgs: { title: hs.title, description: hs.description }
            };
          }
        })
      };
    });

    viewerInstance.current = window.pannellum.viewer(viewerRef.current, {
      default: {
        firstScene: "scene1",
        sceneFadeDuration: 0,
        autoLoad: true,
        compass: true,
        showControls: true,
        hotSpotDebug: false,
      },
      scenes: processedScenes,
    });
  }, [isScriptLoaded, navigateToScene, showInfo]);

  return (
    <main className="w-screen h-screen bg-neutral-900 relative">
      <div ref={viewerRef} className="w-full h-full absolute inset-0 z-0" />

      {activeInfo && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white text-black p-6 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-2">{activeInfo.title}</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {activeInfo.description}
            </p>
            <button 
              onClick={() => setActiveInfo(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Close Info
            </button>
          </div>
        </div>
      )}
    </main>
  );
}