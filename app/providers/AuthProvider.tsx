"use client";

import { useAuth } from "../hooks/useAuth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 40%, #0b0e1a 0%, #05070e 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        zIndex: 9999,
      }}>
        <div style={{
          position: "relative",
          width: 220,
          height: 220,
        }}>
          {/* Cosmic Rings */}
          <style>{`
            @keyframes spinPortal {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes pulseCore {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
              50% { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
            }
            @keyframes twinkle {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
            @keyframes shimmerText {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
            .loader-ring {
              position: absolute;
              left: 50%;
              top: 50%;
              border-radius: 50%;
              border: 1.5px solid rgba(140, 175, 255, 0.18);
              pointer-events: none;
              animation: spinPortal 8s linear infinite;
            }
            .loader-ring.r1 { width: 30%; height: 30%; animation-duration: 10s; }
            .loader-ring.r2 { width: 52%; height: 52%; animation-duration: 7s; animation-direction: reverse; }
            .loader-ring.r3 { width: 74%; height: 74%; animation-duration: 12s; }
            .loader-ring.r4 { width: 94%; height: 94%; animation-duration: 6s; animation-direction: reverse; }
            .loader-core {
              position: absolute;
              left: 50%;
              top: 50%;
              width: 34px;
              height: 34px;
              transform: translate(-50%, -50%);
              border-radius: 50%;
              background: radial-gradient(circle at 50% 40%, #eaf2ff, #6ea2ff 58%, rgba(60,110,255,0));
              box-shadow: 0 0 40px 12px rgba(110, 160, 255, 0.7);
              animation: pulseCore 2.4s ease-in-out infinite;
            }
            .star-dot {
              position: absolute;
              width: 3px;
              height: 3px;
              background: #ffffff;
              border-radius: 50%;
              animation: twinkle 2s ease-in-out infinite alternate;
            }
            .loader-text {
              position: absolute;
              bottom: -60px;
              left: 50%;
              transform: translateX(-50%);
              color: #aebbe0;
              font-size: 18px;
              font-weight: 300;
              letter-spacing: 4px;
              text-transform: uppercase;
              white-space: nowrap;
              animation: shimmerText 2.4s ease-in-out infinite;
            }
            .loader-dots {
              position: absolute;
              bottom: -90px;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              gap: 8px;
            }
            .loader-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #6ea2ff;
              animation: dotPulse 1.4s ease-in-out infinite;
            }
            .loader-dot:nth-child(2) { animation-delay: 0.2s; }
            .loader-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes dotPulse {
              0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>

          {/* Rings */}
          <div className="loader-ring r1" />
          <div className="loader-ring r2" />
          <div className="loader-ring r3" />
          <div className="loader-ring r4" />
          
          {/* Core */}
          <div className="loader-core" />
          
          {/* Stars */}
          <div className="star-dot" style={{ left: "10%", top: "15%", animationDelay: "0.2s", width: 4, height: 4 }} />
          <div className="star-dot" style={{ left: "85%", top: "25%", animationDelay: "0.8s" }} />
          <div className="star-dot" style={{ left: "20%", top: "75%", animationDelay: "1.2s", width: 5, height: 5 }} />
          <div className="star-dot" style={{ left: "70%", top: "80%", animationDelay: "0.5s" }} />
          <div className="star-dot" style={{ left: "45%", top: "10%", animationDelay: "1.8s", width: 3, height: 3 }} />
          <div className="star-dot" style={{ left: "5%", top: "50%", animationDelay: "0.1s", width: 2, height: 2 }} />
          <div className="star-dot" style={{ left: "92%", top: "55%", animationDelay: "1.5s", width: 4, height: 4 }} />
          
          {/* Brand text */}
          <div className="loader-text">Loading</div>
          
          {/* Animated dots */}
          <div className="loader-dots">
            <span className="loader-dot" />
            <span className="loader-dot" />
            <span className="loader-dot" />
          </div>
        </div>
      </div>
    );
  }

  return children;
}