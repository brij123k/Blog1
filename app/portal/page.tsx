"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import CosmicBackgroundWrapper from "../components/CosmicBackgroundWrapper";

/* ─── seeded random so stars don't shift on re-render ─── */
function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/* ══════════════════════════════════════════════
   WHITE/SILVER RING CANVAS
══════════════════════════════════════════════ */
function MetallicRing({ size }: { size: number }) {
  const ringRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ringRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    const cx = W / 2, cy = H / 2;
    const R_OUT = size * 0.461, R_MID = size * 0.407, R_IN = size * 0.366;

    const ring = (r1: number, r2: number, fill: string | CanvasGradient) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI * 2);
      ctx.arc(cx, cy, r1, 0, Math.PI * 2, true);
      ctx.fillStyle = fill; ctx.fill();
    };

    /* outer shadow */
    ring(R_OUT - 2, R_OUT + 5, "#1a1a1a");

    /* primary conic segments - WHITE/SILVER */
    const seg = ctx.createConicGradient(0, cx, cy);
    const segs = 28;
    for (let i = 0; i < segs; i++) {
      const t = i / segs, bright = i % 2 === 0;
      seg.addColorStop(t, bright ? "#e8e8e8" : "#a0a0a0");
      seg.addColorStop(t + 0.45 / segs, bright ? "#f5f5f5" : "#b8b8b8");
      seg.addColorStop(t + 1 / segs - 0.001, bright ? "#c8c8c8" : "#909090");
    }
    ring(R_MID, R_OUT, seg);

    /* radial sheen - white */
    const sheen = ctx.createRadialGradient(cx - R_OUT * 0.4, cy - R_OUT * 0.4, 0, cx, cy, R_OUT);
    sheen.addColorStop(0, "rgba(255,255,255,0.25)");
    sheen.addColorStop(0.55, "rgba(255,255,255,0.1)");
    sheen.addColorStop(1, "rgba(0,0,0,0)");
    ring(R_MID, R_OUT, sheen);

    /* rivets - silver */
    const rivetCount = 44, rivetR = (R_MID + R_OUT) / 2;
    for (let i = 0; i < rivetCount; i++) {
      const a = (i / rivetCount) * Math.PI * 2;
      const rx = cx + Math.cos(a) * rivetR, ry = cy + Math.sin(a) * rivetR;
      ctx.beginPath(); ctx.arc(rx + 1, ry + 1, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fill();
      const rg = ctx.createRadialGradient(rx - 1, ry - 1, 0, rx, ry, 3.2);
      rg.addColorStop(0, "#f0f0f0"); rg.addColorStop(0.4, "#c0c0c0"); rg.addColorStop(1, "#808080");
      ctx.beginPath(); ctx.arc(rx, ry, 3.2, 0, Math.PI * 2); ctx.fillStyle = rg; ctx.fill();
      ctx.beginPath(); ctx.arc(rx - 0.8, ry - 0.8, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill();
    }

    /* panel blocks - silver */
    const panelCount = 14;
    for (let i = 0; i < panelCount; i++) {
      const a = (i / panelCount) * Math.PI * 2 + Math.PI / panelCount;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      const pW = 16, pH = 20, pR = (R_MID + R_OUT) / 2;
      ctx.fillStyle = i % 3 === 0 ? "#d0d0d0" : "#b0b0b0";
      ctx.fillRect(pR - pW / 2, -pH / 2, pW, pH);
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(pR - pW / 2, -pH / 2, pW, 3);
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(pR - pW / 2, pH / 2 - 3, pW, 3);
      if (i % 2 === 0) {
        const ledG = ctx.createRadialGradient(pR, -pH / 2 + 6, 0, pR, -pH / 2 + 6, 3);
        ledG.addColorStop(0, "rgba(200,230,255,1)"); ledG.addColorStop(1, "rgba(100,150,200,0)");
        ctx.beginPath(); ctx.arc(pR, -pH / 2 + 6, 3, 0, Math.PI * 2); ctx.fillStyle = ledG; ctx.fill();
      }
      ctx.restore();
    }

    /* inner grooved band - white/silver */
    const groove = ctx.createConicGradient(0, cx, cy);
    const gSegs = 40;
    for (let i = 0; i < gSegs; i++) {
      const t = i / gSegs;
      groove.addColorStop(t, i % 2 === 0 ? "#e0e0e0" : "#a8a8a8");
      groove.addColorStop(t + 0.5 / gSegs, i % 2 === 0 ? "#d0d0d0" : "#989898");
      groove.addColorStop(t + 1 / gSegs - 0.001, "#a8a8a8");
    }
    ring(R_IN, R_MID, groove);

    /* radial grooves */
    ctx.save(); ctx.globalAlpha = 0.3;
    for (let i = 0; i < 52; i++) {
      const a = (i / 52) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R_IN, cy + Math.sin(a) * R_IN);
      ctx.lineTo(cx + Math.cos(a) * R_MID, cy + Math.sin(a) * R_MID);
      ctx.strokeStyle = i % 4 === 0 ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.7; ctx.stroke();
    }
    ctx.restore();

    /* concentric wear scratches */
    ctx.save(); ctx.globalAlpha = 0.08;
    for (let r = R_IN + 4; r < R_MID; r += 5) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.5; ctx.stroke();
    }
    ctx.restore();

    /* bracket protrusions at cardinal points - silver */
    [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((a) => {
      ctx.save();
      ctx.translate(cx + Math.cos(a) * (R_OUT - 12), cy + Math.sin(a) * (R_OUT - 12));
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = "#c0c0c0"; ctx.fillRect(-16, -8, 32, 16);
      ctx.fillStyle = "#a0a0a0"; ctx.fillRect(-16, -8, 32, 3);
      ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillRect(-16, 5, 32, 3);
      [-7, 7].forEach((bx) => {
        const bg = ctx.createRadialGradient(bx - 0.5, -1, 0, bx, 0, 2.8);
        bg.addColorStop(0, "#e0e0e0"); bg.addColorStop(1, "#909090");
        ctx.beginPath(); ctx.arc(bx, 0, 2.8, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
      });
      ctx.restore();
    });

    /* outer glint - white */
    const edgeG = ctx.createRadialGradient(cx - R_OUT * 0.45, cy - R_OUT * 0.45, R_OUT - 18, cx, cy, R_OUT + 4);
    edgeG.addColorStop(0, "rgba(255,255,255,0.3)");
    edgeG.addColorStop(0.6, "rgba(220,220,240,0.1)");
    edgeG.addColorStop(1, "rgba(0,0,0,0)");
    ring(R_OUT - 5, R_OUT + 2, edgeG);

    /* inner bevel — bright white machined edge */
    const bevel = ctx.createRadialGradient(cx, cy, R_IN - 2, cx, cy, R_IN + 7);
    bevel.addColorStop(0, "rgba(0,0,0,0)");
    bevel.addColorStop(0.35, "rgba(255,255,255,0.2)");
    bevel.addColorStop(0.62, "rgba(255,255,255,0.9)");
    bevel.addColorStop(0.8, "rgba(255,255,255,1)");
    bevel.addColorStop(1, "rgba(255,255,255,0.1)");
    ring(R_IN - 1, R_IN + 8, bevel);

  }, [size]);

  return <canvas ref={ringRef} width={size} height={size} className="absolute inset-0" style={{ zIndex: 2 }} />;
}

/* ══════════════════════════════════════════════
   PORTAL INTERIOR WITH WHITE/BLIGHT BACKGROUND
══════════════════════════════════════════════ */
function PortalInterior({ size }: { size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let frame = 0;
    const r = seededRand(77);
    const radius = size * 0.366;

    const particles = Array.from({ length: 200 }, () => ({
      angle: r() * Math.PI * 2, radius: r() * (radius - 20) + 5,
      speed: (r() * 0.003 + 0.0004) * (r() > 0.5 ? 1 : -1),
      size: r() * 2.1 + 0.3, op: r() * 0.85 + 0.12,
      drift: r() * 0.45 - 0.22, twinkle: r() * Math.PI * 2, twinkleSpeed: r() * 0.04 + 0.01,
    }));

    const draw = () => {
      const S = canvas.width, cx = S / 2, cy = S / 2, R = radius;
      ctx.clearRect(0, 0, S, S);

      /* WHITE/BRIGHT BACKGROUND */
      const whiteBg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      whiteBg.addColorStop(0,   "rgba(255,255,255,1.0)");
      whiteBg.addColorStop(0.3, "rgba(250,252,255,0.98)");
      whiteBg.addColorStop(0.6, "rgba(245,248,252,0.94)");
      whiteBg.addColorStop(0.8, "rgba(240,245,250,0.88)");
      whiteBg.addColorStop(1,   "rgba(235,240,248,0.80)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = whiteBg; ctx.fill();

      /* Soft light swirls - very subtle */
      for (let layer = 0; layer < 2; layer++) {
        const sCount = 4 + layer * 2;
        for (let i = 0; i < sCount; i++) {
          const a = frame * (0.001 + layer * 0.0008) * (layer % 2 === 0 ? 1 : -1) + (i * Math.PI * 2) / sCount;
          const sr = 28 + layer * 30, sRad = 50 + layer * 22;
          const gx = cx + Math.cos(a) * sr, gy = cy + Math.sin(a) * sr * 0.88;
          const sw = ctx.createRadialGradient(gx, gy, 0, gx, gy, sRad);
          sw.addColorStop(0, `rgba(100,150,220,${0.06 - layer * 0.02})`);
          sw.addColorStop(1, "rgba(100,150,220,0)");
          ctx.beginPath(); ctx.arc(gx, gy, sRad, 0, Math.PI * 2); ctx.fillStyle = sw; ctx.fill();
        }
      }

      /* Soft spiral arms - very subtle */
      ctx.save(); ctx.globalAlpha = 0.08;
      for (let arm = 0; arm < 2; arm++) {
        const ao = (arm / 2) * Math.PI * 2;
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 3; t += 0.05) {
          const ar = t * 26; if (ar > R - 8) break;
          const ax = cx + Math.cos(t + ao + frame * 0.003) * ar;
          const ay = cy + Math.sin(t + ao + frame * 0.003) * ar * 0.9;
          t === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
        }
        ctx.strokeStyle = "rgba(80,120,200,0.4)"; ctx.lineWidth = 1.2; ctx.stroke();
      }
      ctx.restore();

      /* Subtle stardust */
      particles.forEach((p) => {
        p.angle += p.speed; p.twinkle += p.twinkleSpeed;
        const px = cx + Math.cos(p.angle) * p.radius + Math.sin(frame * 0.007) * p.drift;
        const py = cy + Math.sin(p.angle) * p.radius * 0.96 + Math.cos(frame * 0.006) * p.drift;
        if (Math.hypot(px - cx, py - cy) > R - 5) return;
        const op = p.op * (0.4 + 0.3 * Math.sin(p.twinkle));
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60,100,160,${op * 0.5})`; ctx.fill();
      });

      /* Subtle pulsing rings */
      for (let ri = 0; ri < 3; ri++) {
        const rr = 40 + ri * Math.min(R / 6, 30);
        const pulse = Math.sin(frame * 0.02 - ri * 0.65) * 0.3 + 0.4;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(80,130,210,${0.1 * pulse})`;
        ctx.lineWidth = 0.8 + pulse * 0.8; ctx.stroke();
      }

      /* Core - bright */
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
      core.addColorStop(0, "rgba(255,255,255,0.95)");
      core.addColorStop(0.4, "rgba(240,248,255,0.75)");
      core.addColorStop(0.7, "rgba(200,220,250,0.35)");
      core.addColorStop(1, "rgba(180,210,240,0.0)");
      ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI * 2); ctx.fillStyle = core; ctx.fill();

      frame++;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <canvas ref={canvasRef} width={size} height={size} className="absolute inset-0 rounded-full"
      style={{ zIndex: 3 }} />
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function PortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [contentVisible, setContentVisible] = useState(true);
  const [portalSize, setPortalSize] = useState(620);

  /* responsive portal size */
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      setPortalSize(vw < 480 ? vw - 32 : vw < 768 ? Math.min(vw - 48, 520) : 620);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* stable stars */
  const stars = useMemo(() => {
    const r = seededRand(13);
    return Array.from({ length: 80 }, () => ({
      top: r() * 100, left: r() * 100, size: r() * 1.5 + 0.4, op: r() * 0.4 + 0.1,
    }));
  }, []);

  const innerR  = portalSize * 0.366;
  const innerPx = innerR * 2 - 24;

  const goNext = () => {
    if (step === 1) {
      setContentVisible(false);
      setTimeout(() => { setStep(2); setContentVisible(true); }, 380);
    } else {
      setContentVisible(false);
      setTimeout(() => router.push("/dashboard"), 600);
    }
  };

  const goBack = () => {
    setContentVisible(false);
    setTimeout(() => { setStep(1); setContentVisible(true); }, 380);
  };

  return (
    <CosmicBackgroundWrapper>
      <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden">
        {/* ── Google Fonts ── */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap');

          @keyframes portalIn {
            from { opacity: 0; transform: scale(0.72) translateY(28px); filter: blur(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);    filter: blur(0); }
          }
          @keyframes portalOut {
            from { opacity: 1; transform: scale(1)    translateY(0);    filter: blur(0); }
            to   { opacity: 0; transform: scale(1.12) translateY(-22px);filter: blur(6px); }
          }
          @keyframes rimPulse {
            0%,100% { opacity: 0.7; }
            50%     { opacity: 0.4; }
          }
          @keyframes starFloat {
            0%,100% { opacity: 0.15; }
            50%     { opacity: 0.5; }
          }
          .portal-content-in  { animation: portalIn  0.42s cubic-bezier(.22,1,.36,1) both; }
          .portal-content-out { animation: portalOut 0.32s ease-in both; }
        `}</style>

        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%`,
                opacity: s.op,
                animation: `starFloat ${2 + (i % 4)}s ${(i % 5) * 0.8}s ease-in-out infinite`,
              }} />
          ))}
        </div>

        {/* Ambient glow */}
        <div className="absolute pointer-events-none" style={{
          bottom: "4%", left: "1%", width: 350, height: 180,
          background: "radial-gradient(ellipse, rgba(22,110,100,0.15) 0%, transparent 70%)",
          filter: "blur(24px)",
        }} />

        {/* ═══ PORTAL ═══ */}
        <div
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ width: portalSize, height: portalSize }}
        >
          {/* outer shadow depth */}
          <div className="absolute inset-0 rounded-full" style={{
            boxShadow: "0 0 40px 12px rgba(0,0,0,0.5), 0 0 80px 30px rgba(0,0,0,0.3)",
            zIndex: 1,
          }} />

          {/* Portal interior with white background */}
          <PortalInterior size={portalSize} />

          {/* White/Silver ring on top */}
          <MetallicRing size={portalSize} />

          {/* Inner bright energy rim */}
          <div className="absolute pointer-events-none" style={{
            width: innerR * 2, height: innerR * 2,
            top: `calc(50% - ${innerR}px)`, left: `calc(50% - ${innerR}px)`,
            borderRadius: "50%", zIndex: 5,
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.6)",
              "0 0 0 3px rgba(200,220,240,0.3)",
              "inset 0 0 0 1px rgba(255,255,255,0.5)",
            ].join(","),
            animation: "rimPulse 3.2s ease-in-out infinite",
          }} />

          {/* LED accent lights */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div key={deg} className="absolute" style={{
              width: i % 2 === 0 ? 8 : 5, height: i % 2 === 0 ? 3 : 2.5,
              top: "50%", left: "50%", borderRadius: 2,
              background: i % 2 === 0 ? "rgba(180,210,240,0.8)" : "rgba(160,200,230,0.6)",
              boxShadow: i % 2 === 0
                ? "0 0 5px 2px rgba(160,200,240,0.5)"
                : "0 0 3px 1px rgba(160,200,240,0.3)",
              transform: `rotate(${deg}deg) translateX(${innerR + 3}px) translateY(-50%)`,
              transformOrigin: "0 50%",
              zIndex: 6,
            }} />
          ))}

          {/* ── PORTAL CONTENT OVERLAY ── */}
          <div
            className={`absolute flex flex-col items-center justify-center text-center ${contentVisible ? "portal-content-in" : "portal-content-out"}`}
            style={{
              width: innerPx, height: innerPx,
              top: `calc(50% - ${innerPx / 2}px)`,
              left: `calc(50% - ${innerPx / 2}px)`,
              zIndex: 7,
              padding: `${portalSize * 0.04}px`,
              borderRadius: "20px",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="flex flex-col items-center gap-3 w-full">
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: `clamp(9px, ${portalSize * 0.019}px, 11px)`,
                  letterSpacing: "0.18em",
                  color: "#3b82f6",
                  fontWeight: 600,
                }}>WELCOME TO</span>

                <h1 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: `clamp(28px, ${portalSize * 0.098}px, 64px)`,
                  lineHeight: 1.0,
                  background: "linear-gradient(160deg, #1e3a8a 0%, #3b82f6 45%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: 0,
                }}>
                  The ONLY 1<br />Dashboard
                </h1>

                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: `clamp(9px, ${portalSize * 0.021}px, 13px)`,
                  color: "#334155",
                  maxWidth: innerPx * 0.78,
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  The only platform for small & medium businesses to grow traffic, increase sales, and rank everywhere.
                </p>

                <div style={{
                  display: "flex", flexDirection: "column", gap: `${portalSize * 0.014}px`,
                  width: "85%",
                }}>
                  {["🚀 Increase Store Traffic", "💰 Increase Sales", "📈 Rank in AEO, GEO & Google"].map((item, i) => (
                    <div key={i} style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: `clamp(8px, ${portalSize * 0.018}px, 11px)`,
                      color: "#1e40af",
                      background: "rgba(59,130,246,0.1)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      borderRadius: 20,
                      padding: `${portalSize * 0.012}px ${portalSize * 0.022}px`,
                      fontWeight: 500,
                    }}>{item}</div>
                  ))}
                </div>

                <button
                  onClick={goNext}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: `clamp(9px, ${portalSize * 0.02}px, 12px)`,
                    fontWeight: 700,
                    color: "#fff",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    border: "none",
                    borderRadius: 999,
                    padding: `${portalSize * 0.018}px ${portalSize * 0.055}px`,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
                    transition: "transform 0.18s",
                    letterSpacing: "0.08em",
                    marginTop: `${portalSize * 0.008}px`,
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
                >
                  Enter Portal →
                </button>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="flex flex-col items-center gap-4 w-full">
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: `clamp(8px, ${portalSize * 0.017}px, 10px)`,
                  letterSpacing: "0.18em",
                  color: "#8b5cf6",
                  fontWeight: 600,
                }}>CHOOSE YOUR PATH</span>

                <h2 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: `clamp(22px, ${portalSize * 0.076}px, 48px)`,
                  lineHeight: 1.05,
                  color: "#1e1b4b",
                  margin: 0,
                }}>
                  Your Way <span style={{ color: "#8b5cf6" }}>vs</span> One Way
                </h2>

                {/* Non-selectable Cards */}
                <div style={{ display: "flex", gap: `${portalSize * 0.022}px`, width: "95%", marginTop: "8px" }}>
                  {/* Your Way Card */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: `${portalSize * 0.01}px`,
                      padding: `${portalSize * 0.024}px ${portalSize * 0.016}px`,
                      borderRadius: 14,
                      background: "#f3e8ff",
                      border: "2px solid #8b5cf6",
                      boxShadow: "0 4px 12px rgba(139,92,246,0.15)",
                    }}
                  >
                    <span style={{ fontSize: `clamp(18px, ${portalSize * 0.044}px, 28px)` }}>✍️</span>
                    <span style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: `clamp(13px, ${portalSize * 0.032}px, 20px)`,
                      color: "#1e293b",
                    }}>Your Way</span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: `clamp(7px, ${portalSize * 0.016}px, 10px)`,
                      color: "#8b5cf6",
                      fontWeight: 600,
                    }}>Manual</span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: `clamp(7px, ${portalSize * 0.016}px, 10px)`,
                      color: "#475569",
                      lineHeight: 1.4,
                      textAlign: "center",
                    }}>Choose topic → Write blog → Copy to store → Publish</span>
                  </div>

                  {/* One Way Card */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: `${portalSize * 0.01}px`,
                      padding: `${portalSize * 0.024}px ${portalSize * 0.016}px`,
                      borderRadius: 14,
                      background: "#eff6ff",
                      border: "2px solid #3b82f6",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.15)",
                    }}
                  >
                    <span style={{ fontSize: `clamp(18px, ${portalSize * 0.044}px, 28px)` }}>🤖</span>
                    <span style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: `clamp(13px, ${portalSize * 0.032}px, 20px)`,
                      color: "#1e293b",
                    }}>One Way</span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: `clamp(7px, ${portalSize * 0.016}px, 10px)`,
                      color: "#3b82f6",
                      fontWeight: 600,
                    }}>Full Automation</span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: `clamp(7px, ${portalSize * 0.016}px, 10px)`,
                      color: "#475569",
                      lineHeight: 1.4,
                      textAlign: "center",
                    }}>AI analyzes → Generates → Schedules → Auto-posts & ranks on Google</span>
                  </div>
                </div>

                {/* nav row */}
                <div style={{ display: "flex", gap: `${portalSize * 0.022}px`, marginTop: `${portalSize * 0.008}px` }}>
                  <button
                    onClick={goBack}
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: `clamp(8px, ${portalSize * 0.017}px, 10px)`,
                      color: "#475569",
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 999, cursor: "pointer",
                      padding: `${portalSize * 0.014}px ${portalSize * 0.036}px`,
                      transition: "background 0.18s",
                      fontWeight: 500,
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = "#e2e8f0"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = "#f1f5f9"; }}
                  >← Back</button>

                  <button
                    onClick={goNext}
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: `clamp(8px, ${portalSize * 0.017}px, 10px)`,
                      fontWeight: 700, color: "#fff",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      border: "none",
                      borderRadius: 999, cursor: "pointer",
                      padding: `${portalSize * 0.014}px ${portalSize * 0.042}px`,
                      boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                      transition: "transform 0.18s",
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.transform = "scale(1.05)"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
                  >Continue →</button>
                </div>
              </div>
            )}
          </div>
          {/* end content overlay */}
        </div>
        {/* end portal */}
      </div>
    </CosmicBackgroundWrapper>
  );
}