"use client";

// ─── src/components/CosmicBackground.tsx ────────────────────────────────────
// Drop-in replacement for your existing CosmicBackgroundWrapper.
// Usage:
//   <CosmicBackground>
//     <YourPageContent />
//   </CosmicBackground>
// ─────────────────────────────────────────────────────────────────────────────

import { Scene } from "./3d/Scene";

interface CosmicBackgroundProps {
  children?: React.ReactNode;
}

export default function CosmicBackground({ children }: CosmicBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Three.js scene — fixed fullscreen background */}
      <Scene />

      {/* All website content renders above the scene */}
      {children && (
        <div
          className="relative z-10 pointer-events-none"
          style={{ pointerEvents: "none" }}
        >
          {/* Re-enable pointer events for interactive children */}
          <div style={{ pointerEvents: "auto" }}>{children}</div>
        </div>
      )}
    </div>
  );
}