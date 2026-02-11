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
          // --- NODE 1: Reception / Red Poster ---
          scene1: {
            title: "Reception Area",
            panorama: "/pan/1.jpg", 
            // haov/vaov not needed for these perfect 360 photospheres
            hotSpots: [
              {
                pitch: -5,
                yaw: 110, // Rotated right to face the hallway entrance
                type: "scene",
                text: "Walk to Corridor",
                sceneId: "scene2"
              },
              {
                pitch: 0,
                yaw: -20, // Looking at the Red Poster
                type: "info",
                text: "Company Values",
                clickHandlerFunc: (evt: any, args: any) => setActiveInfo(args),
                clickHandlerArgs: { title: "Motto", description: "'Always Learn, Never Lecture'" }
              }
            ],
          },
          
          // --- NODE 2: Corridor ---
          scene2: {
            title: "Corridor",
            panorama: "/pan/2.jpg",
            hotSpots: [
              {
                pitch: -5,
                yaw: -160, // Turn around to go back to poster
                type: "scene",
                text: "Back to Reception",
                sceneId: "scene1"
              },
              {
                pitch: -5,
                yaw: 10, // Straight ahead into the main floor
                type: "scene",
                text: "Enter Main Hall",
                sceneId: "scene3"
              }
            ],
          },

          // --- NODE 3: Main Hallway (Yellow Poster) ---
          scene3: {
            title: "Main Hallway",
            panorama: "/pan/3.jpg",
            hotSpots: [
              {
                pitch: -5,
                yaw: 190, // Behind you
                type: "scene",
                text: "Back to Corridor",
                sceneId: "scene2"
              },
              {
                pitch: -5,
                yaw: -45, // Angled towards the desks
                type: "scene",
                text: "Go to Workstations",
                sceneId: "scene4"
              }
            ],
          },

          // --- NODE 4: Workstations (Man in Green) ---
          scene4: {
            title: "Workstations A",
            panorama: "/pan/4.jpg",
            hotSpots: [
              {
                pitch: -5,
                yaw: 170, // Back towards the hall
                type: "scene",
                text: "Back to Hallway",
                sceneId: "scene3"
              },
              {
                pitch: -5,
                yaw: -10, // Straight down the aisle
                type: "scene",
                text: "Move Further Inside",
                sceneId: "scene5"
              }
            ],
          },

          // --- NODE 5: Brick Pillar Area ---
          scene5: {
            title: "Workstations B",
            panorama: "/pan/5.jpg",
            hotSpots: [
              {
                pitch: -5,
                yaw: 180,
                type: "scene",
                text: "Go Back",
                sceneId: "scene4"
              },
              {
                pitch: -5,
                yaw: 0, // Towards the back wall/glass
                type: "scene",
                text: "Go to Back Office",
                sceneId: "scene6"
              }
            ],
          },

          // --- NODE 6: Back Office ---
          scene6: {
            title: "Back Office",
            panorama: "/pan/6.jpg",
            hotSpots: [
              {
                pitch: -5,
                yaw: 180, // Turn around to leave
                type: "scene",
                text: "Return to Main Floor",
                sceneId: "scene5"
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