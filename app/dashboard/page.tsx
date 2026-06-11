"use client";

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type MainTab = "store" | "competitor" | "calendar" | "keywords" | "searchconsole";
type StoreTab = "collections" | "products";
type CompetitorId = "comp1" | "comp2" | "comp3" | "comp4" | "comp5";

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
const COLLECTIONS = [
  { id: "c1", name: "Best Sellers", count: 24 },
  { id: "c2", name: "New Arrivals", count: 12 },
  { id: "c3", name: "Summer Collection", count: 18 },
  { id: "c4", name: "Winter Essentials", count: 15 },
  { id: "c5", name: "Limited Edition", count: 8 },
  { id: "c6", name: "Flash Sale", count: 33 },
];

const PRODUCTS: Record<string, { id: string; name: string; price: string }[]> = {
  c1: [
    { id: "p1", name: "Wireless Headphones Pro", price: "$129" },
    { id: "p2", name: "Smart Watch Ultra", price: "$299" },
    { id: "p3", name: "Laptop Backpack Elite", price: "$89" },
  ],
  c2: [
    { id: "p4", name: "Ultra HD Camera X1", price: "$449" },
    { id: "p5", name: "Wireless Mouse M3", price: "$49" },
  ],
  c3: [
    { id: "p6", name: "Portable Speaker Mini", price: "$79" },
    { id: "p7", name: "Beach Tote Bag", price: "$39" },
    { id: "p8", name: "Sunglasses Pro", price: "$59" },
  ],
  c4: [
    { id: "p9", name: "Thermal Flask 1L", price: "$35" },
    { id: "p10", name: "Insulated Jacket", price: "$199" },
  ],
  c5: [
    { id: "p11", name: "Gold Edition Watch", price: "$599" },
    { id: "p12", name: "Carbon Fiber Case", price: "$149" },
  ],
  c6: [
    { id: "p13", name: "Bundle Deal A", price: "$199" },
    { id: "p14", name: "Bundle Deal B", price: "$149" },
    { id: "p15", name: "Clearance Mix", price: "$29" },
  ],
};

const COMPETITORS: Record<CompetitorId, { name: string; domain: string; da: number; traffic: string; keywords: number; topPages: string[]; weaknesses: string[] }> = {
  comp1: { name: "TechGadgetHub", domain: "techgadgethub.com", da: 48, traffic: "142k/mo", keywords: 3200, topPages: ["/wireless-headphones", "/smart-watches", "/laptop-bags"], weaknesses: ["Thin blog content", "No video SEO", "Slow mobile load"] },
  comp2: { name: "GearZone", domain: "gearzone.io", da: 52, traffic: "98k/mo", keywords: 2800, topPages: ["/cameras", "/accessories", "/deals"], weaknesses: ["Outdated schema markup", "Weak backlink profile", "No AEO content"] },
  comp3: { name: "ElectroMart", domain: "electromart.co", da: 61, traffic: "310k/mo", keywords: 8100, topPages: ["/sale", "/premium-audio", "/wearables"], weaknesses: ["Low content frequency", "No email capture", "Thin category pages"] },
  comp4: { name: "PixelDrop", domain: "pixeldrop.store", da: 34, traffic: "41k/mo", keywords: 980, topPages: ["/cameras", "/lenses"], weaknesses: ["Very low DA", "No social presence", "No structured data"] },
  comp5: { name: "UrbanCarry", domain: "urbancarry.com", da: 44, traffic: "67k/mo", keywords: 1540, topPages: ["/bags", "/travel-gear"], weaknesses: ["No blog strategy", "Weak UX on mobile", "No GEO content"] },
};

const COUNTRIES = ["United States", "United Kingdom", "India", "Australia", "Canada", "Germany", "France", "UAE"];

const FESTIVALS: Record<string, string[]> = {
  "United States": ["New Year's Day", "Valentine's Day", "Independence Day", "Halloween", "Thanksgiving", "Christmas", "Black Friday", "Cyber Monday", "Super Bowl Sunday", "Memorial Day"],
  "United Kingdom": ["New Year's Day", "Valentine's Day", "Easter", "Guy Fawkes Night", "Christmas", "Boxing Day", "Mother's Day UK", "Father's Day UK"],
  "India": ["Diwali", "Holi", "Eid ul-Fitr", "Dussehra", "Independence Day", "Republic Day", "Navratri", "Pongal", "Christmas", "New Year's Day"],
  "Australia": ["Australia Day", "Easter", "ANZAC Day", "Christmas", "Boxing Day", "Melbourne Cup", "Valentine's Day", "Halloween"],
  "Canada": ["Canada Day", "Thanksgiving Canada", "Victoria Day", "Christmas", "Boxing Day", "Valentine's Day", "Halloween", "Remembrance Day"],
  "Germany": ["Oktoberfest", "Christmas", "Easter", "Carnival (Karneval)", "New Year's Day", "German Unity Day", "Valentine's Day"],
  "France": ["Bastille Day", "Christmas", "Easter", "Valentine's Day", "New Year's Day", "Armistice Day"],
  "UAE": ["Eid ul-Fitr", "Eid ul-Adha", "UAE National Day", "New Year's Day", "Prophet's Birthday", "Islamic New Year", "Al Isra' Wal Miraj"],
};

const KEYWORDS_DATA = [
  { kw: "wireless headphones 2024", vol: "18.1k", diff: 42, intent: "Commercial" },
  { kw: "best smart watch under $300", vol: "9.4k", diff: 38, intent: "Commercial" },
  { kw: "buy laptop backpack online", vol: "6.2k", diff: 29, intent: "Transactional" },
  { kw: "portable bluetooth speaker review", vol: "14k", diff: 55, intent: "Informational" },
  { kw: "waterproof camera 2024", vol: "8.8k", diff: 47, intent: "Commercial" },
  { kw: "wireless mouse for mac", vol: "5.5k", diff: 31, intent: "Commercial" },
  { kw: "best tech gifts 2024", vol: "22k", diff: 60, intent: "Informational" },
  { kw: "noise cancelling headphones deals", vol: "11.2k", diff: 44, intent: "Transactional" },
];

const SEARCH_CONSOLE_TABS = ["overview", "queries", "pages", "devices"] as const;
type SCTab = typeof SEARCH_CONSOLE_TABS[number];

/* ═══════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Hanken+Grotesk:wght@300;400;500&display=swap');

.db-root {
  --chassis-1:#1a1f2e; --chassis-2:#141826; --chassis-edge:#252b3a;
  --panel-1:#1e2433; --panel-2:#181d2c; --panel-line:#252d3f;
  --screen-1:#0b0d14; --screen-2:#050609;
  --ink-bright:#eef2f8; --ink-mid:#7e8fa8; --ink-dim:#3a4255;
  --led-on:#ff5a26; --led-off:#141926;
  --accent:#3b6fff; --accent-2:#8b5cf6;
  --sub-panel:#161b28;
}
.db-root*{box-sizing:border-box;margin:0;padding:0}
.db-root{
  font-family:'Hanken Grotesk',sans-serif;
  min-height:100vh;
  display:flex; align-items:flex-start; justify-content:center;
  padding:28px 16px 48px;
  -webkit-font-smoothing:antialiased;
  color:var(--ink-bright);
  position:relative; z-index:1;
}

/* ── CHASSIS ── */
.db-chassis{
  width:100%; max-width:1080px; position:relative;
  background:linear-gradient(175deg,var(--chassis-1) 0%,var(--chassis-2) 100%);
  border-radius:28px; padding:20px 20px 36px;
  box-shadow:
    0 1px 0 rgba(255,255,255,.06) inset,
    0 0 0 1px var(--chassis-edge),
    0 0 0 2.5px rgba(0,0,0,.7),
    0 60px 110px -40px rgba(0,0,0,.9),
    0 24px 44px -24px rgba(0,0,0,.65);
}
.db-chassis::before{
  content:""; position:absolute; inset:0; border-radius:28px; pointer-events:none;
  background-image:
    radial-gradient(rgba(255,255,255,.035) .5px,transparent .6px),
    radial-gradient(rgba(0,0,0,.2) .5px,transparent .6px);
  background-size:4px 4px,7px 7px; background-position:0 0,3px 2px;
  mix-blend-mode:overlay;
}
.db-brand{
  position:absolute; right:22px; bottom:12px;
  font-size:12px; color:#2d3848; letter-spacing:.05em;
  font-family:'Space Mono',monospace;
}

/* ── TOP BAR ── */
.db-topbar{
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:16px; padding:0 2px;
  gap:12px;
}
.db-topbar-left{display:flex;align-items:center;gap:10px;flex-shrink:0}
.db-topbar-logo-dot{width:8px;height:8px;border-radius:50%;background:var(--led-on);box-shadow:0 0 8px 2px rgba(255,90,38,.8)}
.db-topbar-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.07em;color:var(--ink-mid)}
.db-top-btns{display:flex;gap:8px}
.db-topbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0}

/* ── METALLIC BUTTON BASE ── */
.db-mbtn{
  position:relative; display:flex; align-items:center; gap:7px;
  padding:9px 18px; border-radius:10px; border:none; cursor:pointer;
  font-family:'Space Mono',monospace; font-size:11px; font-weight:700;
  letter-spacing:.07em; user-select:none; overflow:hidden;
  transition:transform .1s,box-shadow .12s;
  white-space:nowrap;
}
.db-mbtn:active{transform:translateY(1px) scale(.98)}
.db-mbtn-pip{width:7px;height:7px;border-radius:50%;flex-shrink:0;transition:background .2s,box-shadow .2s}

/* light chrome */
.db-mbtn.chrome{
  background:
    radial-gradient(circle at 50% 24%,rgba(255,255,255,.9),rgba(255,255,255,0) 50%),
    conic-gradient(from 0deg,#c5c9ce,#f0f2f4,#b8bcc2,#e8eaed,#bec2c8,#f2f4f6,#bcbfc5,#e6e9ec,#c5c9ce);
  color:#22262c;
  box-shadow:
    0 2px 1px rgba(255,255,255,.88) inset,
    0 -4px 9px rgba(0,0,0,.22) inset,
    0 0 0 1px #96999f,
    0 10px 18px -9px rgba(0,0,0,.55),
    0 3px 7px -3px rgba(0,0,0,.22);
}
.db-mbtn.chrome .db-mbtn-pip{background:#aaaaaa;box-shadow:0 0 0 1px #888 inset}
.db-mbtn.chrome.lit .db-mbtn-pip{background:var(--led-on);box-shadow:0 0 0 1px #c43d10 inset,0 0 7px 1px rgba(255,90,38,.9)}
.db-mbtn.chrome:hover{box-shadow:0 2px 1px rgba(255,255,255,.88) inset,0 -4px 9px rgba(0,0,0,.22) inset,0 0 0 1px #adb0b6,0 12px 20px -9px rgba(0,0,0,.45),0 0 16px rgba(180,200,255,.1)}

/* dark slate */
.db-mbtn.slate{
  background:
    radial-gradient(circle at 50% 28%,rgba(255,255,255,.13),rgba(255,255,255,0) 48%),
    conic-gradient(from 0deg,#1c2031,#383d52,#161927,#333848,#121520,#35394e,#191c2c,#34384c,#1c2031);
  color:var(--ink-bright);
  box-shadow:
    0 2px 2px rgba(255,255,255,.08) inset,
    0 -6px 11px rgba(0,0,0,.58) inset,
    0 0 0 1px #09091328,
    0 0 0 1px rgba(255,255,255,.03),
    0 13px 22px -10px rgba(0,0,0,.72),
    0 3px 7px -3px rgba(0,0,0,.4);
}
.db-mbtn.slate .db-mbtn-pip{background:#1e2435;box-shadow:0 0 0 1px #0d1020 inset}
.db-mbtn.slate.lit .db-mbtn-pip{background:var(--led-on);box-shadow:0 0 0 1px #c43d10 inset,0 0 9px 1px rgba(255,90,38,.9)}
.db-mbtn.slate:hover{box-shadow:0 2px 2px rgba(255,255,255,.08) inset,0 -6px 11px rgba(0,0,0,.58) inset,0 0 0 1px #1c2238,0 13px 22px -10px rgba(0,0,0,.6),0 0 22px rgba(90,130,255,.13)}

/* big generate right */
.db-mbtn.big-gen{
  padding:10px 26px; border-radius:12px; font-size:12px;
  background:
    radial-gradient(circle at 50% 26%,rgba(255,255,255,.13),rgba(255,255,255,0) 46%),
    conic-gradient(from 0deg,#1c2040,#383d58,#181c36,#333852,#141830,#363c54,#1a1e38,#333a50,#1c2040);
  box-shadow:
    0 2px 2px rgba(255,255,255,.09) inset,
    0 -7px 14px rgba(0,0,0,.6) inset,
    0 0 0 1px #080a14,
    0 0 0 2px rgba(255,255,255,.04),
    0 18px 32px -12px rgba(0,0,0,.75);
}
.db-mbtn.big-gen.lit{box-shadow:0 2px 2px rgba(255,255,255,.09) inset,0 -7px 14px rgba(0,0,0,.6) inset,0 0 0 1px #0e1020,0 0 0 3px rgba(100,140,255,.3),0 18px 32px -12px rgba(0,0,0,.6),0 0 36px rgba(80,120,255,.18)}
.db-mbtn::after{
  content:""; position:absolute; top:0; left:-80%; width:55%; height:100%;
  background:linear-gradient(100deg,transparent 0%,rgba(255,255,255,.06) 50%,transparent 100%);
  animation:shimmer 4s ease-in-out infinite; pointer-events:none;
}
@keyframes shimmer{0%{left:-80%}100%{left:120%}}

/* ── LAYOUT ── */
.db-layout{display:grid;grid-template-columns:56px 1fr 56px;gap:12px;align-items:start}
.db-col-btns{display:flex;flex-direction:column;gap:10px;align-items:center;padding-top:8px}

/* ── SIDE ICON BUTTONS ── */
.db-side-btn{
  width:42px; height:42px; border-radius:10px; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center; font-size:16px;
  background:linear-gradient(180deg,var(--panel-1),var(--panel-2));
  box-shadow:0 1px 0 rgba(255,255,255,.04) inset,0 0 0 1px var(--panel-line),0 4px 10px -4px rgba(0,0,0,.5);
  transition:all .15s; color:var(--ink-dim);
}
.db-side-btn:hover{color:var(--ink-mid);box-shadow:0 1px 0 rgba(255,255,255,.04) inset,0 0 0 1px #2e3650,0 4px 10px -4px rgba(0,0,0,.5),0 0 12px rgba(80,120,255,.1)}

/* ── CENTER COLUMN ── */
.db-center-col{display:flex;flex-direction:column;gap:12px}

/* ── SCREEN ── */
.db-screen{
  position:relative; border-radius:16px; overflow:hidden;
  background:radial-gradient(150% 140% at 50% -10%,var(--screen-1),var(--screen-2) 75%);
  box-shadow:0 0 0 1px #000,0 0 0 2px #090b12,0 18px 36px -18px rgba(0,0,0,.85),0 2px 0 rgba(255,255,255,.04) inset;
  padding:22px 22px 20px;
  display:flex; flex-direction:column; gap:14px; min-height:180px;
}
.db-screen::before{
  content:""; position:absolute; inset:0; pointer-events:none; z-index:0;
  background:repeating-linear-gradient(180deg,transparent 0,transparent 3px,rgba(0,0,0,.06) 3px,rgba(0,0,0,.06) 4px);
}
.db-screen::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 20%)}
.db-screen-hdr{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2}
.db-screen-logo{display:flex;gap:3px;align-items:flex-end;height:20px}
.db-screen-logo i{width:3.5px;border-radius:2px;background:rgba(190,210,240,.5);display:block}
.db-screen-logo i:nth-child(1){height:10px}
.db-screen-logo i:nth-child(2){height:16px}
.db-screen-logo i:nth-child(3){height:10px}
.db-screen-name{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.18em;color:rgba(110,140,195,.55)}
.db-screen-status{font-family:'Space Mono',monospace;font-size:9px;color:rgba(90,130,185,.4);letter-spacing:.1em}

/* main nav tabs */
.db-nav{display:flex;gap:8px;position:relative;z-index:2;flex-wrap:wrap}
.db-nav-btn{
  display:flex; align-items:center; gap:6px;
  padding:7px 14px; border-radius:9px; border:none; cursor:pointer;
  font-family:'Space Mono',monospace; font-size:10px; font-weight:700;
  letter-spacing:.07em; transition:all .18s;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.05);
  color:var(--ink-mid);
}
.db-nav-btn:hover{background:rgba(255,255,255,.07);color:var(--ink-bright);border-color:rgba(255,255,255,.09)}
.db-nav-btn.active{
  background:rgba(59,111,255,.15); border-color:rgba(59,111,255,.4);
  color:#a0c0ff;
  box-shadow:0 0 16px rgba(59,111,255,.18);
}
.db-nav-btn .nav-dot{width:6px;height:6px;border-radius:50%;background:var(--ink-dim);flex-shrink:0;transition:background .18s,box-shadow .18s}
.db-nav-btn.active .nav-dot{background:#4080ff;box-shadow:0 0 7px rgba(64,128,255,.9)}
.db-nav-icon{font-size:13px}

/* screen info strip */
.db-screen-strip{
  display:flex; gap:10px; position:relative; z-index:2; flex-wrap:wrap;
}
.db-strip-card{
  flex:1; min-width:80px;
  background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.04);
  border-radius:9px; padding:9px 12px;
}
.db-strip-val{font-family:'Space Mono',monospace;font-size:17px;font-weight:700;color:var(--ink-bright);letter-spacing:-.02em}
.db-strip-lbl{font-size:10px;color:var(--ink-mid);margin-top:2px}
.db-strip-bar{height:2px;border-radius:1px;background:rgba(255,255,255,.05);margin-top:6px;overflow:hidden}
.db-strip-fill{height:100%;border-radius:1px;background:linear-gradient(90deg,var(--accent),var(--accent-2));box-shadow:0 0 5px rgba(100,140,255,.5)}

/* ── SUB PANEL ── */
.db-sub{
  background:linear-gradient(180deg,var(--panel-1),var(--panel-2));
  border-radius:16px;
  box-shadow:0 1px 0 rgba(255,255,255,.04) inset,0 0 0 1px var(--panel-line),0 12px 26px -18px rgba(0,0,0,.6);
  overflow:hidden;
}
.db-sub-inner{padding:18px 18px 20px;display:flex;flex-direction:column;gap:14px}

/* sub tab bar */
.db-sub-tabs{display:flex;gap:6px;flex-wrap:wrap}
.db-sub-tab{
  padding:6px 14px; border-radius:8px; border:none; cursor:pointer;
  font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:.06em;
  transition:all .16s;
  background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); color:var(--ink-dim);
}
.db-sub-tab:hover{color:var(--ink-mid);border-color:rgba(255,255,255,.08)}
.db-sub-tab.active{background:rgba(59,111,255,.16);border-color:rgba(59,111,255,.4);color:#8ab0ff}

/* grid chips */
.db-chip-grid{display:flex;flex-wrap:wrap;gap:8px}
.db-chip{
  padding:6px 14px; border-radius:20px; border:none; cursor:pointer;
  font-size:12px; transition:all .16s;
  background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07);
  color:var(--ink-mid); display:flex; align-items:center; gap:6px;
}
.db-chip:hover{border-color:rgba(255,255,255,.14);color:var(--ink-bright)}
.db-chip.sel{background:rgba(59,111,255,.18);border-color:rgba(59,111,255,.5);color:#a0c4ff}
.db-chip-badge{
  font-family:'Space Mono',monospace; font-size:9px;
  background:rgba(255,255,255,.07); border-radius:10px; padding:1px 6px;
}
.db-chip.sel .db-chip-badge{background:rgba(59,111,255,.3)}

/* product table */
.db-prod-table{display:flex;flex-direction:column;gap:6px}
.db-prod-row{
  display:flex; align-items:center; justify-content:space-between;
  padding:8px 12px; border-radius:9px; cursor:pointer; transition:all .15s;
  background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.04);
}
.db-prod-row:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.09)}
.db-prod-row.sel{background:rgba(59,111,255,.14);border-color:rgba(59,111,255,.4)}
.db-prod-name{font-size:12px;color:var(--ink-bright)}
.db-prod-price{font-family:'Space Mono',monospace;font-size:11px;color:var(--ink-mid)}

/* competitor sub-tabs */
.db-comp-tabs{display:flex;gap:7px;flex-wrap:wrap}
.db-comp-tab{
  padding:7px 15px; border-radius:9px; border:none; cursor:pointer;
  font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:.06em;
  transition:all .16s;
  background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); color:var(--ink-dim);
  display:flex; align-items:center; gap:6px;
}
.db-comp-tab:hover{color:var(--ink-mid);border-color:rgba(255,255,255,.09)}
.db-comp-tab.active{background:rgba(139,92,246,.16);border-color:rgba(139,92,246,.45);color:#c4a0ff}
.db-comp-tab .comp-dot{width:5px;height:5px;border-radius:50%;background:var(--ink-dim);flex-shrink:0;transition:all .16s}
.db-comp-tab.active .comp-dot{background:#a070ff;box-shadow:0 0 6px rgba(160,112,255,.9)}

/* competitor info card */
.db-comp-info{
  display:grid; grid-template-columns:1fr 1fr; gap:12px;
}
.db-comp-stat{
  background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.04);
  border-radius:10px; padding:10px 14px;
}
.db-comp-stat-val{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--ink-bright);letter-spacing:-.02em}
.db-comp-stat-lbl{font-size:10px;color:var(--ink-mid);margin-top:2px;letter-spacing:.04em}
.db-comp-domain{font-family:'Space Mono',monospace;font-size:10px;color:rgba(100,140,200,.55);margin-bottom:2px}
.db-comp-name{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.05em;color:var(--ink-bright)}
.db-comp-section-lbl{font-size:10px;color:var(--ink-dim);letter-spacing:.12em;font-family:'Space Mono',monospace;margin-bottom:6px}
.db-weakness{
  font-size:11px; color:rgba(255,140,100,.75);
  background:rgba(255,90,38,.07); border:1px solid rgba(255,90,38,.12);
  border-radius:6px; padding:4px 10px; display:inline-block; margin:2px;
}
.db-top-page{
  font-size:11px; color:rgba(100,180,255,.75);
  background:rgba(59,111,255,.07); border:1px solid rgba(59,111,255,.12);
  border-radius:6px; padding:4px 10px; display:inline-block; margin:2px;
  font-family:'Space Mono',monospace;
}

/* calendar */
.db-cal{display:flex;flex-direction:column;gap:12px}
.db-cal-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.db-cal-label{font-size:11px;color:var(--ink-mid);min-width:90px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.08em}
.db-select{
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
  border-radius:8px; padding:7px 12px; color:var(--ink-bright); font-size:12px;
  cursor:pointer; font-family:'Hanken Grotesk',sans-serif; outline:none;
  transition:border-color .15s;
}
.db-select:focus{border-color:rgba(59,111,255,.5)}
.db-select option{background:#1e2433;color:var(--ink-bright)}
.db-festival-grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.db-festival-chip{
  padding:5px 12px; border-radius:16px; font-size:11px; cursor:pointer;
  border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.04);
  color:var(--ink-mid); transition:all .15s;
}
.db-festival-chip:hover{border-color:rgba(255,255,255,.14);color:var(--ink-bright)}
.db-festival-chip.sel{background:rgba(139,92,246,.18);border-color:rgba(139,92,246,.45);color:#c4a0ff}
.db-cal-auto{
  padding:8px 14px; border-radius:9px; border:1px solid rgba(59,111,255,.25);
  background:rgba(59,111,255,.08); color:#80aaff;
  font-size:11px; display:flex; align-items:center; gap:8px; cursor:pointer;
  font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.05em;
  transition:all .16s;
}
.db-cal-auto:hover{background:rgba(59,111,255,.14);border-color:rgba(59,111,255,.4)}
.db-cal-auto input[type=checkbox]{accent-color:#4080ff;cursor:pointer}
.db-cal-schedule{
  display:flex; align-items:center; gap:10px; flex-wrap:wrap;
}
.db-cal-input{
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
  border-radius:8px; padding:6px 12px; color:var(--ink-bright); font-size:12px;
  outline:none; font-family:'Space Mono',monospace; width:160px; transition:border-color .15s;
}
.db-cal-input:focus{border-color:rgba(59,111,255,.4)}

/* keywords */
.db-kw-table{display:flex;flex-direction:column;gap:5px}
.db-kw-row{
  display:grid; grid-template-columns:1fr 70px 60px 90px;
  gap:10px; align-items:center;
  padding:8px 12px; border-radius:8px;
  background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.04);
  cursor:pointer; transition:all .15s;
}
.db-kw-row:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.08)}
.db-kw-row.sel{background:rgba(59,111,255,.12);border-color:rgba(59,111,255,.35)}
.db-kw-hdr{
  display:grid; grid-template-columns:1fr 70px 60px 90px;
  gap:10px; padding:4px 12px;
}
.db-kw-hdr-cell{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.1em;color:var(--ink-dim)}
.db-kw-text{font-size:12px;color:var(--ink-bright)}
.db-kw-vol{font-family:'Space Mono',monospace;font-size:11px;color:var(--ink-mid)}
.db-kw-diff{font-family:'Space Mono',monospace;font-size:11px}
.db-kw-intent{
  font-size:9px; padding:2px 8px; border-radius:10px; font-family:'Space Mono',monospace;
  letter-spacing:.04em; display:inline-block;
}
.intent-Commercial{background:rgba(59,111,255,.15);color:#80aaff;border:1px solid rgba(59,111,255,.25)}
.intent-Transactional{background:rgba(80,200,100,.12);color:#80e090;border:1px solid rgba(80,200,100,.22)}
.intent-Informational{background:rgba(250,180,50,.1);color:#e8c060;border:1px solid rgba(250,180,50,.18)}

/* search console */
.db-sc-tabs{display:flex;gap:6px}
.db-sc-tab{
  padding:6px 14px; border-radius:8px; border:none; cursor:pointer;
  font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:.06em;
  transition:all .16s; background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.05); color:var(--ink-dim);
}
.db-sc-tab.active{background:rgba(59,111,255,.16);border-color:rgba(59,111,255,.4);color:#8ab0ff}
.db-sc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.db-sc-card{
  background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.04);
  border-radius:10px; padding:12px 14px;
}
.db-sc-val{font-family:'Space Mono',monospace;font-size:20px;font-weight:700;color:var(--ink-bright);letter-spacing:-.02em}
.db-sc-lbl{font-size:10px;color:var(--ink-mid);margin-top:3px;letter-spacing:.04em}
.db-sc-change{font-size:10px;margin-top:4px}
.db-sc-up{color:#60d480}.db-sc-down{color:#ff6060}
.db-sc-bar{height:2px;border-radius:1px;background:rgba(255,255,255,.05);margin-top:8px;overflow:hidden}
.db-sc-fill{height:100%;border-radius:1px;background:linear-gradient(90deg,var(--accent),var(--accent-2))}

.db-sc-table{display:flex;flex-direction:column;gap:5px}
.db-sc-row{
  display:grid; grid-template-columns:1fr 80px 60px 70px;
  gap:8px; align-items:center;
  padding:7px 12px; border-radius:8px;
  background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.04);
}
.db-sc-row-lbl{font-size:11px;color:var(--ink-bright)}
.db-sc-row-val{font-family:'Space Mono',monospace;font-size:11px;color:var(--ink-mid);text-align:right}

/* modal overlay */
.db-modal-overlay{
  position:fixed; inset:0; z-index:100;
  background:rgba(5,7,14,.82); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:20px;
}
.db-modal{
  background:linear-gradient(175deg,var(--chassis-1),var(--chassis-2));
  border-radius:20px; padding:28px;
  box-shadow:0 0 0 1px var(--chassis-edge),0 40px 80px -24px rgba(0,0,0,.9);
  max-width:560px; width:100%; max-height:80vh; overflow-y:auto;
  position:relative;
}
.db-modal-title{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.06em;color:var(--ink-bright);margin-bottom:6px}
.db-modal-sub{font-size:12px;color:var(--ink-mid);margin-bottom:18px}
.db-modal-close{
  position:absolute; top:18px; right:18px;
  width:28px; height:28px; border-radius:8px; border:none; cursor:pointer;
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
  color:var(--ink-mid); font-size:14px; display:flex; align-items:center; justify-content:center;
  transition:all .15s;
}
.db-modal-close:hover{background:rgba(255,255,255,.1);color:var(--ink-bright)}
.db-modal-section{margin-bottom:16px}
.db-modal-section-title{font-size:10px;color:var(--ink-dim);letter-spacing:.14em;font-family:'Space Mono',monospace;margin-bottom:8px}
.db-topic-chip{
  padding:7px 14px; border-radius:20px; border:1px solid rgba(255,255,255,.07);
  background:rgba(255,255,255,.04); color:var(--ink-mid); font-size:12px;
  cursor:pointer; transition:all .15s; display:inline-block; margin:3px;
}
.db-topic-chip:hover{border-color:rgba(255,255,255,.15);color:var(--ink-bright)}
.db-topic-chip.sel{background:rgba(59,111,255,.18);border-color:rgba(59,111,255,.5);color:#a0c4ff}

/* big gen btn */
.db-big-gen{
  width:100%; padding:18px 28px; border-radius:14px; border:none; cursor:pointer;
  font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:.12em; color:#fff;
  position:relative; overflow:hidden;
  background:
    radial-gradient(circle at 50% 26%,rgba(255,255,255,.13),rgba(255,255,255,0) 46%),
    conic-gradient(from 0deg,#1c2040,#383d58,#181c36,#343a52,#141830,#363c54,#1a1e38,#343a50,#1c2040);
  box-shadow:
    0 2px 2px rgba(255,255,255,.09) inset,
    0 -7px 14px rgba(0,0,0,.6) inset,
    0 0 0 1px #080a14,
    0 0 0 2px rgba(255,255,255,.04),
    0 18px 30px -12px rgba(0,0,0,.8);
  display:flex; align-items:center; justify-content:center; gap:12px;
  transition:transform .1s, box-shadow .16s;
}
.db-big-gen:hover{box-shadow:0 2px 2px rgba(255,255,255,.09) inset,0 -7px 14px rgba(0,0,0,.6) inset,0 0 0 1px #0e1022,0 0 0 3px rgba(100,140,255,.28),0 18px 30px -12px rgba(0,0,0,.65),0 0 38px rgba(80,120,255,.18)}
.db-big-gen:active{transform:translateY(2px) scale(.99)}
.db-big-gen::after{content:"";position:absolute;top:0;left:-80%;width:55%;height:100%;background:linear-gradient(100deg,transparent 0%,rgba(255,255,255,.06) 50%,transparent 100%);animation:shimmer 4s ease-in-out infinite;pointer-events:none}
.db-big-gen-led{width:12px;height:12px;border-radius:50%;background:var(--led-off);box-shadow:0 0 0 1px #060810 inset;transition:all .3s;flex-shrink:0}
.db-big-gen.active .db-big-gen-led{background:var(--led-on);box-shadow:0 0 0 1px #c43d10 inset,0 0 11px 3px rgba(255,90,38,.9)}
.db-gen-arrow{font-size:20px;color:rgba(200,215,255,.65);transition:transform .2s}
.db-big-gen:hover .db-gen-arrow{transform:translateX(5px)}

/* section empty state */
.db-empty{
  text-align:center; padding:32px 20px;
  color:var(--ink-dim); font-size:12px; font-family:'Space Mono',monospace;
  letter-spacing:.08em;
}

@media(max-width:720px){
  .db-layout{grid-template-columns:1fr}
  .db-col-btns{flex-direction:row;flex-wrap:wrap}
  .db-sc-grid{grid-template-columns:1fr 1fr}
  .db-comp-info{grid-template-columns:1fr}
}
`;

/* ═══════════════════════════════════════════════════════════
   METALLIC BUTTON
═══════════════════════════════════════════════════════════ */
function MBtn({
  label, variant = "slate", lit, onClick, icon, size,
}: {
  label: string; variant?: "chrome" | "slate" | "big-gen";
  lit?: boolean; onClick?: () => void; icon?: string; size?: "big";
}) {
  return (
    <button
      type="button"
      className={`db-mbtn ${variant}${lit ? " lit" : ""}${size === "big" ? " big" : ""}`}
      onClick={onClick}
    >
      <div className="db-mbtn-pip" />
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   KNOB
═══════════════════════════════════════════════════════════ */
function Knob({ size = "md", label, defaultVal = 0 }: { size?: "sm" | "md"; label: string; defaultVal?: number }) {
  const knobRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, startVal: 0 });
  const [val, setVal] = useState(defaultVal);

  useEffect(() => {
    const k = knobRef.current, ring = ringRef.current;
    if (!k || !ring) return;
    ring.innerHTML = "";
    const N = size === "sm" ? 18 : 24;
    const r = k.offsetWidth / 2 + 8;
    for (let i = 0; i < N; i++) {
      const a = ((-150 + (300 / (N - 1)) * i) * Math.PI) / 180;
      const d = document.createElement("i");
      d.style.cssText = `position:absolute;left:50%;top:50%;width:3px;height:3px;margin:-1.5px;border-radius:50%;background:#2a3044;transform-origin:center;transform:translate(${Math.sin(a) * r}px,${-Math.cos(a) * r}px)`;
      ring.appendChild(d);
    }
  }, [size]);

  useEffect(() => {
    const move = (y: number) => {
      if (!drag.current.active) return;
      const next = Math.max(-150, Math.min(150, drag.current.startVal + (drag.current.startY - y) * 1.4));
      setVal(next);
    };
    const mm = (e: MouseEvent) => move(e.clientY);
    const tm = (e: TouchEvent) => drag.current.active && move(e.touches[0].clientY);
    const up = () => { drag.current.active = false; document.body.style.cursor = ""; };
    window.addEventListener("mousemove", mm); window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", tm, { passive: true }); window.addEventListener("touchend", up);
    return () => { window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", up); window.removeEventListener("touchmove", tm); window.removeEventListener("touchend", up); };
  }, []);

  const knobSz = size === "sm" ? 62 : 82;
  const ptrH = size === "sm" ? 12 : 16;
  const ptrTop = size === "sm" ? 8 : 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div
        ref={knobRef}
        style={{
          width: knobSz, height: knobSz, borderRadius: "50%", position: "relative", cursor: "grab",
          background: "radial-gradient(circle at 50% 30%,rgba(255,255,255,.13),rgba(255,255,255,0) 46%),conic-gradient(from 0deg,#1e2030,#3a3e52,#181a28,#363a4e,#141620,#383c50,#1a1c2e,#363a4c,#1e2030),radial-gradient(circle at 50% 50%,#2c3044 0%,#141826 52%,#060810 100%)",
          boxShadow: "0 2px 2px rgba(255,255,255,.1) inset,0 -7px 13px rgba(0,0,0,.7) inset,0 0 0 1px #050608,0 14px 22px -11px rgba(0,0,0,.6),0 4px 9px -4px rgba(0,0,0,.4)",
          touchAction: "none",
        }}
        onMouseDown={(e) => { e.preventDefault(); drag.current = { active: true, startY: e.clientY, startVal: val }; document.body.style.cursor = "grabbing"; }}
        onTouchStart={(e) => { drag.current = { active: true, startY: e.touches[0].clientY, startVal: val }; }}
      >
        <div ref={ringRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", zIndex: 3, transform: `rotate(${val}deg)` }}>
          <div style={{ position: "absolute", left: "50%", top: ptrTop, width: size === "sm" ? 3 : 3.5, height: ptrH, transform: "translateX(-50%)", background: "rgba(180,200,240,.85)", borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-mid)", fontFamily: "'Space Mono',monospace", letterSpacing: ".06em" }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   METER
═══════════════════════════════════════════════════════════ */
function Meter({ label }: { label: string }) {
  const [lit, setLit] = useState(() => Array(27).fill(false));
  useEffect(() => {
    const tick = () => { const h = ((Math.random() * 6) | 0) + 2; setLit(Array.from({ length: 27 }, (_, i) => Math.floor(i / 3) >= 9 - h)); };
    tick(); const id = setInterval(tick, 400); return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,4px)", gap: 4 }}>
        {lit.map((on, i) => (
          <span key={i} style={{ width: 4, height: 4, borderRadius: 1, background: on ? "rgba(100,160,255,.75)" : "#1a1e2c", boxShadow: on ? "0 0 4px rgba(80,140,255,.6)" : "none", transition: "background .25s" }} />
        ))}
      </div>
      <div style={{ fontSize: 10, color: "var(--ink-dim)", fontFamily: "'Space Mono',monospace", letterSpacing: ".06em" }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREVIEW MODAL
═══════════════════════════════════════════════════════════ */
const TOPIC_SUGGESTIONS = [
  "10 Best Wireless Headphones 2024", "Smart Watch Buying Guide", "Top Laptop Bags for Professionals",
  "Bluetooth Speaker Comparison", "Best Tech Gifts This Season", "Camera Accessories You Need",
  "How to Choose the Right Earbuds", "Fitness Wearables Explained", "USB-C Hub Roundup",
  "Budget vs Premium Headphones",
];

function PreviewModal({ onClose, onGenerate }: { onClose: () => void; onGenerate: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (t: string) => setSelected(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  return (
    <div className="db-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="db-modal">
        <button className="db-modal-close" onClick={onClose}>✕</button>
        <div className="db-modal-title">Topic Preview</div>
        <div className="db-modal-sub">Select topics to include in your generated content</div>
        <div className="db-modal-section">
          <div className="db-modal-section-title">SUGGESTED TOPICS</div>
          <div>{TOPIC_SUGGESTIONS.map(t => (
            <button key={t} className={`db-topic-chip${selected.includes(t) ? " sel" : ""}`} onClick={() => toggle(t)}>{t}</button>
          ))}</div>
        </div>
        <div className="db-modal-section">
          <div className="db-modal-section-title">CUSTOM TOPIC</div>
          <input style={{ width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 12px", color: "var(--ink-bright)", fontSize: 13, outline: "none", fontFamily: "inherit" }} placeholder="Enter your own topic..." />
        </div>
        <MBtn label={`CONFIRM${selected.length > 0 ? ` (${selected.length})` : ""}`} variant="slate" lit onClick={() => { onGenerate(); onClose(); }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   KEYWORDS MODAL
═══════════════════════════════════════════════════════════ */
function KeywordsModal({ onClose }: { onClose: () => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (k: string) => setSel(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);
  return (
    <div className="db-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="db-modal" style={{ maxWidth: 680 }}>
        <button className="db-modal-close" onClick={onClose}>✕</button>
        <div className="db-modal-title">Keyword Library</div>
        <div className="db-modal-sub">Select keywords to target in your generated content</div>
        <div className="db-kw-hdr">
          {["KEYWORD", "VOLUME", "DIFF", "INTENT"].map(h => <div key={h} className="db-kw-hdr-cell">{h}</div>)}
        </div>
        <div className="db-kw-table">
          {KEYWORDS_DATA.map(k => (
            <div key={k.kw} className={`db-kw-row${sel.includes(k.kw) ? " sel" : ""}`} onClick={() => toggle(k.kw)}>
              <div className="db-kw-text">{k.kw}</div>
              <div className="db-kw-vol">{k.vol}</div>
              <div className="db-kw-diff" style={{ color: k.diff < 35 ? "#60d480" : k.diff < 50 ? "#e8c060" : "#ff8060" }}>{k.diff}</div>
              <div><span className={`db-kw-intent intent-${k.intent}`}>{k.intent}</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <MBtn label={`USE SELECTED (${sel.length})`} variant="slate" lit={sel.length > 0} onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB PANELS
═══════════════════════════════════════════════════════════ */
function StorePanel() {
  const [tab, setTab] = useState<"collections" | "products">("collections");
  const [selCol, setSelCol] = useState<string[]>([]);
  const [selProd, setSelProd] = useState<string[]>([]);
  const [focusCol, setFocusCol] = useState<string>("c1");

  const toggleCol = (id: string) => {
    setSelCol(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    setFocusCol(id);
  };
  const toggleProd = (id: string) => setSelProd(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="db-sub">
      <div className="db-sub-inner">
        <div className="db-sub-tabs">
          {(["collections", "products"] as const).map(t => (
            <button key={t} className={`db-sub-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t === "collections" ? "📁 COLLECTIONS" : "📦 PRODUCTS"}
            </button>
          ))}
        </div>
        {tab === "collections" && (
          <div className="db-chip-grid">
            {COLLECTIONS.map(c => (
              <button key={c.id} className={`db-chip${selCol.includes(c.id) ? " sel" : ""}`} onClick={() => toggleCol(c.id)}>
                {c.name} <span className="db-chip-badge">{c.count}</span>
              </button>
            ))}
          </div>
        )}
        {tab === "products" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {COLLECTIONS.map(c => (
                <button key={c.id} className={`db-chip${focusCol === c.id ? " sel" : ""}`} style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setFocusCol(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="db-prod-table">
              {(PRODUCTS[focusCol] || []).map(p => (
                <div key={p.id} className={`db-prod-row${selProd.includes(p.id) ? " sel" : ""}`} onClick={() => toggleProd(p.id)}>
                  <div className="db-prod-name">{p.name}</div>
                  <div className="db-prod-price">{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompetitorPanel() {
  const [active, setActive] = useState<CompetitorId>("comp1");
  const comp = COMPETITORS[active];
  return (
    <div className="db-sub">
      <div className="db-sub-inner">
        <div className="db-comp-tabs">
          {(Object.keys(COMPETITORS) as CompetitorId[]).map((id, i) => (
            <button key={id} className={`db-comp-tab${active === id ? " active" : ""}`} onClick={() => setActive(id)}>
              <span className="comp-dot" />
              COMP {i + 1}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div className="db-comp-domain">{comp.domain}</div>
            <div className="db-comp-name">{comp.name}</div>
          </div>
          <div className="db-comp-info">
            {[
              { val: comp.da,       lbl: "Domain Authority" },
              { val: comp.traffic,  lbl: "Monthly Traffic" },
              { val: comp.keywords, lbl: "Ranking Keywords" },
            ].map(s => (
              <div key={s.lbl} className="db-comp-stat">
                <div className="db-comp-stat-val">{s.val}</div>
                <div className="db-comp-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="db-comp-section-lbl">TOP PAGES</div>
            <div>{comp.topPages.map(p => <span key={p} className="db-top-page">{p}</span>)}</div>
          </div>
          <div>
            <div className="db-comp-section-lbl">WEAKNESSES TO EXPLOIT</div>
            <div>{comp.weaknesses.map(w => <span key={w} className="db-weakness">{w}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarPanel() {
  const [country, setCountry] = useState("United States");
  const [selFestivals, setSelFestivals] = useState<string[]>([]);
  const [autoAI, setAutoAI] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const festivals = FESTIVALS[country] || [];
  const toggleFest = (f: string) => setSelFestivals(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);

  return (
    <div className="db-sub">
      <div className="db-sub-inner">
        <div className="db-cal">
          <div className="db-cal-row">
            <span className="db-cal-label">COUNTRY</span>
            <select className="db-select" value={country} onChange={e => { setCountry(e.target.value); setSelFestivals([]); }}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-dim)", fontFamily: "'Space Mono',monospace", letterSpacing: ".1em", marginBottom: 8 }}>FESTIVALS & EVENTS</div>
            <div className="db-festival-grid">
              {festivals.map(f => (
                <button key={f} className={`db-festival-chip${selFestivals.includes(f) ? " sel" : ""}`} onClick={() => !autoAI && toggleFest(f)} style={{ opacity: autoAI ? 0.4 : 1 }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <label className="db-cal-auto">
            <input type="checkbox" checked={autoAI} onChange={e => { setAutoAI(e.target.checked); if (e.target.checked) setSelFestivals([]); }} />
            Let AI pick festivals automatically
          </label>
          <div>
            <div style={{ fontSize: 10, color: "var(--ink-dim)", fontFamily: "'Space Mono',monospace", letterSpacing: ".1em", marginBottom: 8 }}>SCHEDULE FOR FUTURE</div>
            <div className="db-cal-schedule">
              <input type="date" className="db-cal-input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              <input type="time" className="db-cal-input" style={{ width: 120 }} defaultValue="09:00" />
              <div style={{ fontSize: 11, color: "var(--ink-dim)" }}>
                {selFestivals.length > 0 ? `${selFestivals.length} events selected` : autoAI ? "AI will schedule" : "No events selected"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchConsolePanel() {
  const [tab, setTab] = useState<SCTab>("overview");
  const OVERVIEW = [
    { val: "48.2k", lbl: "Total Clicks", fill: 72, change: "+12.4%", up: true },
    { val: "1.24M", lbl: "Impressions",  fill: 88, change: "+8.1%",  up: true },
    { val: "3.9%",  lbl: "Avg CTR",      fill: 39, change: "-0.3%",  up: false },
    { val: "#14.2", lbl: "Avg Position", fill: 55, change: "+2.1",   up: true },
  ];
  const QUERIES = [
    { q: "wireless headphones review",  clicks: "3.2k", imp: "82k",  pos: "8.4" },
    { q: "best smart watch under 300",  clicks: "1.8k", imp: "44k",  pos: "11.2" },
    { q: "portable bluetooth speaker",  clicks: "2.4k", imp: "61k",  pos: "6.1" },
    { q: "buy laptop bag online",       clicks: "990",  imp: "28k",  pos: "14.5" },
    { q: "tech gifts 2024",             clicks: "4.1k", imp: "110k", pos: "4.8" },
  ];
  const PAGES = [
    { page: "/best-wireless-headphones", clicks: "4.1k", imp: "98k",  pos: "5.2" },
    { page: "/smart-watch-guide",        clicks: "2.2k", imp: "54k",  pos: "9.1" },
    { page: "/bluetooth-speaker-review", clicks: "3.0k", imp: "74k",  pos: "6.8" },
    { page: "/tech-deals",               clicks: "1.5k", imp: "40k",  pos: "12.4" },
  ];
  return (
    <div className="db-sub">
      <div className="db-sub-inner">
        <div className="db-sc-tabs">
          {SEARCH_CONSOLE_TABS.map(t => (
            <button key={t} className={`db-sc-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        {tab === "overview" && (
          <div className="db-sc-grid">
            {OVERVIEW.map(s => (
              <div key={s.lbl} className="db-sc-card">
                <div className="db-sc-val">{s.val}</div>
                <div className="db-sc-lbl">{s.lbl}</div>
                <div className={`db-sc-change ${s.up ? "db-sc-up" : "db-sc-down"}`}>{s.change}</div>
                <div className="db-sc-bar"><div className="db-sc-fill" style={{ width: `${s.fill}%` }} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === "queries" && (
          <div className="db-sc-table">
            <div className="db-sc-row" style={{ background: "none", border: "none" }}>
              {["QUERY", "CLICKS", "IMP", "POS"].map(h => <div key={h} className="db-kw-hdr-cell">{h}</div>)}
            </div>
            {QUERIES.map(q => (
              <div key={q.q} className="db-sc-row">
                <div className="db-sc-row-lbl">{q.q}</div>
                <div className="db-sc-row-val">{q.clicks}</div>
                <div className="db-sc-row-val">{q.imp}</div>
                <div className="db-sc-row-val">{q.pos}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "pages" && (
          <div className="db-sc-table">
            <div className="db-sc-row" style={{ background: "none", border: "none" }}>
              {["PAGE", "CLICKS", "IMP", "POS"].map(h => <div key={h} className="db-kw-hdr-cell">{h}</div>)}
            </div>
            {PAGES.map(p => (
              <div key={p.page} className="db-sc-row">
                <div className="db-sc-row-lbl" style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(100,160,255,.7)" }}>{p.page}</div>
                <div className="db-sc-row-val">{p.clicks}</div>
                <div className="db-sc-row-val">{p.imp}</div>
                <div className="db-sc-row-val">{p.pos}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "devices" && (
          <div style={{ display: "flex", gap: 10 }}>
            {[{ d: "Mobile", pct: 62, c: "#4080ff" }, { d: "Desktop", pct: 31, c: "#8b5cf6" }, { d: "Tablet", pct: 7, c: "#22c888" }].map(d => (
              <div key={d.d} style={{ flex: 1, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.04)", borderRadius: 10, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Space Mono',monospace", color: d.c }}>{d.pct}%</div>
                <div style={{ fontSize: 11, color: "var(--ink-mid)", marginTop: 4 }}>{d.d}</div>
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,.05)", marginTop: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${d.pct}%`, background: d.c, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAV CONFIG
═══════════════════════════════════════════════════════════ */
const NAV: { id: MainTab; label: string; icon: string }[] = [
  { id: "store",         label: "Store",          icon: "🏪" },
  { id: "competitor",    label: "Competitor",      icon: "⚔" },
  { id: "calendar",      label: "Calendar",        icon: "📅" },
  { id: "keywords",      label: "Keywords",        icon: "🔑" },
  { id: "searchconsole", label: "Search Console",  icon: "📊" },
];

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<MainTab | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (generating) return;
    setGenerating(true); setGenerated(false);
    await new Promise(r => setTimeout(r, 2000));
    setGenerating(false); setGenerated(true);
  }, [generating]);

  const handleNavClick = (id: MainTab) => {
    if (id === "keywords") { setShowKeywords(true); return; }
    setActiveTab(prev => prev === id ? null : id);
  };

  return (
    <div className="db-root">
      <style>{CSS}</style>

      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} onGenerate={handleGenerate} />}
      {showKeywords && <KeywordsModal onClose={() => setShowKeywords(false)} />}

      <div className="db-chassis">

        {/* ── TOP BAR ── */}
        <div className="db-topbar">
          {/* left: logo + 2 metallic action buttons */}
          <div className="db-topbar-left">
            <div className="db-topbar-logo-dot" />
            <span className="db-topbar-title">Content Engine</span>
            <div className="db-top-btns">
              <MBtn label="PREVIEW" variant="chrome" onClick={() => setShowPreview(true)} />
              <MBtn label="GENERATE" variant="slate" lit={generating || generated} onClick={handleGenerate} />
            </div>
          </div>

          {/* right: big generate */}
          <div className="db-topbar-right">
            <button
              type="button"
              className={`db-mbtn big-gen${generating || generated ? " lit" : ""}`}
              onClick={handleGenerate}
              disabled={generating}
            >
              <div className="db-mbtn-pip" />
              {generating ? "GENERATING..." : generated ? "DONE — RUN AGAIN" : "GENERATE"}
              <span style={{ fontSize: 14, color: "rgba(200,215,255,.6)", marginLeft: 4 }}>→</span>
            </button>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="db-layout">

          {/* LEFT KNOBS */}
          <div className="db-col-btns">
            <Meter label="traffic" />
            <Knob size="md" label="volume" defaultVal={-28} />
            <Knob size="sm" label="depth"  defaultVal={50} />
          </div>

          {/* CENTER */}
          <div className="db-center-col">

            {/* SCREEN */}
            <div className="db-screen">
              <div className="db-screen-hdr">
                <div className="db-screen-logo"><i /><i /><i /></div>
                <div className="db-screen-name">ONLY · 1 DASHBOARD</div>
                <div className="db-screen-status">
                  {generating ? "● GENERATING" : generated ? "● READY" : "○ STANDBY"}
                </div>
              </div>

              {/* NAV TABS */}
              <div className="db-nav">
                {NAV.map(n => (
                  <button
                    key={n.id}
                    className={`db-nav-btn${activeTab === n.id ? " active" : ""}`}
                    onClick={() => handleNavClick(n.id)}
                  >
                    <span className="nav-dot" />
                    <span className="db-nav-icon">{n.icon}</span>
                    {n.label}
                  </button>
                ))}
              </div>

              {/* SCREEN STATS */}
              <div className="db-screen-strip">
                {[
                  { val: "2.4k", lbl: "Articles", fill: 66 },
                  { val: "94%",  lbl: "Rank Rate", fill: 94 },
                  { val: "18k",  lbl: "Traffic",   fill: 55 },
                  { val: "#12",  lbl: "Position",  fill: 40 },
                ].map(s => (
                  <div key={s.lbl} className="db-strip-card">
                    <div className="db-strip-val">{s.val}</div>
                    <div className="db-strip-lbl">{s.lbl}</div>
                    <div className="db-strip-bar"><div className="db-strip-fill" style={{ width: `${s.fill}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUB PANEL — rendered below screen when a tab is active */}
            {activeTab === "store"         && <StorePanel />}
            {activeTab === "competitor"    && <CompetitorPanel />}
            {activeTab === "calendar"      && <CalendarPanel />}
            {activeTab === "searchconsole" && <SearchConsolePanel />}

            {/* BIG GENERATE */}
            <button
              type="button"
              className={`db-big-gen${generating || generated ? " active" : ""}`}
              onClick={handleGenerate}
              disabled={generating}
            >
              <div className="db-big-gen-led" />
              <span style={{ position: "relative", zIndex: 1 }}>
                {generating ? "GENERATING CONTENT..." : generated ? "CONTENT READY — RUN AGAIN" : "GENERATE CONTENT"}
              </span>
              <span className="db-gen-arrow">→</span>
            </button>

          </div>

          {/* RIGHT KNOBS */}
          <div className="db-col-btns">
            <Meter label="rank" />
            <Knob size="md" label="tone"  defaultVal={20} />
            <Knob size="sm" label="style" defaultVal={-38} />
          </div>

        </div>

        <div className="db-brand">only·1 · dashboard</div>
      </div>
    </div>
  );
}