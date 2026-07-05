"use client";

import type { ReactNode } from "react";

export default function CosmicBackgroundWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #0f172a 0%, #020617 55%, #000 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(96,165,250,0.2), transparent 30%), radial-gradient(circle at 80% 10%, rgba(59,130,246,0.16), transparent 24%), radial-gradient(circle at 50% 80%, rgba(14,165,233,0.12), transparent 26%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
