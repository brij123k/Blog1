"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "./components/landingPage/nav";
import CosmicBackgroundWrapper from "./components/CosmicBackgroundWrapper";



// ─── Hero ─────────────────────────────────────────────────────────────────
function Hero() {
  const [url, setUrl] = useState("");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse parallax tracker
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setMouse({
        x: (e.clientX - cx) / rect.width,
        y: (e.clientY - cy) / rect.height,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Parallax offset values
  const astronautX = mouse.x * 20;
  const astronautY = mouse.y * 15;
  const titleX = mouse.x * 5;
  const titleY = mouse.y * 3;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap');

        @keyframes hero-fadein-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes hero-fadein-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes hero-fadein-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(96,165,250,0); }
          50% { box-shadow: 0 0 0 5px rgba(96,165,250,0.18); }
        }
        
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }
        
        @keyframes float-astronaut {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(-3deg); }
          25% { transform: translateY(-10px) translateX(8px) rotate(-1deg); }
          50% { transform: translateY(0px) translateX(15px) rotate(-5deg); }
          75% { transform: translateY(10px) translateX(8px) rotate(-1deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        /* Giant title text */
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(60px, 10vw, 130px);
          line-height: 0.85;
          letter-spacing: 0.01em;
          color: #fff;
          margin: 0;
          user-select: none;
          text-shadow: 0 0 30px rgba(0,0,0,0.5);
        }

        /* The "SEARCH" outline word */
        .hero-title-outline {
          color: transparent;
          -webkit-text-stroke: 2.5px rgba(255,255,255,0.6);
          text-shadow: none;
        }

        /* Astronaut image - positioned on right */
        .astronaut-wrapper {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }

        .astronaut-bg {
          filter: drop-shadow(0 0 50px rgba(80,140,255,0.4))
                  drop-shadow(0 0 120px rgba(40,80,200,0.3));
          will-change: transform;
        }

        /* Text content wrapper - on left */
        .hero-content {
          position: relative;
          z-index: 3;
        }

        /* Title that overlaps the image */
        .overlapping-title {
          position: relative;
          z-index: 4;
        }

        .input-wrap:focus-within {
          border-color: rgba(100,160,255,0.65) !important;
          box-shadow: 0 0 0 3px rgba(60,130,255,0.14), 0 0 28px rgba(60,130,255,0.22) !important;
        }

        ::placeholder { color: rgba(140,180,255,0.3); }
        
        /* Floating particles */
        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(100,160,255,0.4), transparent);
          border-radius: 50%;
          pointer-events: none;
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative min-h-screen w-full flex items-center"
        style={{ background: "transparent" }}
      >
        {/* Astronaut Background Layer - Center Right */}
        <div className="astronaut-wrapper">
          <div
            className="astronaut-bg"
            style={{
              transform: `translate(${astronautX}px, ${astronautY}px)`,
              animation: "float-astronaut 10s ease-in-out infinite",
            }}
          >
            <img
              src="/astronot.png"
              alt="floating astronaut"
              style={{
                width: "clamp(400px, 45vw, 700px)",
                height: "auto",
                mixBlendMode: "screen",
                display: "block",
              }}
            />
            
            {/* Glow effect behind astronaut */}
            <div
              style={{
                position: "absolute",
                inset: "-15%",
                background: "radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)",
                filter: "blur(50px)",
                borderRadius: "50%",
                zIndex: -1,
                animation: "glow-pulse 4s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Floating particles for depth */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: Math.random() * 8 + 2,
              height: Math.random() * 8 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              opacity: Math.random() * 0.4,
            }}
          />
        ))}

        {/* Content Layer - Left Side */}
        <div className="hero-content w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-6 md:mb-8"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: "rgba(160,205,255,0.85)",
                border: "1px solid rgba(100,160,255,0.22)",
                borderRadius: 999,
                padding: "6px 16px",
                background: "rgba(30,65,170,0.15)",
                backdropFilter: "blur(10px)",
                animation: "badge-glow 3s ease-in-out infinite, hero-fadein-left 0.6s ease 0.05s both",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#60a5fa",
                  display: "inline-block",
                  animation: "dot-pulse 2s ease-in-out infinite",
                }}
              />
              2,479+ Businesses Growing · Zero Technical Skills
            </div>

<div
  className="overlapping-title"
  style={{
    animation: "hero-fadein-left 0.8s cubic-bezier(.22,1,.36,1) 0.2s both",
    whiteSpace: "nowrap",
  }}
>
  <h1
    className="hero-title"
    style={{
      transform: `translate(${titleX * 0.3}px, ${titleY * 0.3}px)`,
      display: "inline-block",
      margin: 0,
      marginRight: "clamp(12px, 3vw, 30px)",
      fontSize: "clamp(60px, 12vw, 148px)",
      lineHeight: 1,
    }}
  >
    DOMINATE
  </h1>
  <h1
    className="hero-title"
    style={{
      transform: `translate(${titleX * 0.2}px, ${titleY * 0.2}px)`,
      display: "inline-block",
      margin: 0,
      fontSize: "clamp(60px, 12vw, 148px)",
      lineHeight: 1,
    }}
  >
    <span className="hero-title-outline">SEARCH</span>
  </h1>
</div>    

            {/* Subtext */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(14px, 3vw, 16px)",
                color: "rgba(200,225,255,0.65)",
                marginTop: 24,
                marginBottom: 36,
                maxWidth: 500,
                lineHeight: 1.7,
                animation: "hero-fadein-left 0.7s ease 0.42s both",
              }}
            >
              We write{" "}
              <span style={{ color: "#93c5fd", fontWeight: 600 }}>
                30 deep-researched articles
              </span>{" "}
              + build{" "}
              <span style={{ color: "#c4b5fd", fontWeight: 600 }}>
                100 DA backlinks
              </span>{" "}
              every month — ChatGPT, Perplexity &amp; Google included.
            </p>

            {/* Input Pill */}
            <div
              className="input-wrap"
              style={{
                display: "flex",
                alignItems: "center",
                maxWidth: 520,
                width: "100%",
                background: "rgba(6,16,48,0.7)",
                border: "1px solid rgba(100,160,255,0.28)",
                borderRadius: 999,
                padding: "6px 6px 6px 24px",
                backdropFilter: "blur(18px)",
                boxShadow: "0 4px 28px rgba(0,0,0,0.35)",
                transition: "border-color 0.2s, box-shadow 0.2s",
                animation: "hero-fadein-left 0.7s ease 0.58s both",
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  color: "rgba(100,150,255,0.48)",
                  whiteSpace: "nowrap",
                  marginRight: 8,
                }}
              >
                https://
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourwebsite.com"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  color: "#ddeeff",
                  caretColor: "#60a5fa",
                  padding: "10px 0",
                }}
              />
              <button
                style={{
                  background: "#fff",
                  color: "#07122e",
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 26px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "opacity 0.18s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "0.88";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
              >
                Get 3 Free Articles ↗
              </button>
            </div>

            {/* Stats Row */}
            <div
              className="flex flex-wrap gap-6 mt-8"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: "rgba(140,185,255,0.5)",
                animation: "hero-fadein-left 0.7s ease 0.72s both",
              }}
            >
              {[
                { icon: "🚀", label: "216% Avg Traffic Increase" },
                { icon: "🌍", label: "100 Languages" },
                { icon: "⚡", label: "1 Article Daily" },
              ].map((s) => (
                <span
                  key={s.label}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  {s.icon} {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Gradient overlay for better text readability on the left */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, rgba(3,9,24,0.4) 0%, rgba(3,9,24,0.1) 50%, transparent 100%)",
            zIndex: 2,
          }}
        />
      </section>
    </>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Enter Your Website",
      desc: "Our AI scans your site, understands your niche, and maps your competition landscape instantly.",
      icon: "🔭",
      color: "#3b82f6",
    },
    {
      num: "02",
      title: "We Research & Write",
      desc: "30 deep-researched, EEAT-compliant articles published to your blog every month. Daily cadence.",
      icon: "✍️",
      color: "#8b5cf6",
    },
    {
      num: "03",
      title: "Backlinks Built",
      desc: "We build 100 DA-level backlinks every month, signalling authority to Google and AI engines.",
      icon: "🔗",
      color: "#ec4899",
    },
    {
      num: "04",
      title: "Watch Traffic Soar",
      desc: "Sit back as ChatGPT, Perplexity, and Google start recommending your brand to millions.",
      icon: "📈",
      color: "#06b6d4",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p
            className="text-xs text-blue-400 mb-3 tracking-widest"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            — THE PROCESS —
          </p>
          <h2
            className="text-4xl md:text-5xl font-black"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(90deg, #93c5fd, #e879f9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative p-6 rounded-2xl border group transition-all duration-500 hover:-translate-y-2"
              style={{
                background: "rgba(10,18,35,0.7)",
                borderColor: `${step.color}25`,
                backdropFilter: "blur(12px)",
                boxShadow: `0 0 30px ${step.color}10`,
                animationDelay: `${i * 0.15}s`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${step.color}30`;
                (e.currentTarget as HTMLElement).style.borderColor = `${step.color}50`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${step.color}10`;
                (e.currentTarget as HTMLElement).style.borderColor = `${step.color}25`;
              }}
            >
              <div
                className="text-3xl mb-4 w-12 h-12 flex items-center justify-center rounded-xl"
                style={{ background: `${step.color}18` }}
              >
                {step.icon}
              </div>
              <div
                className="text-xs font-bold mb-2"
                style={{ color: step.color, fontFamily: "'Space Mono', monospace" }}
              >
                {step.num}
              </div>
              <h3
                className="text-lg font-bold text-white mb-3"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm text-blue-200/50 leading-relaxed"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Banner ─────────────────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { value: "216%", label: "Avg Traffic Increase" },
    { value: "2,479+", label: "Businesses Growing" },
    { value: "30", label: "Articles / Month" },
    { value: "100+", label: "Languages" },
  ];

  return (
    <section className="relative py-16 px-6">
      <div
        className="max-w-5xl mx-auto rounded-3xl border px-8 py-12"
        style={{
          background:
            "linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(76,29,149,0.2) 50%, rgba(131,24,67,0.2) 100%)",
          borderColor: "rgba(96,165,250,0.2)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(59,130,246,0.15)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div
                className="text-4xl md:text-5xl font-black mb-2"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  background: "linear-gradient(90deg, #60a5fa, #e879f9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
              </div>
              <div
                className="text-xs text-blue-300/50"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────
function Testimonials() {
  const cards = [
    {
      name: "Alexandra Truta",
      role: "Copywriter · MiniCRM",
      quote:
        "Content-wise the articles are great, with accurate info and impressive formatting. Actually very impressed with the quality.",
      flag: "🇷🇴",
    },
    {
      name: "Martin Bonauer",
      role: "Real Estate Switzerland",
      quote:
        "The quality of published articles is truly remarkable. I just gained my first customer who called because of a published article.",
      flag: "🇨🇭",
    },
    {
      name: "Sarah Chen",
      role: "E-commerce · Singapore",
      quote:
        "Within 60 days, my Shopify store started ranking for terms I never thought possible. AutoSEO is the real deal.",
      flag: "🇸🇬",
    },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs text-pink-400 mb-3 tracking-widest"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            — TRUSTED WORLDWIDE —
          </p>
          <h2
            className="text-4xl font-black"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(90deg, #f9a8d4, #93c5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Real Results, Real Businesses
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border transition-all duration-400 hover:-translate-y-1"
              style={{
                background: "rgba(8,16,32,0.8)",
                borderColor: "rgba(147,197,253,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="text-2xl mb-1 text-blue-300/30">"</div>
              <p
                className="text-sm text-blue-200/70 leading-relaxed mb-6"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {c.quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: "rgba(59,130,246,0.15)" }}
                >
                  {c.flag}
                </div>
                <div>
                  <div
                    className="text-sm font-bold text-white"
                    style={{ fontFamily: "'Orbitron', monospace" }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="text-xs text-blue-400/50"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {c.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$299",
      color: "#3b82f6",
      features: ["10 Articles / Month", "30 Backlinks", "5 Languages", "Email Support"],
    },
    {
      name: "Growth",
      price: "$599",
      color: "#8b5cf6",
      popular: true,
      features: [
        "30 Articles / Month",
        "100 DA Backlinks",
        "All Languages",
        "Priority Support",
        "Weekly Reports",
      ],
    },
    {
      name: "Agency",
      price: "$1,299",
      color: "#ec4899",
      features: [
        "60 Articles / Month",
        "200 DA Backlinks",
        "All Languages",
        "Dedicated Manager",
        "White-label Reports",
        "API Access",
      ],
    },
  ];

  return (
    <section id="pricing" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs text-purple-400 mb-3 tracking-widest"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            — PRICING —
          </p>
          <h2
            className="text-4xl font-black"
            style={{
              fontFamily: "'Orbitron', monospace",
              background: "linear-gradient(90deg, #c084fc, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Choose Your Orbit
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-7 rounded-2xl border transition-all duration-300 hover:-translate-y-2 ${
                plan.popular ? "scale-105" : ""
              }`}
              style={{
                background: plan.popular
                  ? `linear-gradient(135deg, rgba(30,18,80,0.9), rgba(15,10,50,0.95))`
                  : "rgba(8,16,32,0.85)",
                borderColor: `${plan.color}${plan.popular ? "60" : "25"}`,
                backdropFilter: "blur(16px)",
                boxShadow: plan.popular ? `0 0 60px ${plan.color}30` : `0 0 20px ${plan.color}10`,
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{
                    background: `linear-gradient(90deg, #7c3aed, #db2777)`,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  MOST POPULAR
                </div>
              )}
              <div
                className="text-sm font-bold mb-2"
                style={{ color: plan.color, fontFamily: "'Space Mono', monospace" }}
              >
                {plan.name}
              </div>
              <div
                className="text-5xl font-black text-white mb-1"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {plan.price}
              </div>
              <div
                className="text-xs text-blue-400/40 mb-6"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                per month
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-blue-200/60"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    <span style={{ color: plan.color }}>✦</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-3 rounded-full font-bold text-sm text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${plan.color}, ${
                    plan.color === "#3b82f6"
                      ? "#6366f1"
                      : plan.color === "#8b5cf6"
                      ? "#db2777"
                      : "#f97316"
                  })`,
                  boxShadow: `0 0 20px ${plan.color}40`,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                Get Started →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="relative py-32 px-6 text-center ">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.4 }}
      >
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(124,58,237,0.1) 50%, transparent 80%)",
            animation: "pulse-glow 6s ease-in-out infinite",
          }}
        />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <p
          className="text-xs text-cyan-400 mb-4 tracking-widest"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          — START TODAY —
        </p>
        <h2
          className="text-5xl md:text-6xl font-black mb-6"
          style={{
            fontFamily: "'Orbitron', monospace",
            background: "linear-gradient(160deg, #fff, #93c5fd, #e879f9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Ready to Dominate Search?
        </h2>
        <p
          className="text-blue-200/60 mb-10 text-lg"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Get 3 free articles + your 30-day content plan, no credit card needed.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-black text-lg text-white transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #2563eb, #7c3aed, #db2777)",
            boxShadow: "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(59,130,246,0.2)",
            fontFamily: "'Orbitron', monospace",
          }}
        >
          🚀 Launch My SEO →
        </a>
        <p
          className="mt-6 text-xs text-blue-400/40"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Written in 🇬🇧 🇪🇸 🇫🇷 and 97 other languages · No technical skills needed
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="relative border-t px-6 py-12 text-center"
      style={{ borderColor: "rgba(59,130,246,0.1)" }}
    >
      <div
        className="text-xl font-bold mb-3"
        style={{
          fontFamily: "'Orbitron', monospace",
          background: "linear-gradient(90deg, #93c5fd, #e879f9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        AutoSEO
      </div>
      <p
        className="text-xs text-blue-400/30"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        © 2026 AutoSEO · Dominate ChatGPT, Perplexity & Google on autopilot.
      </p>
    </footer>
  );
}

// ─── Global Styles + Main ────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes pulse-core {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px 12px rgba(96,165,250,0.5); }
          50% { transform: scale(1.15); box-shadow: 0 0 60px 20px rgba(96,165,250,0.7); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-orb {
          from { transform: translateY(0px) scale(1); }
          to { transform: translateY(-30px) scale(1.05); }
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>

      <CosmicBackgroundWrapper>

        <Nav />
        <Hero />
        <HowItWorks />
        <StatsBanner />
        <Testimonials />
        <Pricing />
        <FinalCTA />
        <Footer />
      </CosmicBackgroundWrapper>
    </>
  );
}