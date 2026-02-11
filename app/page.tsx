"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    pannellum: any;
  }
}

export default function PannellumExperiment() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State for Info Overlay
  const [activeInfo, setActiveInfo] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.css";
    document.head.appendChild(link);

    // Load JS
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

  useEffect(() => {
    if (isLoaded && viewerRef.current && window.pannellum) {
      viewerRef.current.innerHTML = "";

      window.pannellum.viewer(viewerRef.current, {
        default: {
          firstScene: "scene1",
          sceneFadeDuration: 1000,
          autoLoad: true,
          compass: true,
          showControls: true
        },
        scenes: {
          scene1: {
            title: "Dev Team Area",
            panorama: "/pan/1.jpg", 
            hotSpots: [
              {
                pitch: -15,
                yaw: 95,
                type: "scene",
                text: "Walk to Corridor",
                sceneId: "scene2"
              },
              {
                pitch: -6,
                yaw: -4,
                type: "info",
                text: "Subha Sir",
                clickHandlerFunc: (evt: any, args: any) => setActiveInfo(args),
                clickHandlerArgs: { title: "Lead", description: "Full stack developer lead" }
              }
            ],
          },
          
          scene2: {
            title: "Raj sir Cabin Area",
            panorama: "/pan/2.jpg",
            hotSpots: [
              {
                pitch: -11,
                yaw: -85,
                type: "scene",
                text: "Back to dev Area",
                sceneId: "scene1"
              },
              {
                pitch: -12,
                yaw: 95,
                type: "scene",
                text: "Enter Main Hall",
                sceneId: "scene3"
              },
              {
                pitch: -13,
                yaw: -1,
                type: "scene",
                text: "Go to workstation B",
                sceneId: "scene5"
              }
            ],
          },

          scene3: {
            title: "Main Hallway",
            panorama: "/pan/3.jpg",
            hotSpots: [
              {
                pitch: -13,
                yaw: 4,
                type: "scene",
                text: "Back to Corridor",
                sceneId: "scene2"
              },
              {
                pitch: -13,
                yaw: -92, 
                type: "scene",
                text: "Go to workStation",
                sceneId: "scene4"
              },
              {
                pitch: -5,
                yaw: 69, 
                type: "scene",
                text: "Go to Washroom",
                sceneId: "scene6"
              }
            ],
          },

          
          scene4: {
            title: "Workstations A",
            panorama: "/pan/4.jpg",
            hotSpots: [
              {
                pitch: -14,
                yaw: 127,
                type: "scene",
                text: "Back to Hallway",
                sceneId: "scene3"
              }
            ],
          },

          // --- NODE 5: Brick Pillar Area ---
          scene5: {
            title: "Workstations B",
            panorama: "/pan/2-1.jpg",
            hotSpots: [
              {
                pitch: -5,
                yaw: 0,
                type: "scene",
                text: "Go Back to Dev Team",
                sceneId: "scene2"
              },
              {
                pitch: -11,
                yaw: -76,
                type: "scene",
                text: "Go to Washroom",
                sceneId: "scene6"
              }
            ],
          },

          
          scene6: {
            title: "Back Office",
            panorama: "/pan/3-1.jpg",
            hotSpots: [
              {
                pitch: -9,
                yaw: 0, // Turn around to leave
                type: "scene",
                text: "Return to Raj office",
                sceneId: "scene3"
              },
              {
                pitch: -8,
                yaw: 94, // Turn around to leave
                type: "scene",
                text: "Go back to work-Station B",
                sceneId: "scene5"
              },
              {
                pitch: -5,
                yaw: 57, // Turn around to leave
                type: "scene",
                text: "Go back to Dev Team",
                sceneId: "scene2"
              }
            ],
          },
        },
      });
    }
  }, [isLoaded]);

  return (
    <main className="w-screen h-screen bg-neutral-900 relative">
      <div ref={viewerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Info Overlay */}
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