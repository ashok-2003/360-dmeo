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

  // 1. State to manage our custom info overlay
  const [activeInfo, setActiveInfo] = useState<{ title: string; description: string } | null>(null);

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

  useEffect(() => {
    if (isLoaded && viewerRef.current && window.pannellum) {
      viewerRef.current.innerHTML = "";

      window.pannellum.viewer(viewerRef.current, {
        default: {
          firstScene: "scene1",
          sceneFadeDuration: 1500,
          autoLoad: true,
        },
        scenes: {
          scene1: {
            title: "Reception (Node A)",
            panorama: "/pan/1.jpg",
            // haov: 360,    // Horizontal coverage (Try 180 to 220 depending on your image)
            // vaov: 70,     // Vertical coverage (Phone strips are usually narrow, try 40-60)
            // vOffset: 0,   // Vertical offset (keep 0 to center it)

            // // Restrict looking up/down so user doesn't see black void
            // minPitch: -90,
            // maxPitch: 90,
            hotSpots: [
              {
                pitch: -10,
                yaw: 100,
                type: "scene",
                text: "Go to node 2",
                sceneId: "scene2",
              },

              {
                pitch: -10,
                yaw: -17,
                type: "info",
                text: "Click for see Shashwat",
                clickHandlerFunc: (event: MouseEvent, args: any) => {
                  setActiveInfo({
                    title: args.title,
                    description: args.description
                  });
                },
                clickHandlerArgs: {
                  title: "Shashwat pandey",
                  description: "Full stack developer"
                }
              },
            ],
          },
          scene2: {
            title: "Library (Node B)",
            panorama: "/pan/2.jpg",
            hotSpots: [
              {
                pitch: -10,
                yaw: 100,
                type: "scene",
                text: "Go back to Node 1",
                sceneId: "scene1",
              },
              {
                pitch: 20,
                yaw: 0,
                type: "info",
                text: "Click to inspect ceiling",
                clickHandlerFunc: (event: MouseEvent, args: any) => {
                  setActiveInfo({
                    title: args.title,
                    description: args.description
                  });
                },
                clickHandlerArgs: {
                  title: "Historic Architecture",
                  description: "Notice the intricate detailing on the ceiling. This was restored in 1998 using original blueprints."
                }
              },
            ],
          },
        },
      });
    }
  }, [isLoaded]);

  return (
    <main className="w-screen h-screen bg-neutral-900 relative">
      <div ref={viewerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Title Overlay */}
      {/* <div className="absolute top-4 left-4 z-10 bg-black/60 text-white p-4 rounded-lg backdrop-blur-md pointer-events-none">
        <h1 className="text-xl font-bold">360° Info Markers</h1>
        <p className="text-sm opacity-80">Click the ( i ) icons for details.</p>
      </div> */}

      {/* 3. Custom Tailwind Info Overlay triggered by React State */}
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