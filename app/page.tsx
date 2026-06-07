"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "./components/landingPage/nav";

// ─── Animated Star Field ───────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.007 + 0.003,
    }));
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.phase += s.speed;
        const a = 0.25 + 0.7 * Math.abs(Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,225,255,${a})`;
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Orbital Rings (CSS animated) ─────────────────────────────────────────
function OrbitalRings() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden">
      <svg viewBox="0 0 900 480" className="w-full" style={{ maxWidth: 1200, marginBottom: -2 }} preserveAspectRatio="xMidYMax meet">
        {[460, 370, 290, 210, 140].map((rx, i) => (
          <ellipse key={i} cx={450} cy={480} rx={rx} ry={rx * 0.26} fill="none" stroke={`rgba(100,160,255,${0.07 + i * 0.02})`} strokeWidth={0.8} />
        ))}
      </svg>
    </div>
  );
}

function Planet() {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 720, height: 360 }}>
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -70, width: 700, height: 340, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 55%, rgba(30,90,210,0.3) 0%, rgba(10,35,110,0.15) 50%, transparent 75%)", filter: "blur(22px)" }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -100, width: 620, height: 310, borderRadius: "50%", background: "radial-gradient(ellipse at 44% 36%, #4080e0 0%, #1a3ea0 32%, #0d1f6a 58%, #05103a 100%)", boxShadow: "0 0 90px 24px rgba(30,80,200,0.35), inset 0 -24px 70px rgba(0,0,30,0.55)", overflow: "hidden" }}>
        {[28, 52, 72].map((t, i) => (<div key={i} style={{ position: "absolute", top: `${t}%`, left: 0, right: 0, height: 16, background: "linear-gradient(90deg,transparent,rgba(80,150,255,0.07),rgba(60,130,220,0.1),transparent)", borderRadius: "50%", transform: "scaleX(1.15)" }} />))}
        <div style={{ position: "absolute", top: "7%", left: "10%", width: "52%", height: "32%", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(110,180,255,0.18) 0%,transparent 70%)", transform: "rotate(-18deg)" }} />
      </div>
    </div>
  );
}

// ─── Floating Orbs ────────────────────────────────────────────────────────
function FloatingOrbs() {
  const orbs = [
    { size: 300, x: "10%", y: "20%", color: "rgba(59,130,246,0.12)", dur: "8s" },
    { size: 200, x: "75%", y: "60%", color: "rgba(168,85,247,0.10)", dur: "11s" },
    { size: 400, x: "60%", y: "5%", color: "rgba(14,165,233,0.08)", dur: "14s" },
    { size: 150, x: "5%", y: "70%", color: "rgba(236,72,153,0.08)", dur: "9s" },
  ];
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            animation: `float-orb ${orb.dur} ease-in-out infinite alternate`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}



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
        x: (e.clientX - cx) / rect.width,   // -0.5 to 0.5
        y: (e.clientY - cy) / rect.height,  // -0.5 to 0.5
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Parallax offset values (astronaut moves more than bg)
  const astroX = mouse.x * 28;
  const astroY = mouse.y * 18;
  const bgX    = mouse.x * -8;
  const bgY    = mouse.y * -5;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap');

        @keyframes hero-fadein {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes badge-glow {
          0%,100% { box-shadow:0 0 0 0 rgba(96,165,250,0); }
          50%      { box-shadow:0 0 0 5px rgba(96,165,250,0.18); }
        }
        @keyframes dot-pulse {
          0%,100% { opacity:0.6; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.35); }
        }

        /* The key trick: title layer is a stacking context */
        .title-wrap {
          position: relative;
          isolation: isolate;
        }

        /* Giant title text */
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 14vw, 158px);
          line-height: 0.9;
          letter-spacing: 0.01em;
          color: #fff;
          margin: 0;
          user-select: none;
          animation: hero-fadein 0.8s cubic-bezier(.22,1,.36,1) 0.2s both;
        }

        /* The "SEARCH" outline word */
        .hero-title-outline {
          color: transparent;
          -webkit-text-stroke: 2.5px rgba(255,255,255,0.5);
        }

        /* Astronaut image — sits OVER the title using mix-blend-mode
           so wherever the astronaut overlaps white text, 
           the text shows through (multiply darkens white to image color) */
        .astronaut-img {
          position: absolute;
          pointer-events: none;
          user-select: none;
          mix-blend-mode: lighten;   /* text appears transparent behind white suit */
          filter: drop-shadow(0 0 32px rgba(80,140,255,0.25))
                  drop-shadow(0 0 80px rgba(40,80,200,0.18));
          will-change: transform;
          transition: transform 0.12s cubic-bezier(.22,1,.36,1);
        }

        .input-wrap:focus-within {
          border-color: rgba(100,160,255,0.65) !important;
          box-shadow: 0 0 0 3px rgba(60,130,255,0.14), 0 0 28px rgba(60,130,255,0.22) !important;
        }

        ::placeholder { color: rgba(140,180,255,0.3); }
      `}</style>

      <section
        ref={sectionRef}
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(175deg,#030c1e 0%,#06132e 45%,#0b1c4a 80%,#0e2255 100%)" }}
      >
        {/* Stars layer */}
        <StarField />

        {/* Subtle top atmospheric radial */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 55% 0%,rgba(25,65,170,0.2) 0%,transparent 60%)" }} />

        {/* Orbit arcs + planet */}
        <OrbitalRings />
        <Planet />

        {/* ── Nav ── */}
        

        {/* ── Content layer ── */}
        <div className="relative z-10 flex flex-col px-8 md:px-14 mt-10 md:mt-14" style={{ maxWidth: 800 }}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 self-start mb-7"
            style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(160,205,255,0.85)", border:"1px solid rgba(100,160,255,0.22)", borderRadius:999, padding:"6px 14px", background:"rgba(30,65,170,0.18)", backdropFilter:"blur(10px)", animation:"badge-glow 3s ease-in-out infinite, hero-fadein 0.6s ease 0.05s both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#60a5fa", display:"inline-block", animation:"dot-pulse 2s ease-in-out infinite" }} />
            2,479+ Businesses Growing · Zero Technical Skills
          </div>

          {/* ── Title + Astronaut stacking zone ── */}
          <div className="title-wrap" style={{ position: "relative" }}>

            {/* Title text — z-index 1, below astronaut */}
            <h1 className="hero-title" style={{ position: "relative", zIndex: 1 }}>
              Dominate<br />
              <span className="hero-title-outline">Search</span>
            </h1>

            {/* ── ASTRONAUT — real photo, parallax, mix-blend-mode ── */}
            <img
              src="/astronot.png"
              alt="floating astronaut"
              className="astronaut-img"
              style={{
                /* Position: right side, overlapping both title lines */
                position: "absolute",
                right: "-18%",
                top: "-10%",
                width: "clamp(320px, 42vw, 600px)",
                zIndex: 2,
                transform: `translate(${astroX}px, ${astroY}px) rotate(-6deg)`,
              }}
            />
          </div>

          {/* Subtext */}
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:15, color:"rgba(200,225,255,0.58)", marginTop:18, marginBottom:34, maxWidth:440, lineHeight:1.75, animation:"hero-fadein 0.7s ease 0.42s both" }}>
            We write{" "}
            <span style={{ color:"#93c5fd", fontWeight:600 }}>30 deep-researched articles</span> +
            build{" "}
            <span style={{ color:"#c4b5fd", fontWeight:600 }}>100 DA backlinks</span>{" "}
            every month — ChatGPT, Perplexity &amp; Google included.
          </p>

          {/* ── Input pill ── */}
          <div className="input-wrap"
            style={{ display:"flex", alignItems:"center", maxWidth:500, background:"rgba(6,16,48,0.78)", border:"1px solid rgba(100,160,255,0.28)", borderRadius:999, padding:"6px 6px 6px 20px", backdropFilter:"blur(18px)", boxShadow:"0 4px 28px rgba(0,0,0,0.35)", transition:"border-color 0.2s, box-shadow 0.2s", animation:"hero-fadein 0.7s ease 0.58s both" }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:"rgba(100,150,255,0.48)", whiteSpace:"nowrap", marginRight:4 }}>https://</span>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="yourwebsite.com"
              style={{ flex:1, background:"transparent", border:"none", outline:"none", fontFamily:"'Space Mono',monospace", fontSize:13, color:"#ddeeff", caretColor:"#60a5fa" }}
            />
            <button
              style={{ background:"#fff", color:"#07122e", border:"none", borderRadius:999, padding:"10px 22px", fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"opacity 0.18s, transform 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity="0.88"; (e.currentTarget as HTMLElement).style.transform="scale(1.03)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity="1"; (e.currentTarget as HTMLElement).style.transform="scale(1)"; }}>
              Get 3 Free Articles ↗
            </button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-7"
            style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(140,185,255,0.5)", animation:"hero-fadein 0.7s ease 0.72s both" }}>
            {[{ icon:"🚀", label:"216% Avg Traffic Increase" }, { icon:"🌍", label:"100 Languages" }, { icon:"⚡", label:"1 Article Daily" }].map(s => (
              <span key={s.label} style={{ display:"flex", alignItems:"center", gap:6 }}>{s.icon} {s.label}</span>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background:"linear-gradient(0deg,rgba(3,9,24,0.92) 0%,transparent 100%)" }} />
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
    <section className="relative py-32 px-6 text-center overflow-hidden">
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

      <div
        className="relative min-h-screen"
        style={{ background: "linear-gradient(180deg, #020b18 0%, #030e20 50%, #060818 100%)" }}
      >
        <StarField />
        <FloatingOrbs />
        <Nav />
        <Hero />
        <HowItWorks />
        <StatsBanner />
        <Testimonials />
        <Pricing />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}