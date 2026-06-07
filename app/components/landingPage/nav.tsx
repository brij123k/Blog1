"use client";

import { useEffect, useRef, useState } from "react";

// ── Spinning orbital logo mark ─────────────────────────────────────────────
function OrbitalLogo() {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      {/* Outer spinning ring */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 36 36"
        style={{ animation: "nav-orbit-spin 6s linear infinite" }}
      >
        <circle
          cx="18" cy="18" r="16"
          fill="none"
          stroke="url(#orbitGrad)"
          strokeWidth="1"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        {/* Orbiting dot */}
        <circle cx="18" cy="2" r="2" fill="#93c5fd" />
        <defs>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
      {/* Inner counter-spinning ring */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 36 36"
        style={{ animation: "nav-orbit-spin 3.5s linear infinite reverse" }}
      >
        <circle
          cx="18" cy="18" r="10"
          fill="none"
          stroke="rgba(232,121,249,0.4)"
          strokeWidth="0.8"
          strokeDasharray="3 5"
        />
        <circle cx="18" cy="8" r="1.5" fill="#e879f9" opacity="0.9" />
      </svg>
      {/* Core planet */}
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 36%, #93c5fd 0%, #3b82f6 45%, #1d4ed8 100%)",
          boxShadow: "0 0 10px rgba(59,130,246,0.7), 0 0 22px rgba(59,130,246,0.3)",
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}

// ── Animated underline indicator for active link ───────────────────────────
function NavLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="relative group"
      style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, textDecoration: "none" }}
    >
      <span
        style={{
          color: active ? "#93c5fd" : "rgba(147,197,253,0.55)",
          transition: "color 0.25s",
        }}
        className="group-hover:text-blue-300!"
      >
        {label}
      </span>
      {/* Orbital dot indicator */}
      <span
        style={{
          position: "absolute",
          bottom: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: active ? 18 : 0,
          height: 2,
          borderRadius: 999,
          background: "linear-gradient(90deg, #3b82f6, #e879f9)",
          transition: "width 0.3s cubic-bezier(.22,1,.36,1)",
          boxShadow: "0 0 8px rgba(59,130,246,0.6)",
        }}
      />
      {/* Hover dot */}
      <span
        style={{
          position: "absolute",
          bottom: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 2,
          borderRadius: 999,
          background: "rgba(147,197,253,0.3)",
          transition: "width 0.25s ease",
        }}
        className="group-hover:!w-4"
      />
    </a>
  );
}

// ── Mobile menu ────────────────────────────────────────────────────────────
function MobileMenu({ open, links, active, setActive, onClose }: {
  open: boolean;
  links: string[];
  active: string;
  setActive: (l: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        pointerEvents: open ? "all" : "none",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(2,11,24,0.85)",
          backdropFilter: "blur(10px)",
          opacity: open ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 280,
          background: "linear-gradient(160deg,rgba(8,20,55,0.98),rgba(4,10,30,0.99))",
          borderLeft: "1px solid rgba(59,130,246,0.15)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(.22,1,.36,1)",
          display: "flex",
          flexDirection: "column",
          padding: "80px 32px 40px",
          gap: 8,
        }}
      >
        {/* Decorative orbital arc */}
        <svg style={{ position: "absolute", top: 0, right: 0, width: 200, opacity: 0.12 }} viewBox="0 0 200 200">
          <circle cx="200" cy="0" r="120" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5 6" />
          <circle cx="200" cy="0" r="75" fill="none" stroke="#e879f9" strokeWidth="0.8" strokeDasharray="3 7" />
        </svg>

        {links.map((l, i) => (
          <a
            key={l}
            href="#"
            onClick={(e) => { e.preventDefault(); setActive(l); onClose(); }}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 18,
              color: active === l ? "#93c5fd" : "rgba(200,220,255,0.65)",
              textDecoration: "none",
              padding: "14px 0",
              borderBottom: "1px solid rgba(59,130,246,0.08)",
              transition: "color 0.2s, padding-left 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 12,
              animation: open ? `nav-mobile-item 0.4s ease ${0.05 + i * 0.06}s both` : "none",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: active === l ? "#3b82f6" : "rgba(59,130,246,0.3)", flexShrink: 0, boxShadow: active === l ? "0 0 8px #3b82f6" : "none", transition: "all 0.2s" }} />
            {l}
          </a>
        ))}

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <a href="#" style={{ textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: 13, color: "rgba(147,197,253,0.7)", textDecoration: "none", padding: "10px 0" }}>
            Sign In
          </a>
          <a href="#" style={{ textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "12px 0", borderRadius: 999, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>
            Start Growing →
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main Nav ───────────────────────────────────────────────────────────────
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("How It Works");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);
  const links = ["How It Works", "Pricing", "Case Studies", "About"];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{`
        @keyframes nav-orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes nav-mobile-item {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes nav-cta-glow {
          0%,100% { box-shadow: 0 0 18px rgba(59,130,246,0.4); }
          50%      { box-shadow: 0 0 32px rgba(139,92,246,0.6), 0 0 60px rgba(59,130,246,0.2); }
        }
        @keyframes nav-fadein {
          from { opacity:0; transform:translateY(-14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes nav-line-scan {
          0%   { transform:scaleX(0) translateX(-50%); opacity:0; }
          50%  { transform:scaleX(1) translateX(-50%); opacity:1; }
          100% { transform:scaleX(0) translateX(50%);  opacity:0; }
        }
      `}</style>

      {/* Mobile menu */}
      <MobileMenu open={mobileOpen} links={links} active={active} setActive={setActive} onClose={() => setMobileOpen(false)} />

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: "all 0.5s ease",
          animation: "nav-fadein 0.7s cubic-bezier(.22,1,.36,1) both",
          ...(scrolled ? {
            background: "rgba(2,11,24,0.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(59,130,246,0.1)",
            boxShadow: "0 0 40px rgba(0,0,0,0.4)",
          } : {
            background: "transparent",
          }),
        }}
      >
        {/* Scan line at bottom when scrolled */}
        {scrolled && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: "50%", width: "60%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.5),rgba(139,92,246,0.5),transparent)", animation: "nav-line-scan 3s ease-in-out infinite", transformOrigin: "center" }} />
          </div>
        )}

        <div
          style={{
            maxWidth: 1152,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* ── Logo ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <OrbitalLogo />
            <span
              style={{
                fontFamily: "'Orbitron','Courier New',monospace",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "0.04em",
                background: "linear-gradient(90deg,#93c5fd,#e879f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Blob1
            </span>
          </div>

          {/* ── Desktop links ── */}
          <div
            className="hidden md:flex items-center"
            style={{ gap: 36, position: "relative" }}
          >
            {/* Orbital connector line behind links */}
            <div style={{ position: "absolute", top: "50%", left: -10, right: -10, height: 1, background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.08),rgba(139,92,246,0.08),transparent)", transform: "translateY(-50%)", pointerEvents: "none" }} />

            {links.map((l) => (
              <NavLink key={l} label={l} active={active === l} onClick={() => setActive(l)} />
            ))}
          </div>

          {/* ── Right actions ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Sign in */}
            <a
              href="#"
              className="hidden sm:block"
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 13,
                color: "rgba(147,197,253,0.65)",
                textDecoration: "none",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,1)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(147,197,253,0.65)")}
            >
              Sign In
            </a>

            {/* CTA Button */}
            <a
              href="#"
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
                padding: "9px 20px",
                borderRadius: 999,
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                boxShadow: ctaHover
                  ? "0 0 32px rgba(139,92,246,0.65), 0 0 60px rgba(59,130,246,0.25)"
                  : "0 0 18px rgba(59,130,246,0.4)",
                transform: ctaHover ? "scale(1.06)" : "scale(1)",
                transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
                whiteSpace: "nowrap",
                position: "relative",
                overflow: "hidden",
                animation: "nav-cta-glow 3s ease-in-out infinite",
              }}
            >
              {/* Shimmer sweep */}
              <span style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.18) 50%,transparent 65%)",
                transform: ctaHover ? "translateX(100%)" : "translateX(-100%)",
                transition: "transform 0.5s ease",
              }} />
              <span style={{ position: "relative" }}>Start Growing →</span>
            </a>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", gap: 5 }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "block",
                  width: i === 1 ? (mobileOpen ? 20 : 14) : 20,
                  height: 1.5,
                  borderRadius: 999,
                  background: "rgba(147,197,253,0.7)",
                  transition: "width 0.25s ease",
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}