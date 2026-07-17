"use client";

import React, { useState, useRef, useEffect, useCallback, FC, MouseEvent } from "react";
// Latest animation library: `npm install motion` (successor of framer-motion)
import { motion, AnimatePresence } from "motion/react";
import ApiService from "../lib/service";
import ApiConfig from "../lib/apiConfig";
import BlogEditorModal from "../../components/BlogEditorModal";
import CollectionModal from "../../components/CollectionModal";
import ProductModal from "../../components/ProductModal";
import CompetitorDetailModal from "../../components/CompetitorDetailModal";
import SeasonalModal from "../../components/SeasonalModal";
import CulturalModal from "../../components/CulturalModal";
import RetailModal from "../../components/RetailModal";
import ExperientialModal from "../../components/ExperientialModal";
import ShortTailKeywordsModal from "../../components/ShortTailKeywordsModal";
import LongTailKeywordsModal from "../../components/LongTailKeywordsModal";

// ============================================================================
// Types
// ============================================================================

interface StoreData {
  _id: string;
  integrationId: string;
  shopDomain: string;
  niche: string;
  businessSummary: string;
  targetAudience: string;
  brandVoice: string;
  language: string;
  primaryMarket: string;
  shortTailKeywords: string[];
  longTailKeywords: string[];
  competitors: Array<{
    name: string;
    website: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  blogTopics: Array<{
    title: string;
    keyword: string;
    intent: string;
    difficulty: string;
    priority: number;
  }>;
  customerPainPoints: string[];
  customerGoals: string[];
  faqIdeas: string[];
  seoSuggestions: string[];
  contentPillars: string[];
  aiRecommendations: string[];
  lastAnalyzedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Topic {
  id: string;
  name: string;
  keyword: string;
  intent: string;
  difficulty: string;
  priority: number;
}
interface FootSwitch {
  label: string;
  on: boolean;
  onClick?: () => void;
}
interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  image: string | null;
  price: string;
  currency: string;
}

type BlogStatus = "none" | "draft" | "sched" | "pub";

interface Blog {
  id: string;
  topic: string;
  title: string;
  html: string;
  status?: BlogStatus;
  heroImageUrl?: string;
  heroImagePrompt?: string;
}

type StarKey = "topics" | "products" | "collection" | null;

interface BlogStatusConfig {
  cls: string;
  label: string;
}

// New: type of knob-triggered info modal (Store / Competitor / Calendar / Keywords)
type KnobModalType = "store" | "competitor" | "calendar" | "keywords" | null;

// Sidebar navigation views
type AppView = "pedal" | "blogs" | "console" | "backlinks";

// Which step of the guided tour is currently showing inside the portal
type TourStep = "topics" | "products" | "blogs" | null;

// A tracked backlink entry
interface Backlink {
  id: string;
  url: string;
  anchor: string;
  target: string;
  addedAt: number;
}

// ============================================================================
// Styles (unchanged except for the product search box)
// ============================================================================

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ebebeb;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    padding: 40px 20px;
  }
  .stage { width: min(1000px, 92vw); }
  .lvx-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; box-sizing: border-box; }

  /* ============ CHASSIS ============ */
  .pedal {
    position: relative;
    width: 100%;
    aspect-ratio: 1400 / 955;
    container-type: inline-size;
    --bk: 11.5cqw;
    --cb: 10.5cqw;
    --tile: 15.5cqw;
    --fb: 8.5cqw;
    --fst: 14cqw;
    border-radius: 34px;
    padding: 26px;
    background:
      radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 60%),
      linear-gradient(160deg, #d6d6d4 0%, #c4c4c2 45%, #b9b9b7 100%);
    box-shadow:
      0 2px 1px rgba(255,255,255,0.9) inset,
      0 -2px 2px rgba(0,0,0,0.12) inset,
      0 40px 70px -20px rgba(0,0,0,0.45),
      0 12px 24px rgba(0,0,0,0.18);
  }
  .pedal::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 34px;
    background-image:
      radial-gradient(rgba(0,0,0,0.10) 0.5px, transparent 0.6px),
      radial-gradient(rgba(255,255,255,0.25) 0.5px, transparent 0.6px);
    background-size: 4px 4px, 5px 5px;
    background-position: 0 0, 2px 3px;
    opacity: 0.55;
    pointer-events: none;
    mix-blend-mode: overlay;
  }
  .panel-grid {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
  }
  .knob-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 2.4cqw 2.6cqw;
    flex: 0 0 auto;
  }
  .head-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    align-items: start;
    flex: 0 0 auto;
  }
  .head-row > .wide-tile { grid-column: 1; width: 100%;
    background: linear-gradient(180deg, #e2e4e9 0%, #d0d3da 100%); }
  .head-row > .screen { grid-column: 2 / 5; }
  .head-row > .tile:last-child { grid-column: 5; }
  .head-row .tile { height: 18.5cqw; }

  .wide-tile .duo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2%;
    width: 100%;
  }
  .wide-tile .knob-unit { width: auto; gap: 7px; }
  .wide-tile .knob { width: 6.4cqw; height: 6.4cqw; }
  .wide-tile .label { font-size: clamp(8px, 1.3vw, 14px); }

  .knob-row {
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    align-items: center;
    flex: 0 0 auto;
  }
  .knob-row .arrow {
    position: absolute;
    top: 40%;
    transform: translate(-50%, -50%);
    color: #b8b8b6;
    font-size: clamp(13px, 2vw, 22px);
    font-weight: 300;
  }
  .knob-row .arrow.l { left: 40%; }
  .knob-row .arrow.r { left: 60%; }

  .tile {
    flex: 0 0 auto;
    width: var(--tile);
    height: var(--tile);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0 auto;
  }
  .tile .knob-unit { gap: 9px; width: 100%; }
  .tile .knob { width: var(--bk); height: var(--bk); aspect-ratio: 1; }
  .tile .label { white-space: nowrap; }

  .knob-row .tile, .head-row > .tile:last-child { cursor: pointer; transition: box-shadow .45s ease; }
  .tile { position: relative; }
  .tile .knob-unit { position: relative; z-index: 1; }

  .knob-row .tile::before, .head-row > .tile:last-child::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: radial-gradient(circle at 50% 22%, #3d93ff 0%, #143f9e 52%, #071c4a 100%);
    opacity: 0;
    transition: opacity .45s ease;
    z-index: 0;
    pointer-events: none;
  }
  .knob-row .tile.selected::before,
  .head-row > .tile:last-child.selected::before { opacity: 1; }
  .knob-row .tile.selected,
  .head-row > .tile:last-child.selected {
    box-shadow:
      0 0 0 1px rgba(130,195,255,0.6),
      0 1px 1px rgba(255,255,255,0.3) inset,
      0 -2px 6px rgba(0,0,0,0.18) inset,
      0 0 18px rgba(61,147,255,0.65),
      0 10px 24px rgba(12,47,122,0.5);
  }
  .knob-row .tile.selected .label,
  .head-row > .tile:last-child.selected .label { color: #ffffff; }

  .wide-tile .knob-unit { cursor: pointer; border-radius: 13px; padding: 0.7cqw 1.1cqw; transition: box-shadow .4s ease; }
  .wide-tile .knob-unit > * { position: relative; z-index: 1; }
  .wide-tile .knob-unit::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: radial-gradient(circle at 50% 25%, #3d93ff 0%, #143f9e 55%, #071c4a 100%);
    opacity: 0;
    transition: opacity .4s ease;
    z-index: 0;
    pointer-events: none;
  }
  .wide-tile .knob-unit.selected::before { opacity: 1; }
  .wide-tile .knob-unit.selected { box-shadow: 0 0 0 1px rgba(130,195,255,0.6), 0 0 16px rgba(61,147,255,0.6), 0 6px 14px rgba(12,47,122,0.45); }
  .wide-tile .knob-unit.selected .label { color: #ffffff; }

  .knob-row .tile::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 100%;
    width: 70%;
    height: 5cqw;
    transform: translateX(-50%) scaleY(0);
    transform-origin: top center;
    background: linear-gradient(180deg, #0c2f7a 0%, #3d93ff 100%);
    z-index: 0;
    pointer-events: none;
    transition: transform .4s ease .05s;
  }
  .knob-row .tile.selected::after { transform: translateX(-50%) scaleY(1); }

  .foot-row { position: relative; }
  .foot-row::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: linear-gradient(180deg, #1a55c8 0%, #0a2456 48%, #05122f 100%);
    clip-path: circle(0% at var(--ox, 50%) 0%);
    transition: clip-path .65s ease .12s;
    z-index: 0;
    pointer-events: none;
  }
  .foot-row.linked-green::before { clip-path: circle(165% at var(--ox, 50%) 0%); }
  .foot-row.linked-green {
    box-shadow:
      0 0 0 1px rgba(130,195,255,0.5),
      inset 0 2px 0 rgba(160,205,255,0.5),
      0 -1px 4px rgba(0,0,0,0.12) inset,
      0 0 34px rgba(61,147,255,0.4),
      0 12px 30px rgba(8,28,70,0.6);
    transition: box-shadow .5s ease;
  }
  .foot-row .sw-label, .foot-row .connector,
  .foot-row .connector .arr, .foot-row .brand { transition: color .5s ease .18s; }
  .foot-row.linked-green .sw-label,
  .foot-row.linked-green .connector,
  .foot-row.linked-green .connector .arr,
  .foot-row.linked-green .brand { color: #eaf3ff; }
  .foot-row.linked-green .connector .ln { background: rgba(255,255,255,0.65); }
  .foot-row.linked-green .brand .box { border-color: rgba(255,255,255,0.6); }

  .face {
    background: linear-gradient(180deg, #fbfbfa 0%, #f1f1ef 100%);
    border-radius: 18px;
    box-shadow:
      0 1px 1px rgba(255,255,255,0.9) inset,
      0 -1px 3px rgba(0,0,0,0.06) inset,
      0 6px 14px rgba(0,0,0,0.10);
  }
  .side-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    padding: 6% 0;
  }
  .side-panel .knob-unit { width: 100%; }
  .knob-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 11px;
  }
  .label {
    font-size: clamp(9px, 1.55vw, 16px);
    color: #6f6f6d;
    font-weight: 400;
    letter-spacing: 0.2px;
  }

  /* ============ KNOBS ============ */
  .knob {
    position: relative;
    border-radius: 50%;
  }
  .knob .ticks {
    position: absolute;
    inset: -13%;
    border-radius: 50%;
    pointer-events: none;
  }
  .knob .ticks .tick {
    position: absolute;
    inset: 0;
  }
  .knob .ticks .tick::before {
    content: "";
    position: absolute;
    top: 0; left: 50%;
    width: 2px; height: 2px;
    margin-left: -1px;
    background: #a8a8a6;
    border-radius: 50%;
  }
  .knob .pointer {
    position: absolute;
    bottom: 50%; left: 50%;
    width: 3px;
    height: 35%;
    border-radius: 3px;
    transform-origin: 50% 100%;
    z-index: 3;
  }

  .knob.white {
    position: relative;
    background:
      radial-gradient(circle at 50% 34%, rgba(255,255,255,0.92), rgba(255,255,255,0) 46%),
      conic-gradient(from 0deg,
        #cfcfcd, #f3f3f1 11%, #c2c2c0 24%, #efefed 37%,
        #bdbdbb 50%, #efefed 63%, #c2c2c0 76%, #f3f3f1 89%, #cfcfcd),
      radial-gradient(circle at 50% 50%, #dcdcda, #a6a6a4 100%);
    box-shadow:
      0 1px 2px rgba(255,255,255,0.85) inset,
      0 -2px 5px rgba(0,0,0,0.28) inset,
      0 5px 12px rgba(0,0,0,0.22),
      0 2px 4px rgba(0,0,0,0.15);
  }
  .knob.white::after {
    content: "";
    position: absolute; inset: 24%;
    border-radius: 50%;
    background:
      conic-gradient(from 90deg, #e4e4e2, #fafaf8 25%, #cacac8 50%, #fafaf8 75%, #e4e4e2),
      radial-gradient(circle at 50% 35%, #fbfbfb, #c8c8c6 75%, #b4b4b2 100%);
    box-shadow: 0 1px 2px rgba(0,0,0,0.22) inset, 0 -1px 2px rgba(255,255,255,0.8) inset;
    z-index: 1;
  }
  .knob.white .pointer { display: none; }

  #kPreview, #kGenerator, #kMix {
    background:
      radial-gradient(circle at 50% 34%, rgba(190,215,255,0.95), rgba(255,255,255,0) 46%),
      conic-gradient(from 0deg,
        #3f72c4, #79a8ff 11%, #2b5aa6 24%, #6294ec 37%,
        #21478e 50%, #6294ec 63%, #2b5aa6 76%, #79a8ff 89%, #3f72c4),
      radial-gradient(circle at 50% 50%, #4f86d6, #173b80 100%);
    box-shadow:
      0 1px 2px rgba(200,225,255,0.7) inset,
      0 -2px 6px rgba(0,0,0,0.35) inset,
      0 5px 12px rgba(10,40,110,0.4),
      0 2px 4px rgba(0,0,0,0.2),
      0 0 16px rgba(61,147,255,0.45);
  }
  #kPreview::after, #kGenerator::after, #kMix::after {
    background:
      conic-gradient(from 90deg, #5a8de0, #a7c6ff 25%, #3b6cc0 50%, #a7c6ff 75%, #5a8de0),
      radial-gradient(circle at 50% 35%, #cfe0ff, #4f86d6 75%, #2a5aa8 100%);
    box-shadow: 0 1px 2px rgba(0,0,0,0.3) inset, 0 -1px 2px rgba(200,225,255,0.7) inset;
  }

  .head-row > .wide-tile,
  .head-row > .tile:last-child,
  .knob-row .tile {
    background: linear-gradient(180deg, #3c3d42 0%, #2a2b2f 100%);
    box-shadow:
      0 1px 1px rgba(255,255,255,0.06) inset,
      0 -3px 8px rgba(0,0,0,0.35) inset,
      0 6px 16px rgba(0,0,0,0.30),
      0 1px 2px rgba(0,0,0,0.25);
  }
  .wide-tile .label,
  .head-row > .tile:last-child .label,
  .knob-row .tile .label { color: #cfd2da; }

  .knob.black {
    background:
      radial-gradient(circle at 50% 34%, rgba(190,215,255,0.9), rgba(255,255,255,0) 46%),
      conic-gradient(from 0deg,
        #3f72c4, #79a8ff 11%, #2b5aa6 24%, #6294ec 37%,
        #21478e 50%, #6294ec 63%, #2b5aa6 76%, #79a8ff 89%, #3f72c4),
      radial-gradient(circle at 50% 50%, #4f86d6, #173b80 100%);
    box-shadow:
      0 1px 2px rgba(200,225,255,0.65) inset,
      0 -3px 7px rgba(0,0,0,0.4) inset,
      0 6px 14px rgba(10,40,110,0.45),
      0 2px 4px rgba(0,0,0,0.25);
  }
      .keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.competitor-detail-card {
  animation: pop 0.25s ease;
}

  .knob.black::before { display: none; }
  .knob.black .ticks { display: none; }
  .knob.black::after {
    content: "";
    position: absolute; inset: 24%;
    border-radius: 50%;
    background:
      conic-gradient(from 90deg, #5a8de0, #a7c6ff 25%, #3b6cc0 50%, #a7c6ff 75%, #5a8de0),
      radial-gradient(circle at 50% 35%, #cfe0ff, #4f86d6 75%, #2a5aa8 100%);
    box-shadow: 0 1px 2px rgba(0,0,0,0.3) inset, 0 -1px 2px rgba(200,225,255,0.7) inset;
    z-index: 1;
  }
  .knob.black .pointer { display: none; }

  .knob.lg { width: 56%; aspect-ratio: 1; }
  .knob.sm { width: 60%; aspect-ratio: 1; }
  .knob.black { width: var(--bk); height: var(--bk); aspect-ratio: 1; }

  /* ============ DISPLAY ============ */
  .display-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .screen {
    height: 24cqw;
    border-radius: 16px;
    background:
      radial-gradient(120% 90% at 50% 0%, #232325 0%, #141416 55%, #0a0a0b 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4% 5%;
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.4),
      0 4px 12px rgba(0,0,0,0.3) inset;
    overflow: hidden;
  }
  .screen::after {
    content:"";
    position:absolute; inset:0;
    background: linear-gradient(180deg, rgba(255,255,255,0.06), transparent 30%);
    pointer-events:none;
  }

  .vu {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    width: 11%;
    height: 60%;
    align-self: flex-start;
    margin-top: 4%;
  }
  .vu .dot {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgba(220,220,220,0.85);
  }
  .vu .dot.off { background: rgba(120,120,120,0.22); }

  .screen-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    flex: 1;
  }
  .logo { margin-bottom: 2px; line-height: 0; }
  .logo svg { display:block; width: clamp(20px,3vw,30px); height:auto; }

  .preset-name {
    color: #f2f2f2;
    font-size: clamp(15px, 2.7vw, 28px);
    font-weight: 300;
    letter-spacing: 0.5px;
  }
  .preset-num {
    color: #f2f2f2;
    font-size: clamp(14px, 2.4vw, 24px);
    font-weight: 400;
    border: 1.5px solid rgba(230,230,230,0.55);
    border-radius: 7px;
    padding: 2px 14px;
    letter-spacing: 1px;
  }

  .pitch {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 4%;
    height: 100%;
  }
  .pitch.right { align-items: flex-end; text-align: right; }
  .pitch .vu { align-self: auto; margin: 0; }
  .pitch .meta { line-height: 1.25; }
  .pitch .val { color: #8a8a8a; font-size: clamp(10px,1.5vw,15px); font-weight:400; }
  .pitch .cap { color: #cfcfcf; font-size: clamp(10px,1.55vw,16px); font-weight:400; }

  .center-knobs {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 3%;
    gap: 1%;
  }
  .center-knobs .knob-unit { gap: 13px; flex: 1; }
  .center-knobs .knob-unit:nth-child(2) { flex: 1.5; }
  .center-knobs .knob .ticks { display: none; }

  .cbtn {
    width: var(--cb); height: var(--cb);
    border-radius: 50%;
    position: relative;
    flex: 0 0 auto;
    background:
      radial-gradient(circle at 50% 36%, #ffffff 0%, #f0f0ee 22%, #cfcfcd 48%, #bdbdbb 60%, #eeeeec 74%, #b2b2b0 100%);
    box-shadow:
      0 1px 2px rgba(255,255,255,0.9) inset,
      0 -2px 5px rgba(0,0,0,0.20) inset,
      0 5px 11px rgba(0,0,0,0.22),
      0 2px 4px rgba(0,0,0,0.15);
  }
  .cbtn::after {
    content:"";
    position:absolute; inset:18%;
    border-radius:50%;
    background:
      radial-gradient(circle at 50% 34%, #ffffff 0%, #e8e8e6 30%, #c4c4c2 68%, #d4d4d2 100%);
    box-shadow: 0 1px 2px rgba(0,0,0,0.20) inset, 0 -1px 2px rgba(255,255,255,0.85) inset;
  }
  .cled {
    width: 11px; height: 11px;
    border-radius: 50%;
    background: #b9b9b7;
    box-shadow: 0 1px 1px rgba(0,0,0,0.25) inset;
  }
  .cled.on {
    background: radial-gradient(circle at 40% 35%, #ffd0a0, #ff6a1c 55%, #d23f00 100%);
    box-shadow:
      0 0 10px 2px rgba(255,90,20,0.75),
      0 0 3px rgba(255,120,40,0.9),
      0 1px 1px rgba(255,255,255,0.4) inset;
  }

  .preset-knob-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2cqw;
    width: 100%;
  }
  .preset-knob-wrap .arrow {
    color: #b8b8b6;
    font-size: clamp(16px, 2.8vw, 30px);
    font-weight: 300;
    flex: 0 0 auto;
  }
  .preset-knob-wrap .knob { width: var(--bk); height: var(--bk); flex: 0 0 auto; }

  .center-knobs .label.big {
    font-size: clamp(10px, 1.7vw, 18px);
  }

  /* ============ FOOTSWITCH ROW ============ */
  .foot-row {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    position: relative;
    padding: 2.2cqw 2.6cqw;
    background: linear-gradient(180deg, #fbfbfa 0%, #f1f1ef 100%);
    border-radius: 18px;
    box-shadow:
      0 1px 1px rgba(255,255,255,0.9) inset,
      0 -1px 3px rgba(0,0,0,0.06) inset,
      0 6px 14px rgba(0,0,0,0.10);
  }
  .fs-tile {
    width: var(--fst);
    margin: 0 auto;
    padding: 1.5cqw 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
  }
  .fs-tile .switch-unit { gap: 1cqw; width: 100%; }

  .switch-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 2;
  }
  .led {
    width: 12px; height: 12px;
    border-radius: 50%;
    background: #b9b9b7;
    box-shadow: 0 1px 1px rgba(0,0,0,0.25) inset;
  }
  .led.on {
    background: radial-gradient(circle at 40% 35%, #ffd0a0, #ff6a1c 55%, #d23f00 100%);
    box-shadow:
      0 0 10px 2px rgba(255,90,20,0.75),
      0 0 3px rgba(255,120,40,0.9),
      0 1px 1px rgba(255,255,255,0.4) inset;
  }

  .footswitch {
    width: var(--fb);
    aspect-ratio: 1;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 36%, rgba(255,255,255,0.95), rgba(255,255,255,0) 46%),
      conic-gradient(from 0deg,
        #cfcfcd, #f3f3f1 11%, #c2c2c0 24%, #efefed 37%,
        #bdbdbb 50%, #efefed 63%, #c2c2c0 76%, #f3f3f1 89%, #cfcfcd),
      radial-gradient(circle at 50% 50%, #dcdcda, #a6a6a4 100%);
    box-shadow:
      0 1px 2px rgba(255,255,255,0.85) inset,
      0 -2px 5px rgba(0,0,0,0.28) inset,
      0 5px 11px rgba(0,0,0,0.22),
      0 2px 4px rgba(0,0,0,0.15);
    position: relative;
  }
  .footswitch::after {
    content:"";
    position:absolute; inset:20%;
    border-radius:50%;
    background:
      conic-gradient(from 90deg,
        #e4e4e2, #fafaf8 25%, #cacac8 50%, #fafaf8 75%, #e4e4e2),
      radial-gradient(circle at 50% 35%, #fbfbfb, #c8c8c6 75%, #b4b4b2 100%);
    box-shadow: 0 1px 2px rgba(0,0,0,0.22) inset, 0 -1px 2px rgba(255,255,255,0.8) inset;
  }

  .sw-label {
    font-size: clamp(9px, 1.55vw, 16px);
    color: #6f6f6d;
    text-align: center;
  }

  .connector {
    position: absolute;
    top: 44%;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #8a8a88;
    font-size: clamp(8px, 1.4vw, 15px);
    white-space: nowrap;
    justify-content: center;
    z-index: 1;
  }
  .connector .ln { width: clamp(8px,1.4vw,16px); height:1px; background:#c2c2c0; }
  .connector .arr { color:#9a9a98; font-size: 1.05em; }
  .conn1 { left: 25%; transform: translateX(-50%); }
  .conn2 { left: 50%; transform: translateX(-50%); }
  .conn3 { left: 75%; transform: translateX(-50%); }

  .brand {
    position: absolute;
    right: 4%;
    bottom: -1px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8a8a88;
    font-size: clamp(10px,1.5vw,15px);
    font-weight: 500;
  }
  .brand .box {
    border: 1px solid #9a9a98;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 0.85em;
  }

  /* ===== Blog generator app ===== */
  .ov { position:fixed; inset:0; z-index:1000; display:none; align-items:center; justify-content:center; padding:24px; }
  .ov.open { display:flex; }
  .ov-bd { position:absolute; inset:0; background:rgba(6,8,16,0.72); backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px); }
  @keyframes pop { from{opacity:0; transform:translateY(10px) scale(.98)} to{opacity:1; transform:none} }

  .cardhost .card { background:rgba(14,19,38,.92); }

  .blogwrap { position:relative; width:min(94vw,860px); max-height:90vh; background:#f4f5f7; border-radius:18px; overflow:hidden;
              display:flex; flex-direction:column; box-shadow:0 30px 90px rgba(0,0,0,.6); animation:pop .3s ease; }
  .blog-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:#fff; border-bottom:1px solid #e6e7ea; }
  .blog-head h2 { font-size:18px; font-weight:600; color:#1d2330; }
  .blog-body { overflow:auto; padding:18px 20px; display:flex; flex-direction:column; gap:18px; }
  .blogcard { border:1px solid #e3e5e9; border-radius:14px; overflow:hidden; background:#fff; }
  .blogcard .bc-top { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; border-bottom:1px solid #eef0f3; }
  .bc-title { font-size:15px; font-weight:600; color:#222; border:none; outline:none; width:60%; }
  .badge { font-size:12px; padding:4px 10px; border-radius:999px; font-weight:600; }
  .b-none{ background:#eef0f3; color:#5d6470; } .b-draft{ background:#fff3d6; color:#9a6a00; }
  .b-sched{ background:#e0ecff; color:#1e5fd0; } .b-pub{ background:#d8f5e2; color:#137a44; }
  .editor { padding:14px 16px; min-height:140px; max-height:320px; overflow:auto; font-size:14px; line-height:1.6; color:#2a2f3a; outline:none; }
  .editor h2,.editor h3{ margin:12px 0 6px; color:#1a1f29; } .editor p{ margin:8px 0; }
  .bc-actions { display:flex; flex-wrap:wrap; gap:8px; padding:12px 14px; border-top:1px solid #eef0f3; background:#fafbfc; }
  .abtn { border:1px solid #d7dae0; background:#fff; color:#384150; border-radius:9px; padding:7px 12px; font:inherit; font-size:13px; cursor:pointer; display:inline-flex; gap:6px; align-items:center; }
  .abtn:hover{ background:#f1f3f6; }
  .abtn.pub{ background:#137a44; border-color:#137a44; color:#fff; } .abtn.pub:hover{ filter:brightness(1.08); }
  .abtn.sch{ background:#1e5fd0; border-color:#1e5fd0; color:#fff; } .abtn.sch:hover{ filter:brightness(1.08); }
  .schbox { display:flex; gap:8px; align-items:center; flex-wrap:wrap; width:100%; margin-top:6px; }
  .schbox input{ border:1px solid #d7dae0; border-radius:8px; padding:6px 8px; font:inherit; font-size:13px; }
  .toast { position:fixed; bottom:22px; left:50%; transform:translateX(-50%); background:#1d2330; color:#fff; padding:10px 16px; border-radius:10px; font-size:13px; z-index:2000; opacity:0; transition:.25s; }
  .toast.show{ opacity:1; }

  .ov .wiz-x { position:absolute; top:18px; right:22px; z-index:6; width:38px; height:38px; border-radius:50%;
    border:1px solid rgba(255,255,255,.25); background:rgba(10,14,28,.85); color:#fff; font-size:19px; line-height:1;
    cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .ov .wiz-x:hover { background:rgba(30,38,60,.9); }
  .portal-wrap { position:relative; animation:pop .3s cubic-bezier(.2,.8,.2,1); }
  .portal {
    position:relative; width:min(86vmin,600px); height:min(86vmin,600px); border-radius:50%;
    overflow:hidden; background:#070b18 center/cover no-repeat;
    box-shadow:0 0 0 1px rgba(120,160,255,.28), 0 0 70px rgba(70,120,255,.4),
               inset 0 0 90px rgba(5,8,20,.92), 0 30px 90px rgba(0,0,0,.7);
  }
  .portal::after{ content:""; position:absolute; inset:0; border-radius:50%;
    background:radial-gradient(circle at 50% 50%, rgba(10,15,35,.05) 28%, rgba(6,9,20,.78) 74%); }
  .portal.hidden { display:none; }
  .pring { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); border-radius:50%;
    border:1px solid rgba(140,175,255,.14); pointer-events:none; }
  .pring.r1{ width:30%; height:30%; } .pring.r2{ width:52%; height:52%; }
  .pring.r3{ width:74%; height:74%; } .pring.r4{ width:94%; height:94%; }
  .portal-core { position:absolute; left:50%; top:50%; width:30px; height:30px; transform:translate(-50%,-50%);
    border-radius:50%; background:radial-gradient(circle,#eaf2ff,#6ea2ff 58%,rgba(60,110,255,0));
    box-shadow:0 0 34px 9px rgba(110,160,255,.7); animation:corepulse 3s ease-in-out infinite; pointer-events:none; }
  @keyframes corepulse{ 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.85} 50%{transform:translate(-50%,-50%) scale(1.28);opacity:1} }
  .pstar { position:absolute; transform:translate(-50%,-50%); background:none; border:none; cursor:pointer; z-index:4;
    display:flex; flex-direction:column; align-items:center; gap:9px; color:#e3ebff; }
  .pstar-dot { width:30px; height:30px; border-radius:50%;
    background:radial-gradient(circle at 40% 35%, #eaf2ff, #79a8ff 46%, #2b5aa6 100%);
    box-shadow:0 0 28px 10px rgba(98,148,236,.85), 0 0 56px 20px rgba(61,147,255,.45);
    animation:twinkle 2.2s ease-in-out infinite; }
  .pstar.big .pstar-dot{ width:44px; height:44px;
    background:radial-gradient(circle at 40% 35%, #eaf2ff, #6294ec 46%, #21478e 100%);
    box-shadow:0 0 40px 15px rgba(98,148,236,.95), 0 0 80px 28px rgba(61,147,255,.55); }
  @keyframes twinkle{ 0%,100%{transform:scale(1);opacity:.92} 50%{transform:scale(1.16);opacity:1} }
  .pstar:hover .pstar-dot{ transform:scale(1.28); box-shadow:0 0 50px 20px rgba(120,175,255,1), 0 0 90px 34px rgba(61,147,255,.6); }
  .pstar-label { font-size:14.5px; letter-spacing:.4px; background:rgba(8,12,26,.62); padding:5px 14px;
    border-radius:999px; border:1px solid rgba(120,165,255,.4); white-space:nowrap; }
  .pstar.done .pstar-dot{ background:radial-gradient(circle at 40% 35%,#eaf2ff,#4f86d6 60%,#1a3f86 100%); box-shadow:0 0 30px 12px rgba(98,148,236,.85), 0 0 60px 22px rgba(61,147,255,.5); }
  .pstar.done .pstar-label::after{ content:" ✓"; color:#9cc2ff; }
  .portal-hint { position:absolute; left:0; right:0; top:13%; text-align:center;
    color:#aebbe0; font-size:13px; letter-spacing:1.5px; animation:hintpulse 2.4s ease-in-out infinite; pointer-events:none; }
  @keyframes hintpulse{ 0%,100%{opacity:.5} 50%{opacity:1} }
  .portal-save { position:absolute; left:50%; bottom:9%; transform:translateX(-50%); z-index:5;
    border:1px solid rgba(140,175,255,.35); background:rgba(20,28,52,.7); color:#dce6ff;
    padding:9px 18px; border-radius:999px; font:inherit; font-size:13.5px; cursor:pointer; }
  .portal-save:hover{ background:rgba(40,55,95,.8); }
  .cardhost { display:none; width:min(92vw,560px); }
  .cardhost.open { display:block; width:min(94vw,860px); max-height:88vh; overflow:auto; animation:pop .25s ease; }
  .cardhost .card { padding:28px 30px; border-radius:20px; }
  .cardhost .card h3 { font-size:25px; }
  .cardhost .card .sub, .cardhost .sub { font-size:15.5px; margin-bottom:20px; }
  .cardhost .cardtop { gap:16px; margin-bottom:8px; }
  .cardhost .field { gap:12px; margin-bottom:18px; }
  .cardhost .field input { padding:14px 16px; font-size:16px; border-radius:12px; }
  .cardhost .btn { padding:13px 22px; font-size:15.5px; border-radius:12px; }
  .cardhost .btn-sm { padding:9px 16px; font-size:14px; }
  .cardhost .chips { gap:11px; }
  .cardhost .chip { padding:12px 18px; font-size:15px; }
  .cardhost .muted { font-size:14px; }
  .cardhost .wiz-foot { margin-top:22px; }
  .cardtop { display:flex; align-items:center; gap:12px; margin-bottom:4px; }
  .cardtop h3 { margin:0; }

  .card { position:relative; z-index:2; background:rgba(18,24,44,.92); border:1px solid rgba(130,160,255,.18);
          border-radius:16px; padding:18px; color:#e7ecfb; box-shadow:0 10px 40px rgba(0,0,0,.4); }
  .card h3 { font-size:19px; font-weight:600; margin:0 0 4px; color:#eef2ff; }
  .card .sub, .sub { font-size:13px; color:#9fb0d8; margin-bottom:14px; }
  .cardtop { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
  .cardtop h3 { margin:0; }
  .field { display:flex; gap:8px; margin-bottom:12px; }
  .field input { flex:1; background:rgba(8,12,26,.85); border:1px solid rgba(130,160,255,.25); color:#eef2ff;
                 padding:10px 12px; border-radius:10px; font:inherit; font-size:14px; outline:none; }
  .field input:focus { border-color:#6ea2ff; }
  .btn { border:none; border-radius:10px; padding:10px 16px; font:inherit; font-size:14px; font-weight:500; cursor:pointer; transition:.15s; }
  .btn:disabled { opacity:.5; cursor:default; }
  .btn-pri { background:linear-gradient(180deg,#6ea2ff,#3b73ff); color:#fff; }
  .btn-pri:hover:not(:disabled){ filter:brightness(1.08); }
  .btn-gho { background:rgba(255,255,255,.08); color:#cfd8f5; border:1px solid rgba(255,255,255,.16); }
  .btn-sm { padding:7px 12px; font-size:13px; }
  .chips { display:flex; flex-wrap:wrap; gap:8px; margin:6px 0 4px; }
  .chip { padding:8px 13px; border-radius:999px; background:rgba(40,52,86,.7); border:1px solid rgba(130,160,255,.2);
          color:#cdd7f5; font-size:13px; cursor:pointer; transition:.15s; user-select:none; }
  .chip:hover { border-color:#6ea2ff; }
  .chip.sel { background:linear-gradient(180deg,#6ea2ff,#3b73ff); color:#fff; border-color:transparent; }
  .muted { color:#8ea0cc; font-size:12.5px; }
  .wiz-foot { display:flex; justify-content:space-between; align-items:center; margin-top:16px; }
  .spin { width:16px; height:16px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%;
          display:inline-block; animation:sp .7s linear infinite; vertical-align:-3px; margin-right:6px; }
  @keyframes sp { to{ transform:rotate(360deg) } }

  /* product picker additions */
  .prod-grid { display:flex; flex-wrap:wrap; gap:8px; margin-top:6px; }
  .prod-card { border:1px solid rgba(130,160,255,.25); border-radius:8px; padding:8px; background:rgba(18,24,44,.75); width:120px; cursor:pointer; text-align:center; }
  .prod-card.sel { border-color:#6ea2ff; background:rgba(40,55,95,.9); }
  .prod-card img { width:100%; height:80px; object-fit:cover; border-radius:4px; margin-bottom:4px; }
  .prod-name { font-size:12px; color:#cdd7f5; margin-bottom:2px; }
  .prod-price { font-size:11px; color:#8ea0cc; }
  .search-input { margin:8px 0; }

  /* new product search box */
  .product-search-box {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(8,12,26,.85);
    border: 1px solid rgba(130,160,255,.25);
    border-radius: 12px;
    padding: 0 12px;
    transition: border-color .2s;
  }
  .product-search-box:focus-within {
    border-color: #6ea2ff;
  }
  .product-search-box input {
    flex:1;
    background: transparent;
    border: none;
    color: #eef2ff;
    font-size: 14px;
    padding: 10px 8px;
    outline: none;
  }
  .product-search-box .search-icon {
    color: #6ea2ff;
    font-size: 16px;
    margin-right: 4px;
  }
  .product-search-box .loading-spinner {
    margin-left: 8px;
  }
    .keyword-chip {
  background: rgba(40,52,86,.7);
  border: 1px solid rgba(130,160,255,.2);
  color: #cdd7f5;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
}
  .foot-row {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;  /* centering */
  gap: 2cqw;
  padding: 2.2cqw 2.6cqw;
  background: linear-gradient(180deg, #fbfbfa 0%, #f1f1ef 100%);
  border-radius: 18px;
  box-shadow:
    0 1px 1px rgba(255,255,255,0.9) inset,
    0 -1px 3px rgba(0,0,0,0.06) inset,
    0 6px 14px rgba(0,0,0,0.10);
  position: relative;
}

/* ===== App sidebar & pages ===== */
.lvx-root { padding-left: 290px; }
/* Sidebar is FIXED: it floats on the left and never pushes or resizes
   the pedal / dashboard content. */
.app-side { position: fixed; left: 20px; top: 80px; bottom: 20px; width: 240px;
  overflow-y: auto; z-index: 500;
  background: linear-gradient(180deg,#1b2136,#10141f); border:1px solid rgba(130,160,255,.18);
  border-radius: 18px; padding: 18px 12px; color:#dbe4fb; box-shadow: 0 20px 50px rgba(0,0,0,.45); }
.app-side::-webkit-scrollbar { width: 6px; }
.app-side::-webkit-scrollbar-thumb { background: rgba(130,160,255,.25); border-radius: 6px; }
@media (max-width: 980px) {
  .lvx-root { padding-left: 20px; }
  .app-side { position: static; width: 100%; margin-bottom: 20px; bottom: auto; }
  .lvx-root { flex-direction: column; }
}
.side-store { margin: 0 8px 12px; padding: 10px 12px; border:1px solid rgba(130,160,255,.2);
  border-radius: 12px; background: rgba(10,14,28,.55); }
.side-store .ss-name { font-size: 13px; font-weight: 600; color:#eef2ff; margin-bottom: 3px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.side-store .ss-meta { font-size: 11.5px; color:#8ea0cc; line-height: 1.5; }
.app-side .side-title { font-size:15px; font-weight:600; letter-spacing:.5px; color:#eef2ff;
  padding: 4px 10px 14px; display:flex; align-items:center; gap:9px; }
.app-side .side-title .sdot { width:10px; height:10px; border-radius:50%;
  background:radial-gradient(circle at 40% 35%, #eaf2ff, #6294ec 46%, #21478e 100%);
  box-shadow:0 0 12px rgba(98,148,236,.9); }
.side-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px;
  cursor:pointer; font-size:14px; color:#b9c6ea; transition:.15s; border:1px solid transparent; user-select:none; }
.side-item:hover { background:rgba(110,162,255,.08); color:#eef2ff; }
.side-item.active { background:linear-gradient(180deg,rgba(110,162,255,.22),rgba(59,115,255,.18));
  border-color:rgba(130,160,255,.35); color:#fff; }
.side-item .cnt { margin-left:auto; font-size:11px; background:rgba(40,52,86,.9);
  border:1px solid rgba(130,160,255,.25); border-radius:999px; padding:1px 8px; color:#9fb0d8; }
.side-sec { margin:14px 10px 6px; font-size:11px; letter-spacing:1.2px; text-transform:uppercase; color:#7386b3; }
.app-main { flex:1; min-width:0; display:flex; justify-content:center; }
.page { width:min(1000px,100%); background:rgba(18,24,44,.92); border:1px solid rgba(130,160,255,.18);
  border-radius:18px; padding:26px 28px; color:#e7ecfb; box-shadow:0 20px 60px rgba(0,0,0,.45); animation:pop .25s ease; }
.page h2 { font-size:22px; font-weight:600; color:#eef2ff; margin-bottom:4px; }
.page .psub { color:#9fb0d8; font-size:14px; margin-bottom:18px; }
.tabbar { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
.tab { padding:8px 16px; border-radius:999px; font-size:13.5px; cursor:pointer;
  background:rgba(40,52,86,.6); border:1px solid rgba(130,160,255,.2); color:#cdd7f5; user-select:none; }
.tab.active { background:linear-gradient(180deg,#6ea2ff,#3b73ff); color:#fff; border-color:transparent; }
.blog-row { display:flex; align-items:center; gap:10px; padding:14px; border:1px solid rgba(130,160,255,.18);
  border-radius:12px; margin-bottom:10px; background:rgba(10,14,28,.5); flex-wrap:wrap; }
.blog-row .bt { font-size:14.5px; font-weight:600; color:#eef2ff; flex:1; min-width:220px; }
.blog-row .bmeta { font-size:12px; color:#8ea0cc; width:100%; }
.gsc-stats { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
.gsc-stat { display:inline-flex; flex-direction:column; gap:4px; padding:14px 18px;
  border:1px solid rgba(130,160,255,.2); border-radius:12px; background:rgba(10,14,28,.5); min-width:150px; }
.gsc-stat .gv { font-size:22px; font-weight:600; color:#eef2ff; }
.gsc-stat .gl { font-size:12px; color:#8ea0cc; }
.bl-table { width:100%; border-collapse:collapse; font-size:13.5px; }
.bl-table th { text-align:left; color:#8ea0cc; font-weight:500; padding:8px 10px;
  border-bottom:1px solid rgba(130,160,255,.2); }
.bl-table td { padding:10px; border-bottom:1px solid rgba(130,160,255,.1); color:#dbe4fb; word-break:break-all; }
.empty { padding:30px; text-align:center; color:#8ea0cc; border:1px dashed rgba(130,160,255,.25); border-radius:12px; }

/* ==========================================================================
   GLOBAL DARK THEME — one unified look matching the Blog Studio sidebar.
   These overrides come last in the stylesheet, so they win over the
   original light chassis styles above.
   ========================================================================== */
body {
  background: radial-gradient(ellipse at 50% 25%, #0e1322 0%, #05070e 100%) fixed;
}
.lvx-root { background: transparent; }

/* Pedal chassis -> dark navy with a soft blue aura */
.pedal {
  background:
    radial-gradient(circle at 30% 18%, rgba(110,162,255,0.12), transparent 60%),
    linear-gradient(160deg, #1a2138 0%, #121729 55%, #0b0e19 100%);
  box-shadow:
    0 0 0 1px rgba(130,160,255,0.20) inset,
    0 2px 1px rgba(160,195,255,0.08) inset,
    0 40px 80px -20px rgba(0,0,0,0.85),
    0 0 70px rgba(61,147,255,0.12);
}
.pedal::before { opacity: 0.22; }

/* Panels & tiles -> dark cards with blue borders (same as sidebar/pages) */
.face,
.foot-row,
.head-row > .wide-tile,
.head-row > .tile:last-child,
.knob-row .tile {
  background: linear-gradient(180deg, rgba(27,33,58,0.96) 0%, rgba(15,19,33,0.96) 100%);
  box-shadow:
    0 0 0 1px rgba(130,160,255,0.16) inset,
    0 1px 1px rgba(160,195,255,0.08) inset,
    0 -2px 6px rgba(0,0,0,0.45) inset,
    0 10px 24px rgba(0,0,0,0.40);
}

/* Text on the chassis */
.label, .sw-label { color: #b9c6ea; }
.wide-tile .label,
.head-row > .tile:last-child .label,
.knob-row .tile .label { color: #cfd9f7; }
.connector { color: #7386b3; }
.connector .arr { color: #8ea0cc; }
.connector .ln { background: rgba(130,160,255,0.30); }
.brand { color: #8ea0cc; }
.brand .box { border-color: #5a6a95; }
.knob-row .arrow, .preset-knob-wrap .arrow { color: #5a6a95; }

/* VU dots on the screen */
.vu .dot { background: rgba(150,185,255,0.92); }
.vu .dot.off { background: rgba(120,140,190,0.14); }

/* Footswitches & center button -> blue metal to match the knobs */
.footswitch, .cbtn {
  background:
    radial-gradient(circle at 50% 36%, rgba(190,215,255,0.92), rgba(255,255,255,0) 46%),
    conic-gradient(from 0deg,
      #3f72c4, #79a8ff 11%, #2b5aa6 24%, #6294ec 37%,
      #21478e 50%, #6294ec 63%, #2b5aa6 76%, #79a8ff 89%, #3f72c4),
    radial-gradient(circle at 50% 50%, #4f86d6, #173b80 100%);
  box-shadow:
    0 1px 2px rgba(200,225,255,0.60) inset,
    0 -2px 5px rgba(0,0,0,0.45) inset,
    0 5px 12px rgba(10,40,110,0.45),
    0 2px 4px rgba(0,0,0,0.30);
}
.footswitch::after, .cbtn::after {
  background:
    conic-gradient(from 90deg, #5a8de0, #a7c6ff 25%, #3b6cc0 50%, #a7c6ff 75%, #5a8de0),
    radial-gradient(circle at 50% 35%, #cfe0ff, #4f86d6 75%, #2a5aa8 100%);
  box-shadow: 0 1px 2px rgba(0,0,0,0.30) inset, 0 -1px 2px rgba(200,225,255,0.60) inset;
}

/* Idle LEDs on the dark chassis */
.led, .cled { background: #3a4260; box-shadow: 0 1px 1px rgba(0,0,0,0.5) inset; }

/* Screen border pops a bit on dark */
.screen { box-shadow: 0 0 0 1px rgba(130,160,255,0.22), 0 4px 12px rgba(0,0,0,0.5) inset; }

/* Foot-row beam colors already blue — keep. Selected tile glow already blue — keep. */

/* ==========================================================================
   GUIDED TOUR — static styles only; all animation is driven by motion/react
   (draw-on arrow, bob, fade). Matches the app's dark navy / #6ea2ff theme.
   ========================================================================== */
.guide-layer { position:absolute; inset:0; z-index:6; pointer-events:none; }

.guide-anchor { position:absolute; pointer-events:none; }
.guide-arrow { display:inline-block; transform-origin: 50% 50%; }

.guide-bubble {
  pointer-events:auto;
  position:absolute;
  max-width: 250px;
  background: rgba(18,24,44,.97);
  border: 1px solid rgba(130,160,255,.45);
  border-radius: 14px;
  padding: 12px 14px;
  color:#e7ecfb; font-size:13.5px; line-height:1.55;
  box-shadow: 0 0 24px rgba(61,147,255,.35), 0 14px 34px rgba(0,0,0,.55);
  z-index:7;
}
.guide-bubble b { color:#9cc2ff; }
.guide-bubble .gb-actions { display:flex; gap:8px; margin-top:10px; justify-content:flex-end; }

.help-fab {
  /* Sits ON the second orbit ring (.pring.r2 is 52% wide -> radius 26%,
     so the ring's top point is at 50% - 26% = 24% from the top).
     margins center the 32px button on that point: motion/react owns the
     transform property, so translate(-50%,-50%) can't be used here. */
  position:absolute; left:50%; top:24%; margin-left:-16px; margin-top:-16px; z-index:7;
  width:32px; height:32px; border-radius:50%;
  border:1px solid rgba(130,160,255,.45);
  background: radial-gradient(circle at 40% 32%, #2c3a66, #141b33 70%);
  color:#cfe0ff; font-size:15px; font-weight:600; cursor:pointer;
  box-shadow: 0 0 14px rgba(61,147,255,.45);
  display:flex; align-items:center; justify-content:center;
  transition: box-shadow .2s;
  line-height: 1;
  padding: 0;
}
.help-fab:hover { box-shadow: 0 0 24px rgba(110,162,255,.85); }

/* Hint on the pedal: a vertical arrow descends from the bubble and its
   tip lands straight DOWN on the preview knob. Sized in cqw (container
   units of the pedal) so it scales responsively with the pedal. */
.preview-hint {
  position:absolute;
  left: 4.5cqw; top: 0.4cqw;
  z-index: 40;
  display:flex; align-items:flex-start; gap: 0.8cqw;
  pointer-events: none;
}
.preview-hint .ph-arrow {
  position: relative;
  width: 6cqw;
  min-width: 40px;
  flex: 0 0 auto;
}
.preview-hint .guide-bubble {
  position: relative;
  pointer-events: auto;
  max-width: min(300px, 34cqw);
  font-size: clamp(10px, 1.5cqw, 13.5px);
  padding: 1.1cqw 1.4cqw;
  border-radius: 1.4cqw;
}
.preview-hint .gb-actions .btn {
  padding: 0.6cqw 1.2cqw;
  font-size: clamp(10px, 1.4cqw, 13px);
}

/* Tiny "?" circle inside the preview/generator tile corner:
   replays the hint message any time, no refresh needed */
.hint-replay {
  position:absolute; right: 0.7cqw; top: 0.7cqw; z-index: 5;
  width: clamp(16px, 2.3cqw, 26px);
  height: clamp(16px, 2.3cqw, 26px);
  border-radius:50%;
  border:1px solid rgba(130,160,255,.45);
  background: radial-gradient(circle at 40% 32%, #2c3a66, #141b33 70%);
  color:#cfe0ff; font-size: clamp(10px, 1.3cqw, 14px); font-weight:600; cursor:pointer;
  box-shadow: 0 0 10px rgba(61,147,255,.45);
  display:flex; align-items:center; justify-content:center;
  transition: box-shadow .2s;
  line-height: 1;
  padding: 0;
}
.hint-replay:hover { box-shadow: 0 0 18px rgba(110,162,255,.85); }
/* Variant: "?" sitting inline inside a card header (not absolutely positioned) */
.hint-replay.in-card {
  position: static; margin-left: auto;
  width: 28px; height: 28px; font-size: 14px;
  flex: 0 0 auto;
}

/* ==========================================================================
   TOPIC SELECTION — square cards with a checkbox, styled exactly like the
   dashboard pedal tiles (same gradient, border and blue selected glow).
   ========================================================================== */
.topic-toolbar {
  display:flex; align-items:center; justify-content:space-between;
  gap:10px; margin:4px 0 12px; flex-wrap:wrap;
}
.topic-grid {
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap:10px;
  max-height:44vh; overflow-y:auto; padding-right:4px;
}
.topic-grid::-webkit-scrollbar { width:6px; }
.topic-grid::-webkit-scrollbar-thumb { background: rgba(130,160,255,.25); border-radius:6px; }
.topic-card {
  display:flex; align-items:flex-start; gap:10px;
  padding:13px 14px; border-radius:12px;
  cursor:pointer; user-select:none;
  background: linear-gradient(180deg, rgba(27,33,58,.96) 0%, rgba(15,19,33,.96) 100%);
  border:1px solid rgba(130,160,255,.18);
  box-shadow: 0 1px 1px rgba(160,195,255,.06) inset, 0 6px 14px rgba(0,0,0,.25);
  transition: border-color .2s, box-shadow .2s;
}
.topic-card:hover { border-color: rgba(130,160,255,.45); }
.topic-card.sel {
  border-color: rgba(130,195,255,.6);
  box-shadow:
    0 0 0 1px rgba(130,195,255,.35),
    0 0 16px rgba(61,147,255,.35),
    0 6px 14px rgba(0,0,0,.3);
}
.topic-check {
  width:18px; height:18px; flex:0 0 auto; margin-top:1px;
  border-radius:5px;
  border:1.5px solid rgba(130,160,255,.45);
  background: rgba(8,12,26,.85);
  display:flex; align-items:center; justify-content:center;
  color:#fff; font-size:12px; line-height:1;
  transition: background .2s, border-color .2s, box-shadow .2s;
}
.topic-check.on {
  background: linear-gradient(180deg,#6ea2ff,#3b73ff);
  border-color: transparent;
  box-shadow: 0 0 10px rgba(61,147,255,.6);
}
.topic-name { font-size:13.5px; line-height:1.45; color:#dbe4fb; }
.topic-card.sel .topic-name { color:#eef2ff; }

/* ==========================================================================
   PRODUCT PICKER — clear two-panel layout: topics on the left, products
   on the right. Same dark tile theme as the dashboard.
   ========================================================================== */
.pp-hintbar {
  display:flex; gap:20px; flex-wrap:wrap; align-items:center;
  padding:11px 14px; margin-bottom:10px;
  border-radius:12px;
  background: rgba(110,162,255,.08);
  border:1px solid rgba(130,160,255,.25);
  font-size:13px; color:#cdd7f5;
}
.pp-step { display:inline-flex; align-items:center; gap:8px; }
.pp-stepnum {
  width:22px; height:22px; flex:0 0 auto;
  border-radius:50%;
  background: linear-gradient(180deg,#6ea2ff,#3b73ff);
  color:#fff; font-size:12px; font-weight:700; line-height:1;
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 0 12px rgba(61,147,255,.65);
}
.pp-why {
  display:flex; align-items:flex-start; gap:9px;
  padding:10px 14px; margin-bottom:12px;
  border-radius:12px;
  background: rgba(8,12,26,.6);
  border:1px dashed rgba(130,160,255,.35);
  font-size:12.5px; line-height:1.55; color:#9fb0d8;
}
.pp-why b { color:#9cc2ff; }
.pp-layout {
  display:grid; grid-template-columns: 250px minmax(0,1fr);
  gap:14px;
  /* Definite height + min-height:0 on the children is what makes the
     columns SCROLL when there are lots of topics/products, instead of
     overflowing on top of the footer. */
  height: 52vh; min-height: 280px;
}
.pp-topics {
  overflow-y:auto; padding-right:4px; min-height:0;
  display:flex; flex-direction:column; gap:8px;
}
.pp-topics::-webkit-scrollbar, .pp-grid::-webkit-scrollbar { width:6px; }
.pp-topics::-webkit-scrollbar-thumb, .pp-grid::-webkit-scrollbar-thumb {
  background: rgba(130,160,255,.25); border-radius:6px;
}
.pp-topic {
  flex:0 0 auto;
  padding:11px 12px; border-radius:12px; cursor:pointer; user-select:none;
  background: linear-gradient(180deg, rgba(27,33,58,.96) 0%, rgba(15,19,33,.96) 100%);
  border:1px solid rgba(130,160,255,.18);
  transition: border-color .2s, box-shadow .2s;
}
.pp-topic:hover { border-color: rgba(130,160,255,.45); }
.pp-topic.active {
  border-color: rgba(130,195,255,.6);
  box-shadow: 0 0 0 1px rgba(130,195,255,.35), 0 0 16px rgba(61,147,255,.35);
}
.pp-topic .ppt-name { font-size:13px; line-height:1.4; color:#dbe4fb; }
.pp-topic.active .ppt-name { color:#eef2ff; }
.pp-topic .ppt-count { font-size:11px; color:#8ea0cc; margin-top:5px; }
.pp-topic .ppt-count .done { color:#9cc2ff; }
.pp-topic .ppt-thumbs { display:flex; gap:4px; margin-top:7px; flex-wrap:wrap; }
.pp-topic .ppt-thumbs img {
  width:28px; height:28px; border-radius:7px; object-fit:cover;
  border:1px solid rgba(130,160,255,.35);
}
.pp-topic .ppt-chip {
  font-size:10px; color:#cdd7f5; background:rgba(40,55,95,.8);
  padding:3px 7px; border-radius:999px;
  max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.pp-products { display:flex; flex-direction:column; gap:10px; min-width:0; min-height:0; }
/* Collection filter row above the product grid */
.pp-collections { display:flex; align-items:center; gap:10px; }
.pp-collections .ppc-label { font-size:12px; color:#8ea0cc; flex:0 0 auto; }
.pp-colrow {
  display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;
  flex:1; min-width:0;
}
.pp-colrow::-webkit-scrollbar { height:5px; }
.pp-colrow::-webkit-scrollbar-thumb { background: rgba(130,160,255,.25); border-radius:6px; }
.pp-colrow .chip { flex:0 0 auto; white-space:nowrap; }

/* ==========================================================================
   BLOG MODAL — dark theme. Overrides the original light .blogwrap styles
   so the generate/edit blog modal matches the dashboard exactly.
   ========================================================================== */
.blogwrap {
  background: linear-gradient(180deg, #1b2136 0%, #10141f 100%);
  border: 1px solid rgba(130,160,255,.22);
  box-shadow: 0 0 0 1px rgba(130,160,255,.1), 0 0 60px rgba(61,147,255,.15),
              0 30px 90px rgba(0,0,0,.7);
}
.blog-head {
  background: rgba(10,14,28,.6);
  border-bottom: 1px solid rgba(130,160,255,.18);
}
.blog-head h2 { color:#eef2ff; }
.blog-body::-webkit-scrollbar { width:6px; }
.blog-body::-webkit-scrollbar-thumb { background: rgba(130,160,255,.25); border-radius:6px; }
.blogcard {
  background: rgba(10,14,28,.55);
  border: 1px solid rgba(130,160,255,.18);
}
.blogcard .bc-top {
  border-bottom: 1px solid rgba(130,160,255,.15);
}
.bc-title {
  background: transparent;
  color:#eef2ff;
}
.bc-title::placeholder { color:#7386b3; }
.editor {
  color:#dbe4fb;
  background: rgba(8,12,26,.35);
}
.editor h2, .editor h3 { color:#eef2ff; }
.editor a { color:#9cc2ff; }
.editor::-webkit-scrollbar { width:6px; }
.editor::-webkit-scrollbar-thumb { background: rgba(130,160,255,.25); border-radius:6px; }
.bc-actions {
  background: rgba(8,12,26,.55);
  border-top: 1px solid rgba(130,160,255,.15);
}
/* Action buttons -> ghost / blue style matching .btn-gho and .btn-pri */
.abtn {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(130,160,255,.3);
  color:#cfd8f5;
}
.abtn:hover { background: rgba(110,162,255,.12); border-color: rgba(130,160,255,.55); }
.abtn.pub {
  background: linear-gradient(180deg,#6ea2ff,#3b73ff);
  border-color: transparent; color:#fff;
  box-shadow: 0 0 14px rgba(61,147,255,.35);
}
.abtn.sch {
  background: rgba(110,162,255,.16);
  border-color: rgba(130,160,255,.5); color:#cfe0ff;
}
.abtn.pub:hover, .abtn.sch:hover { filter: brightness(1.1); }
/* Status badges on dark */
.b-none  { background: rgba(130,160,255,.14); color:#9fb0d8; }
.b-draft { background: rgba(255,190,80,.16);  color:#ffce7a; }
.b-sched { background: rgba(110,162,255,.18); color:#9cc2ff; }
.b-pub   { background: rgba(60,200,130,.16);  color:#6fe0a8; }
/* Schedule date-time input on dark */
.schbox input {
  background: rgba(8,12,26,.85);
  border: 1px solid rgba(130,160,255,.3);
  color:#eef2ff;
  color-scheme: dark;
}
.pp-grid {
  display:grid; grid-template-columns: repeat(auto-fill, minmax(125px,1fr));
  gap:10px; overflow-y:auto; padding-right:4px;
  flex:1; min-height:0; align-content:start;
}
.pp-card {
  position:relative; border-radius:12px; overflow:hidden;
  cursor:pointer; user-select:none;
  background: linear-gradient(180deg, rgba(27,33,58,.96) 0%, rgba(15,19,33,.96) 100%);
  border:1px solid rgba(130,160,255,.18);
  transition: border-color .2s, box-shadow .2s, transform .15s;
}
.pp-card:hover { border-color: rgba(130,160,255,.5); transform: translateY(-2px); }
.pp-card.sel {
  border-color: rgba(130,195,255,.7);
  box-shadow: 0 0 0 1px rgba(130,195,255,.4), 0 0 18px rgba(61,147,255,.4);
}
.pp-card img, .pp-card .ppc-noimg {
  width:100%; aspect-ratio:1; object-fit:cover; display:block;
  background:#131a2e;
}
.pp-card .ppc-noimg {
  display:flex; align-items:center; justify-content:center;
  color:#6a7ba8; font-size:11px;
}
.pp-card .ppc-body { padding:8px 9px 9px; }
.pp-card .ppc-name {
  font-size:12px; line-height:1.35; color:#dbe4fb;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  overflow:hidden; min-height: 2.7em;
}
.pp-card .ppc-price { font-size:11px; color:#8ea0cc; margin-top:3px; }
.pp-card .ppc-tick {
  position:absolute; top:7px; right:7px;
  width:22px; height:22px; border-radius:50%;
  background: linear-gradient(180deg,#6ea2ff,#3b73ff);
  color:#fff; font-size:12px; line-height:1;
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 0 12px rgba(61,147,255,.7);
}
.pp-empty {
  flex:1; display:flex; align-items:center; justify-content:center;
  text-align:center; padding:34px 20px;
  color:#8ea0cc; font-size:13.5px; line-height:1.6;
  border:1px dashed rgba(130,160,255,.25); border-radius:12px;
  min-height: 180px;
}
@media (max-width: 720px) {
  .pp-layout { grid-template-columns: 1fr; height:auto; min-height:0; }
  .pp-topics { flex-direction:row; overflow-x:auto; overflow-y:hidden; padding-bottom:6px; }
  .pp-topic { min-width: 190px; }
  .pp-grid { max-height: 42vh; }
}

/* ==========================================================================
   TYPOGRAPHY — consistent casing + bigger fonts everywhere.
   text-transform:capitalize makes every label display as "Preview",
   "Generator", "Store", "Keywords"… no matter how it's written in code,
   so the casing can never be inconsistent again.
   ========================================================================== */
.label, .sw-label, .pitch .cap { text-transform: capitalize; }

/* Knob + tile labels on the pedal */
.label { font-size: clamp(11px, 1.8vw, 18px); font-weight: 500; }
.wide-tile .label { font-size: clamp(10px, 1.6vw, 16px); }

/* Footswitch labels (collections / products / seasonal / …) */
.sw-label { font-size: clamp(11px, 1.8vw, 18px); font-weight: 500; }

/* Screen side meta (market / lang) */
.pitch .val { font-size: clamp(11px, 1.7vw, 16px); }
.pitch .cap { font-size: clamp(11px, 1.75vw, 17px); }

/* Brand mark */
.brand { font-size: clamp(11px, 1.6vw, 16px); }

/* Sidebar content slightly larger too */
.side-item { font-size: 15px; }
.side-store .ss-name { font-size: 14px; }
.side-store .ss-meta { font-size: 12.5px; }
.side-sec { font-size: 11.5px; }
.app-side .side-title { font-size: 16px; }

/* ==========================================================================
   "NEW TITLES" — prompt box + first-time arrow hint
   ========================================================================== */
.nt-toolbar {
  position:relative;
  display:flex; align-items:center; gap:10px;
  margin:4px 0 8px; flex-wrap:wrap;
}
.nt-toolbar .nt-promptbox { flex:1; min-width:220px; }
.nt-hint {
  /* Floats OVER the content below the button — absolute overlay, so it
     never displaces or pushes the topic cards down. */
  position:absolute; top: calc(100% + 8px); right: 0; z-index: 20;
  display:flex; justify-content:flex-end; align-items:flex-start;
  gap:6px; margin:0;
  pointer-events:none;
}
.nt-hint .guide-bubble {
  position:relative; max-width:320px; pointer-events:auto;
  box-shadow: 0 0 24px rgba(61,147,255,.35), 0 18px 44px rgba(0,0,0,.75);
}
.nt-hint .nt-arrow { width:84px; flex:0 0 auto; margin-top:-14px; }

/* ==========================================================================
   BRAND VOICE SCREEN — replaces the old market/niche/lang layout.
   Left column: short-tail keywords. Right column: long-tail keywords.
   Center: BRAND VOICE label + big glowing value + topic counter.
   Comes last in the stylesheet so it wins over the older screen styles.
   ========================================================================== */
.bv-screen {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 2%;
  padding: 3.2cqw 2.6cqw 2cqw;
  overflow: hidden;
}

/* top corner meta (market left, language right) */
.bv-screen .scr-corner {
  position: absolute;
  top: 1.4cqw;
  color: #8a94b8;
  font-size: clamp(9px, 1.15cqw, 13px);
  letter-spacing: 0.6px;
  max-width: 34%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 2;
}
.bv-screen .scr-corner.tl { left: 2.4cqw; }
.bv-screen .scr-corner.tr { right: 2.4cqw; text-align: right; }

/* keyword columns */
.bv-screen .kw-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.8cqw;
  min-width: 0;
  padding-top: 3cqw;
}
.bv-screen .kw-col.right { align-items: flex-end; text-align: right; }
.bv-screen .kw-stack {
  display: flex;
  flex-direction: column;
  gap: 0.7cqw;
  min-width: 0;
  width: 100%;
}
.bv-screen .kw-col.right .kw-stack { align-items: flex-end; }
/* Keyword item: the OUTER span is only the anchor (no overflow:hidden here,
   so the tooltip is never clipped). The INNER .kw-text does the "…"
   truncation. Font bumped up for readability. */
.bv-screen .kw-item {
  position: relative;
  cursor: default;
  max-width: 100%;
  color: #aebbe0;
  opacity: 0.9;
}
.bv-screen .kw-item .kw-text {
  display: block;
  font-size: clamp(10px, 1.4cqw, 15px);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bv-screen .kw-item:hover { color: #eaf2ff; opacity: 1; z-index: 7; }
/* Full-keyword tooltip: appears above the item on hover and WRAPS onto
   multiple lines, so the complete keyword is always fully visible. */
.bv-screen .kw-item .kw-full {
  display: none;
  position: absolute;
  bottom: calc(100% + 0.5cqw);
  left: 0;
  width: max-content;
  max-width: 42cqw;
  background: rgba(10, 16, 32, 0.97);
  border: 1px solid rgba(130, 160, 255, 0.5);
  border-radius: 0.7cqw;
  padding: 0.6cqw 1cqw;
  color: #eaf2ff;
  font-size: clamp(10px, 1.3cqw, 14px);
  letter-spacing: 0.3px;
  line-height: 1.45;
  white-space: normal;
  text-align: left;
  box-shadow: 0 0 16px rgba(61, 147, 255, 0.4), 0 8px 20px rgba(0, 0, 0, 0.55);
  z-index: 8;
  pointer-events: none;
}
/* Right column: tooltip anchors to the right edge so it opens leftwards */
.bv-screen .kw-col.right .kw-item .kw-full { left: auto; right: 0; text-align: right; }
.bv-screen .kw-item:hover .kw-full { display: block; }
/* center: brand voice */
.bv-screen .bv-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2cqw;
  min-width: 0;
  padding: 0 1cqw;
}
/* center: brand voice — styles SWAPPED: the label "Brand Voice" is now the
   big glowing cyan text, and the value (e.g. "versatile") is the small
   grey letter-spaced line under it. */
.bv-screen .bv-label {
  color: #35d6ff;
  font-family: "Avenir Next", "Futura", "Trebuchet MS", "Segoe UI", Inter, sans-serif;
  font-size: clamp(22px, 4.8cqw, 54px);
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: capitalize;
  line-height: 1.05;
  white-space: nowrap;
  text-shadow:
    0 0 14px rgba(53, 214, 255, 0.75),
    0 0 34px rgba(53, 214, 255, 0.45),
    0 0 60px rgba(53, 214, 255, 0.25);
}
.bv-screen .bv-value {
  color: #8a94b8;
  font-size: clamp(10px, 1.4cqw, 15px);
  font-weight: 400;
  letter-spacing: 4px;
  text-transform: uppercase;
  line-height: 1.2;
  max-width: 34cqw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bv-screen .bv-num {
  color: #cfd9f7;
  font-size: clamp(11px, 1.6cqw, 18px);
  font-weight: 400;
  letter-spacing: 3px;
  border: 1.5px solid rgba(190, 200, 230, 0.45);
  border-radius: 0.8cqw;
  padding: 0.3cqw 1.6cqw;
}

/* ==========================================================================
   KNOB TOUR — generic hint used for every knob on the dashboard.
   "row"          arrow left, bubble right  (top-row knobs, arrow points down)
   "row-reverse"  bubble left, arrow right  (rightmost Generate knob)
   "col"          arrow on top, bubble below (bottom-row knobs, arrow points up)
   ========================================================================== */
.knob-hint {
  position: absolute;
  z-index: 40;
  display: flex;
  align-items: flex-start;
  gap: 0.8cqw;
  pointer-events: none;
}
.knob-hint.row-reverse { flex-direction: row-reverse; }
.knob-hint.col { flex-direction: column; }
.knob-hint .kh-arrow {
  position: relative;
  width: 6cqw;
  min-width: 40px;
  flex: 0 0 auto;
}
.knob-hint .guide-bubble {
  position: relative;
  pointer-events: auto;
  max-width: min(320px, 34cqw);
  font-size: clamp(10px, 1.5cqw, 13.5px);
  padding: 1.1cqw 1.4cqw;
  border-radius: 1.4cqw;
}
.knob-hint .gb-actions .btn {
  padding: 0.6cqw 1.2cqw;
  font-size: clamp(10px, 1.4cqw, 13px);
}
`;

// ============================================================================
// Constants
// ============================================================================

// Bottom knob-row labels updated: feedback->store, left->competitor, preset/pages->calendar, right->keywords
const KNOBS: Array<{ id: string; label: string }> = [
  { id: "kFeedback", label: "store" },
  { id: "kLeft", label: "competitor" },
  { id: "kPreset", label: "calendar" },
  { id: "kRight", label: "keywords" },
];

// Maps each bottom knob id to the info-modal it should open (null = no modal, keep old behavior)
const KNOB_MODAL_MAP: Record<string, KnobModalType> = {
  kFeedback: "store",
  kLeft: "competitor",
  kPreset: "calendar",
  kRight: "keywords",
  kMod: null,
};


// Local storage key used to persist the topic -> product selection so the
// "Product" step and the "Generator" step can be done in separate visits.
const LS_KEY = "meris_lvx_topic_products_v1";
// Local storage keys for the sidebar pages
const GSC_LS_KEY = "meris_gsc_v1";
const BL_LS_KEY = "meris_backlinks_v1";

// Guided tour steps: message + where the arrow and bubble sit inside the
// portal. Positions are percentages of the portal circle, tuned to the
// star coordinates (Topics 28%/38%, Product right 8%, Blogs 50%/80%).
const TOUR_CONFIG: Record<
  Exclude<TourStep, null>,
  {
    msg: React.ReactNode;
    arrow: { left: string; top: string; rotate: number; size: number; flip?: boolean };
    bubble: { left: string; top: string };
  }
> = {
  topics: {
    msg: (
      <>
        <b>Step 1</b> — Tap the <b>Topics</b> star and choose your blog topics.
      </>
    ),
    arrow: { left: "18%", top: "46%", rotate: -65, size: 150 },
    bubble: { left: "24%", top: "64%" },
  },
  products: {
    msg: (
      <>
        <b>Step 2</b> — Then open <b>Product</b> to assign up to 2 products to
        each topic.
      </>
    ),
    arrow: { left: "54%", top: "44%", rotate: -30, size: 150 },
    bubble: { left: "30%", top: "62%" },
  },
  blogs: {
    msg: (
      <>
        <b>Step 3</b> — Your generated blogs live under <b>Blogs</b>. Edit,
        schedule or publish them from there.
      </>
    ),
    arrow: { left: "26%", top: "60%", rotate: 20, size: 140 },
    bubble: { left: "5%", top: "44%" },
  },
};

// ============================================================================
// Dashboard knob tour — one arrow + message per knob, shown in sequence
// right on the pedal. Positions are in cqw (container units of the pedal)
// so every hint scales responsively with the pedal.
//   - Top-row knobs (Preview / Generator / Generate) get a DOWN arrow whose
//     tip lands on the knob from above.
//   - Bottom-row knobs (Store / Competitor / Calendar / Keywords) get an UP
//     arrow sitting below the knob row, tip landing on the knob.
// ============================================================================

const KNOB_TOUR: Array<{
  key: string;
  msg: React.ReactNode;
  variant: "down" | "up";
  layout: "row" | "row-reverse" | "col";
  style: React.CSSProperties;
  arrowStyle?: React.CSSProperties;
}> = [
  {
    key: "preview",
    msg: (
      <>
        ✦ <b>Preview</b> — start here: pick blog topics, attach products to
        each one and generate your blogs step by step.
      </>
    ),
    variant: "down",
    layout: "row",
    style: { left: "4.5cqw", top: "0.4cqw" },
  },
  {
    key: "generator",
    msg: (
      <>
        ⚡ <b>Generator</b> — instantly writes blogs from your already-saved
        topics &amp; products. No wizard, one tap.
      </>
    ),
    variant: "down",
    layout: "row",
    style: { left: "19.5cqw", top: "0.4cqw" },
  },
  {
    key: "generate",
    msg: (
      <>
        🚀 <b>Generate</b> — creates a campaign blog from your Store,
        Competitor, Calendar and Keywords selections below.
      </>
    ),
    variant: "down",
    layout: "row-reverse",
    style: { right: "2cqw", top: "0.4cqw" },
  },
  {
    key: "store",
    msg: (
      <>
        🏬 <b>Store</b> — choose the Collections and Products your campaign
        blog should feature and link to.
      </>
    ),
    variant: "up",
    layout: "col",
    style: { left: "5cqw", top: "37.5cqw" },
    arrowStyle: { marginLeft: "6cqw" },
  },
  {
    key: "competitor",
    msg: (
      <>
        🎯 <b>Competitor</b> — pick one competitor to outrank; their site is
        analysed to angle your blog against them.
      </>
    ),
    variant: "up",
    layout: "col",
    style: { left: "27cqw", top: "37.5cqw" },
    arrowStyle: { marginLeft: "8cqw" },
  },
  {
    key: "calendar",
    msg: (
      <>
        📅 <b>Calendar</b> — tie the blog to a Seasonal, Cultural, Retail or
        Experiential moment so it lands at the right time.
      </>
    ),
    variant: "up",
    layout: "col",
    style: { left: "51cqw", top: "37.5cqw" },
    arrowStyle: { marginLeft: "8cqw" },
  },
  {
    key: "keywords",
    msg: (
      <>
        🔑 <b>Keywords</b> — select the short-tail and long-tail keywords the
        campaign blog should target.
      </>
    ),
    variant: "up",
    layout: "col",
    style: { left: "58cqw", top: "37.5cqw" },
    arrowStyle: { marginLeft: "24cqw" },
  },
];

// ============================================================================
// Helpers
// ============================================================================

const uid = (): string => Math.random().toString(36).slice(2, 9);

// ============================================================================
// Sub-components
// ============================================================================

interface VUProps {
  side: "left" | "right";
}

const VU: FC<VUProps> = ({ side }) => {
  const rows = 9;
  const cols = 4;
  const heights = side === "left" ? [6, 4, 7, 3] : [5, 8, 4, 6];
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = rows - r <= heights[c];
      dots.push(<span key={`${r}-${c}`} className={"dot" + (lit ? "" : " off")} />);
    }
  }
  return (
    <div className="vu" style={{ gridTemplateRows: `repeat(${rows},1fr)` }}>
      {dots}
    </div>
  );
};

// Animated hand-drawn arrow (motion/react): the line draws itself on,
// the head fades in, and the whole arrow bobs gently.
// Two path variants so the head is DRAWN pointing the right way — no
// fragile rotate/flip guessing:
//   "upRight"  -> head at the top-right end (used inside the portal tour)
//   "downLeft" -> head at the bottom-left end (used on the dashboard, so
//                 the tip lands straight on the preview knob)
// size accepts a number (px) or any CSS width (e.g. "100%", "12cqw") so
// the arrow can scale responsively with its container.
interface GuideArrowProps {
  variant?: "upRight" | "downLeft" | "down" | "up";
  rotate?: number;
  flip?: boolean;
  size?: number | string;
}

const ARROW_PATHS = {
  upRight: {
    viewBox: "0 0 120 70",
    line: "M6 58 C 28 58, 42 47, 52 47 C 64 47, 64 59, 55 58 C 46 57, 51 40, 70 30 C 84 22, 97 17, 107 13",
    head: "M96 7 L108 13 L98 24",
  },
  downLeft: {
    viewBox: "0 0 120 70",
    line: "M112 10 C 96 12, 82 20, 72 30 C 58 44, 66 58, 56 57 C 46 56, 52 42, 40 44 C 28 46, 18 54, 10 60",
    head: "M22 50 L8 61 L24 68",
  },
  // Vertical arrow: starts top-right, squiggles down with a loop, and the
  // head points STRAIGHT DOWN — used to land the tip on the preview knob.
  down: {
    viewBox: "0 0 70 120",
    line: "M60 8 C 60 24, 50 30, 44 40 C 36 52, 52 58, 48 66 C 44 74, 32 68, 32 80 C 32 94, 34 100, 35 108",
    head: "M24 98 L35 111 L47 98",
  },
  // Vertical arrow pointing UP — used by hints sitting BELOW the bottom
  // knob row, so the tip lands straight up on the knob above the bubble.
  up: {
    viewBox: "0 0 70 120",
    line: "M60 112 C 60 96, 50 90, 44 80 C 36 68, 52 62, 48 54 C 44 46, 32 52, 32 40 C 32 26, 34 20, 35 12",
    head: "M24 22 L35 9 L47 22",
  },
} as const;

const GuideArrow: FC<GuideArrowProps> = ({
  variant = "upRight",
  rotate = 0,
  flip = false,
  size = 120,
}) => {
  const width = typeof size === "number" ? `${size}px` : size;
  const paths = ARROW_PATHS[variant];
  return (
    <motion.div
      className="guide-arrow"
      style={{ rotate, scaleX: flip ? -1 : 1, width }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox={paths.viewBox}
        fill="none"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* squiggly line with a little loop */}
        <motion.path
          d={paths.line}
          stroke="#7fb0ff"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          style={{ filter: "drop-shadow(0 0 6px rgba(110,162,255,.75))" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.15 }}
        />
        {/* arrow head */}
        <motion.path
          d={paths.head}
          stroke="#7fb0ff"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ filter: "drop-shadow(0 0 6px rgba(110,162,255,.75))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.3 }}
        />
      </svg>
    </motion.div>
  );
};

interface CampaignKeywords {
  shortTail: string[];
  longTail: string[];
}
// ============================================================================
// Main component
// ============================================================================

const MerisLVX: FC = () => {
  // --- Panel / knob UI state ---
  const [selected, setSelected] = useState<string>("kFeedback");
  const [ox, setOx] = useState<string>("10%");
  const footRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  // --- Store data ---
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Topic wizard state ---
  const [wizOpen, setWizOpen] = useState<boolean>(false);
  const [activeStar, setActiveStar] = useState<StarKey>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selTopics, setSelTopics] = useState<Set<string>>(() => new Set());
  const [custom, setCustom] = useState<string>("");

  const [footDetail, setFootDetail] = useState<{
    type: "competitor" | "keyword";
    data: any; // competitor object or keyword array
  } | null>(null);
  const footDetailRef = useRef<HTMLDivElement>(null);
const [knobModal, setKnobModal] = useState<{
  type: "store" | "competitor" | "calendar" | "keywords";
  data?: any;
} | null>(null);
  // --- Products & topic-product mapping ---
  const [productsCache, setProductsCache] = useState<Record<string, Product>>({});
  const [productsSearchResults, setProductsSearchResults] = useState<Product[]>([]);
  const [showProductConfig, setShowProductConfig] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>("");
  const [activeTopicForProduct, setActiveTopicForProduct] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [topicProductsMap, setTopicProductsMap] = useState<Record<string, string[]>>({});
  // Collection filter for the product picker ("" = all products)
  const [pickerCollections, setPickerCollections] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const selectedCollectionRef = useRef<string>("");

    const [collectionOpen, setCollectionOpen] = useState(false);
const [productOpen, setProductOpen] = useState(false);
const [competitorModal, setCompetitorModal] = useState<StoreData["competitors"][number] | null>(null);
const [campaignCompetitorUrl, setCampaignCompetitorUrl] = useState("");

const [seasonalOpen, setSeasonalOpen] = useState(false);
const [culturalOpen, setCulturalOpen] = useState(false);
const [retailOpen, setRetailOpen] = useState(false);
const [experientialOpen, setExperientialOpen] = useState(false);
const [shortTailOpen, setShortTailOpen] = useState(false);
const [longTailOpen, setLongTailOpen] = useState(false);
  // --- Generated blogs ---
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogOpen, setBlogOpen] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
const [campaignCollections, setCampaignCollections] = useState<string[]>([]);
const [campaignProducts, setCampaignProducts] = useState<string[]>([]);
const [campaignKeywords, setCampaignKeywords] = useState<CampaignKeywords>({
  shortTail: [],
  longTail: [],
});
  // --- Toast ---
  const [toastMsg, setToastMsg] = useState<string>("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [campaignCalendar, setCampaignCalendar] = useState<{
  type: string;
  name: string;
  country?: string;
  date?: string;
}>({ type: "", name: "" });

  // --- Sidebar / pages state ---
  const [view, setView] = useState<AppView>("pedal");
  const [blogTab, setBlogTab] = useState<"all" | "draft" | "sched" | "pub">("all");
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState<boolean>(false);
  const [schedFor, setSchedFor] = useState<string | null>(null);
  const [schedDate, setSchedDate] = useState<string>("");
  // Edit-blog modal (opened from the Content Hub lists)
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const editRef = useRef<HTMLDivElement>(null);
  // Google Search Console
  const [gscConnected, setGscConnected] = useState<boolean>(false);
  const [gscSite, setGscSite] = useState<string>("");
  // Backlinks
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [blUrl, setBlUrl] = useState<string>("");
  const [blAnchor, setBlAnchor] = useState<string>("");
  const [blTarget, setBlTarget] = useState<string>("");

  // --- Guided tour / first-run hints ---
  // No localStorage here on purpose: the hints re-appear on every page
  // refresh. The ref only prevents the tour re-starting when the wizard
  // is opened a second time within the SAME page load.
  const [tourStep, setTourStep] = useState<TourStep>(null);
  // Dashboard knob tour: index into KNOB_TOUR, or null when hidden.
  const [knobStep, setKnobStep] = useState<number | null>(null);
  // Last step of the currently running tour section: lets each "?" button
  // play only ITS section (top row = steps 0-2, bottom row = steps 3-6).
  const [knobStop, setKnobStop] = useState<number>(KNOB_TOUR.length - 1);
  const tourShownRef = useRef<boolean>(false);
  // Spinner state while generating new topic titles
  const [refreshingTopics, setRefreshingTopics] = useState<boolean>(false);
  // Optional user prompt that guides the generated titles
  const [titlePrompt, setTitlePrompt] = useState<string>("");
  // Arrow hint pointing at the "New titles" button (first time per page load)
  const [topicsHint, setTopicsHint] = useState<boolean>(false);
  const topicsHintShownRef = useRef<boolean>(false);

  const toast = useCallback((message: string): void => {
    setToastMsg(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2200);
  }, []);

  // Load store analysis from the backend on mount.
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await ApiService.post(ApiConfig.analyzeStore);
        setStoreData(response);
        if (response?.blogTopics) {
          const loadedTopics: Topic[] = response.blogTopics.map((bt: StoreData["blogTopics"][number]) => ({
            id: uid(),
            name: bt.title,
            keyword: bt.keyword,
            intent: bt.intent,
            difficulty: bt.difficulty,
            priority: bt.priority,
          }));
          setTopics(loadedTopics);
          setSelTopics(new Set(loadedTopics.map((t) => t.id)));
        }
      } catch (err) {
        console.error("Failed to fetch store data:", err);
        toast("Error loading store data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Position the foot-row "beam" under the currently selected knob on mount.
  useEffect(() => {
    if (feedbackRef.current && footRef.current) {
      const fr = footRef.current.getBoundingClientRect();
      const tr = feedbackRef.current.getBoundingClientRect();
      const cx = tr.left + tr.width / 2 - fr.left;
      setOx(((cx / fr.width) * 100).toFixed(1) + "%");
    }
  }, []);

  // Once topics are loaded, merge in any product selection that was saved
  // locally in a previous visit (matched by topic name, since topic ids are
  // regenerated on every load).
  useEffect(() => {
    if (topics.length === 0) return;
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: Array<{ name: string; products: string[] }> };
      if (!parsed.items || !Array.isArray(parsed.items)) return;
      setTopicProductsMap((prev) => {
        const next = { ...prev };
        parsed.items!.forEach((item) => {
          const match = topics.find((t) => t.name === item.name);
          if (match) next[match.id] = item.products;
        });
        return next;
      });
    } catch (err) {
      console.error("Failed to load saved product selection:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics]);

  // Start the knob tour (arrow + message for every knob) every time the
  // dashboard finishes loading — it re-appears after every page refresh.
  useEffect(() => {
    if (!loading) {
      setKnobStop(KNOB_TOUR.length - 1);
      setKnobStep(0);
    }
  }, [loading]);

  const dismissKnobTour = useCallback((): void => {
    setKnobStep(null);
  }, []);

  const nextKnobStep = useCallback((): void => {
    setKnobStep((s) => (s === null || s >= knobStop ? null : s + 1));
  }, [knobStop]);

  // "?" on the Preview tile: plays ONLY the top-row hints
  // (Preview -> Generator -> Generate, steps 0-2).
  const toggleTopTour = useCallback((): void => {
    setKnobStep((s) => {
      if (s !== null) return null;
      setKnobStop(2);
      return 0;
    });
  }, []);

  // "?" on the bottom knob row: plays ONLY that section's hints
  // (Store -> Competitor -> Calendar -> Keywords, steps 3-6).
  const toggleBottomTour = useCallback((): void => {
    setKnobStep((s) => {
      if (s !== null) return null;
      setKnobStop(KNOB_TOUR.length - 1);
      return 3;
    });
  }, []);

  // Advance the portal tour: topics -> products -> blogs -> done
  const nextTourStep = (): void => {
    setTourStep((prev) =>
      prev === "topics" ? "products" : prev === "products" ? "blogs" : null
    );
  };

  // Show the "New titles" arrow hint the first time the Topics step opens
  // in this page load (re-appears after a refresh).
  useEffect(() => {
    if (
      wizOpen &&
      activeStar === "topics" &&
      !showProductConfig &&
      !topicsHintShownRef.current
    ) {
      setTopicsHint(true);
      topicsHintShownRef.current = true;
    }
  }, [wizOpen, activeStar, showProductConfig]);

const clickKnob = (e: MouseEvent<HTMLDivElement>, id: string): void => {
  if (selected === id) {
    setSelected("");
    return;
  }
  const tile = e.currentTarget;
  if (footRef.current) {
    const fr = footRef.current.getBoundingClientRect();
    const tr = tile.getBoundingClientRect();
    const cx = tr.left + tr.width / 2 - fr.left;
    setOx(((cx / fr.width) * 100).toFixed(1) + "%");
  }
  setSelected(id);
};

const getFootSwitches = (selectedKnob: string): FootSwitch[] => {
  switch (selectedKnob) {
    case "kFeedback":
      return [
        { label: "collections", on: true, onClick: () => setCollectionOpen(true) },
        { label: "products", on: true, onClick: () => setProductOpen(true) },
      ];
    case "kLeft":
      if (!storeData) return [];
return storeData.competitors.map((c) => ({
  label: c.name,
  on: true,
  onClick: () => setCompetitorModal(c),
}));
    case "kPreset":
      return [
        { label: "seasonal", on: true, onClick: () => setSeasonalOpen(true) },
        { label: "cultural", on: true, onClick: () => setCulturalOpen(true) },
        { label: "retail", on: true, onClick: () => setRetailOpen(true) },
        { label: "experiential", on: true, onClick: () => setExperientialOpen(true) },
      ];
    case "kRight":
      return [
        { label: "short‑tail", on: true, onClick: () => setShortTailOpen(true) },
        { label: "long‑tail", on: true, onClick: () => setLongTailOpen(true) },
      ];
    default:
      return [
        { label: "rec / overdub", on: true },
        { label: "play / stop", on: false },
        { label: "loop fx 1", on: false },
        { label: "loop fx 2", on: true },
      ];
  }
};

  const openWiz = (): void => {
    if (!storeData) {
      toast("Store data not loaded yet");
      return;
    }
    setWizOpen(true);
    setActiveStar(null);
    setShowProductConfig(false);
    setActiveTopicForProduct(null);
    // Hide the pedal knob tour, and auto-start the portal tour on the first
    // wizard open of this page load. After a refresh it auto-starts again.
    dismissKnobTour();
    if (!tourShownRef.current) {
      setTourStep("topics");
      tourShownRef.current = true;
    }
  };
  const closeWiz = (): void => {
    setWizOpen(false);
    setTourStep(null);
  };

  const toggleTopic = (id: string): void =>
    setSelTopics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      // If topic is removed, also remove its product selections
      if (!next.has(id)) {
        setTopicProductsMap((prevMap) => {
          const newMap = { ...prevMap };
          delete newMap[id];
          return newMap;
        });
      }
      return next;
    });

  const addCustomTopic = (): void => {
    const value = custom.trim();
    if (!value) return;
    const topic: Topic = { id: uid(), name: value, keyword: "", intent: "", difficulty: "", priority: 0 };
    setTopics((prev) => [...prev, topic]);
    setSelTopics((prev) => new Set(prev).add(topic.id));
    setCustom("");
  };

  const selectedTopicList = (): Topic[] => topics.filter((t) => selTopics.has(t.id));

  // Generate NEW topic titles while KEEPING everything the user selected:
  // only the unselected topics get replaced with fresh ones. Uses a
  // dedicated REFRESH_TOPICS / GENERATE_TOPICS endpoint when your
  // ApiConfig defines one, otherwise falls back to re-running analyzeStore.
  const refreshTopics = async (): Promise<void> => {
    setRefreshingTopics(true);
    try {
      const cfg: any = ApiConfig as any;
      const endpoint =
        cfg.REFRESH_TOPICS || cfg.GENERATE_TOPICS || ApiConfig.analyzeStore;
      // If the user typed a prompt, the titles are generated according to it
      const prompt = titlePrompt.trim();
      const response = await ApiService.post(
        endpoint,
        prompt ? { prompt } : undefined
      );
      const newRaw: any[] = response?.blogTopics || response?.topics || [];
      if (!newRaw.length) {
        toast("No new topics returned from the server");
        return;
      }
      setTopics((prev) => {
        // Keep the user's selected topics exactly as they are
        const kept = prev.filter((t) => selTopics.has(t.id));
        const keptNames = new Set(kept.map((t) => t.name.toLowerCase()));
        // Only bring in fresh titles that don't duplicate the kept ones
        const fresh: Topic[] = newRaw
          .map((bt: any) => ({
            id: uid(),
            name: bt.title || bt.name || "",
            keyword: bt.keyword || "",
            intent: bt.intent || "",
            difficulty: bt.difficulty || "",
            priority: bt.priority || 0,
          }))
          .filter((t) => t.name && !keptNames.has(t.name.toLowerCase()));
        return [...kept, ...fresh];
      });
      toast(
        prompt
          ? "New titles generated from your prompt — selected topics are kept"
          : selTopics.size > 0
          ? "New titles generated — your selected topics are kept"
          : "New topic titles generated"
      );
    } catch (err) {
      console.error("Failed to refresh topics:", err);
      toast("Failed to generate new topics");
    } finally {
      setRefreshingTopics(false);
    }
  };

  // Fetch products from Shopify with search query + optional collection filter
  const fetchProductsForSearch = useCallback(async (query: string, collectionId?: string) => {
    setIsSearching(true);
    try {
      const params: any = {};
      if (query) params.search = query;
      // Use the explicitly passed collection, else the currently selected one
      const col = collectionId !== undefined ? collectionId : selectedCollectionRef.current;
      if (col) params.collection = col;
      console.log("Fetching products with params:", params);
      const data = await ApiService.get(ApiConfig.PRODUCTS, params);
      const productList: Product[] = data || [];
      setProductsSearchResults(productList);
      setProductsCache((prev) => {
        const newCache = { ...prev };
        productList.forEach((p) => {
          newCache[p.id] = p;
        });
        return newCache;
      });
    } catch (err) {
      console.error("Failed to load products:", err);
      toast("Failed to load products");
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Load the store's collections for the product-picker filter chips.
  // Uses COLLECTIONS / LIST_COLLECTIONS / GET_COLLECTIONS from ApiConfig.
  const fetchPickerCollections = useCallback(async (): Promise<void> => {
    try {
      const cfg: any = ApiConfig as any;
      const endpoint = cfg.COLLECTIONS || cfg.LIST_COLLECTIONS || cfg.GET_COLLECTIONS;
      if (!endpoint) return; // no endpoint configured -> filter row stays hidden
      const data = await ApiService.get(endpoint, {});
      const raw: any[] = data?.collections || data || [];
      const list = raw
        .map((c: any) => ({
          id: c.id || c._id || "",
          title: c.title || c.name || "Untitled",
        }))
        .filter((c) => c.id);
      setPickerCollections(list);
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  }, []);

  // Pick a collection chip -> products of that collection load immediately.
  // Picking "All products" (id "") clears the filter.
  const selectCollection = (id: string): void => {
    setSelectedCollection(id);
    selectedCollectionRef.current = id;
    fetchProductsForSearch(productSearch, id);
  };

  // Debounced search handler
  const handleProductSearch = useCallback((value: string) => {
    setProductSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchProductsForSearch(value);
    }, 300);
  }, [fetchProductsForSearch]);

  // NEW: Step 1 -> Step 2 transition. Called from the Topics card's primary
  // button; moves the user straight into the Product selection step.
  const goToProductStep = (): void => {
    if (selTopics.size === 0) {
      toast("Select at least one topic first.");
      return;
    }
    setActiveStar("topics");
    setShowProductConfig(true);
    // Auto-select the first topic so the user immediately sees where
    // products will be attached — no guessing.
    const first = topics.find((t) => selTopics.has(t.id));
    setActiveTopicForProduct(first ? first.id : null);
    setProductSearch("");
    // Load the collection filter + preload products so grids aren't empty.
    if (pickerCollections.length === 0) fetchPickerCollections();
    fetchProductsForSearch("");
  };

  // Open product config view (still used by the "Product" star on the portal)
  const openProductConfig = async (): Promise<void> => {
    if (selTopics.size === 0) {
      toast("Select at least one topic first.");
      return;
    }
    setShowProductConfig(true);
    // Auto-select the first topic so products can be attached right away
    const first2 = topics.find((t) => selTopics.has(t.id));
    setActiveTopicForProduct(first2 ? first2.id : null);
    setProductSearch("");
    // Load the collection filter + preload products
    if (pickerCollections.length === 0) fetchPickerCollections();
    fetchProductsForSearch("");
  };

  // Toggle a product for a specific topic
  const toggleProductForTopic = (topicId: string, productId: string): void => {
    setTopicProductsMap((prev) => {
      const current = prev[topicId] || [];
      if (current.includes(productId)) {
        return { ...prev, [topicId]: current.filter(id => id !== productId) };
      } else {
        if (current.length >= 2) {
          toast("Maximum 2 products per topic");
          return prev;
        }
        return { ...prev, [topicId]: [...current, productId] };
      }
    });
  };

  // Step 2 -> Step 3: save the current topic -> product selection locally
  // (browser storage) so it survives page reloads, then immediately start
  // blog generation. startGeneration() closes the wizard and opens the
  // blog editor modal, so the user flows Topics -> Products -> Blogs.
  const saveProductSelectionLocally = (): void => {
    try {
      const items = selectedTopicList().map((t) => ({
        name: t.name,
        keyword: t.keyword,
        products: topicProductsMap[t.id] || [],
      }));
      window.localStorage.setItem(LS_KEY, JSON.stringify({ items, savedAt: Date.now() }));
    } catch (err) {
      console.error("Failed to save selection locally:", err);
      toast("Failed to save selection");
      return;
    }
    // Move straight to blog generation (Step 3)
    startGeneration();
  };

  // Start blog generation sequentially
  const startGeneration = async (): Promise<void> => {
    closeWiz();
    const selTopicsArr = selectedTopicList();
    if (selTopicsArr.length === 0) {
      toast("No topics selected");
      return;
    }
    setBlogs([]);
    setBlogOpen(true);
    setGenerating(true);

    toast("Generating blogs…");
    for (const topic of selTopicsArr) {
      const productIds = topicProductsMap[topic.id] || [];
      try {
        const res = await ApiService.post(ApiConfig.CREATE_BLOG, {
          topic: topic.name,
          products: productIds,
        });
        const blogData = res?.blog || res;
        let heroImg = blogData.heroImage?.url;
        // if (heroImg && heroImg.startsWith('/')) {
        //   heroImg = "http://localhost:5000" + heroImg;
        // }
        if (heroImg && heroImg.startsWith('/')) {
          heroImg = "https://hammerhead-app-7hn5u.ondigitalocean.app" + heroImg;
        }
        console.log(`Generated blog for topic "${heroImg}":`, blogData);
        if (blogData) {
          const newBlog: Blog = {
            id: blogData._id || uid(),
            topic: topic.name,
            title: blogData.title || topic.name,
            html: blogData.content || "",
            status: "none",
            heroImageUrl: heroImg,
            heroImagePrompt: blogData.heroImagePrompt,
          };
          setBlogs((prev) => [...prev, newBlog]);
        }
      } catch (err) {
        console.error(`Failed to generate blog for topic "${topic.name}":`, err);
        toast(`Error generating blog for "${topic.name}"`);
        // Still continue with next topics
      }
    }
    setGenerating(false);
    toast("All blogs generated!");
  };

  // Entry point for the "generator" knob: does NOT open the wizard, just
  // uses whatever topics/products are currently selected (including
  // anything restored from local storage) and kicks off generation directly.
  const handleGeneratorClick = (): void => {
    if (!storeData) {
      toast("Store data not loaded yet");
      return;
    }
    if (selTopics.size === 0) {
      toast("Select topics first (tap preview)");
      return;
    }
    startGeneration();
  };

  // ==========================================================================
  // Sidebar pages: Content Hub / Google Console / Backlinks
  // ==========================================================================

  // Load all blogs for the Content Hub. Uses a LIST endpoint if your
  // ApiConfig defines one (LIST_BLOGS / GET_BLOGS / BLOGS); otherwise falls
  // back to the blogs generated in this session.
  const loadAllBlogs = useCallback(async (): Promise<void> => {
    setLoadingBlogs(true);
    try {
      const cfg: any = ApiConfig as any;
      const endpoint = cfg.LIST_BLOGS || cfg.GET_BLOGS || cfg.BLOGS;
      if (endpoint) {
        const data = await ApiService.get(endpoint, {});
        const rawList: any[] = data?.blogs || data || [];
        const list: Blog[] = rawList.map((b: any) => ({
          id: b._id || b.id || uid(),
          topic: b.topic || "",
          title: b.title || "Untitled blog",
          html: b.content || b.html || "",
          status: (b.status as BlogStatus) || "draft",
          heroImageUrl: b.heroImage?.url,
          heroImagePrompt: b.heroImagePrompt,
        }));
        // Merge in any blogs generated this session that the server
        // list does not include yet, so sidebar counts stay live.
        const merged = [...list];
        blogs.forEach((sb) => {
          if (!merged.find((m) => m.id === sb.id)) merged.unshift(sb);
        });
        setAllBlogs(merged);
      } else {
        // No list endpoint configured yet - show this session's blogs.
        setAllBlogs(blogs);
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
      setAllBlogs(blogs);
    } finally {
      setLoadingBlogs(false);
    }
  }, [blogs]);

  // Keep the sidebar & Content Hub connected to dashboard data:
  // load all blogs once store data is ready, and re-sync automatically
  // whenever new blogs are generated on the dashboard.
  useEffect(() => {
    if (!loading) loadAllBlogs();
  }, [loading, loadAllBlogs]);

  // Restore Google Console connection + backlinks from local storage on mount.
  useEffect(() => {
    try {
      const g = window.localStorage.getItem(GSC_LS_KEY);
      if (g) {
        const parsed = JSON.parse(g);
        if (parsed?.site) {
          setGscSite(parsed.site);
          setGscConnected(true);
        }
      }
      const bl = window.localStorage.getItem(BL_LS_KEY);
      if (bl) {
        const parsedBl = JSON.parse(bl);
        if (Array.isArray(parsedBl)) setBacklinks(parsedBl);
      }
    } catch (err) {
      console.error("Failed to restore sidebar data:", err);
    }
  }, []);

  // Persist backlinks whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem(BL_LS_KEY, JSON.stringify(backlinks));
    } catch {}
  }, [backlinks]);

  // Single-blog action from the Content Hub: draft / publish / schedule.
  const blogAction = async (
    blog: Blog,
    action: "draft" | "pub" | "sched",
    date?: string
  ): Promise<void> => {
    const cfg: any = ApiConfig as any;
    try {
      if (action === "draft") {
        await ApiService.post(ApiConfig.saveBlogDraft(blog.id), {
          blogId: blog.id,
          title: blog.title,
          html: blog.html,
        });
      } else if (action === "pub") {
        await ApiService.post(ApiConfig.PUBLISH_BLOG(blog.id), {
          blogId: blog.id,
          title: blog.title,
          html: blog.html,
        });
      } else {
        // Schedule needs a backend endpoint. Add e.g.
        //   SCHEDULE_BLOG: (id) => `/blogs/${id}/schedule`
        // to your ApiConfig; the payload includes scheduledAt (ISO string).
        const ep = cfg.SCHEDULE_BLOG ? cfg.SCHEDULE_BLOG(blog.id) : null;
        if (!ep) {
          toast("Add SCHEDULE_BLOG endpoint in ApiConfig to enable scheduling");
          return;
        }
        await ApiService.post(ep, {
          blogId: blog.id,
          title: blog.title,
          html: blog.html,
          scheduledAt: date,
        });
      }
      const newStatus: BlogStatus =
        action === "draft" ? "draft" : action === "pub" ? "pub" : "sched";
      setAllBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, status: newStatus } : b))
      );
      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, status: newStatus } : b))
      );
      toast(
        action === "draft"
          ? "Saved as draft"
          : action === "pub"
          ? "Blog published!"
          : "Blog scheduled!"
      );
    } catch (err) {
      console.error(`Failed to ${action} blog:`, err);
      toast("Action failed - check console");
    }
  };

  // Open the edit modal for a blog from the Content Hub list.
  const openEditBlog = (b: Blog): void => {
    setEditBlog(b);
    setEditTitle(b.title);
  };

  // Save changes made in the edit modal. Uses an UPDATE_BLOG endpoint if
  // your ApiConfig defines one, otherwise saves through saveBlogDraft.
  // Optionally publish right after saving.
  const saveEditedBlog = async (publishAfter: boolean): Promise<void> => {
    if (!editBlog) return;
    const newHtml = editRef.current ? editRef.current.innerHTML : editBlog.html;
    const newTitle = editTitle.trim() || editBlog.title;
    setSavingEdit(true);
    try {
      const cfg: any = ApiConfig as any;
      const updateEp = cfg.UPDATE_BLOG ? cfg.UPDATE_BLOG(editBlog.id) : ApiConfig.saveBlogDraft(editBlog.id);
      await ApiService.post(updateEp, {
        blogId: editBlog.id,
        title: newTitle,
        html: newHtml,
        content: newHtml,
      });
      let newStatus: BlogStatus = editBlog.status === "pub" ? "pub" : "draft";
      if (publishAfter) {
        await ApiService.post(ApiConfig.PUBLISH_BLOG(editBlog.id), {
          blogId: editBlog.id,
          title: newTitle,
          html: newHtml,
        });
        newStatus = "pub";
      }
      const apply = (b: Blog): Blog =>
        b.id === editBlog.id ? { ...b, title: newTitle, html: newHtml, status: newStatus } : b;
      setAllBlogs((prev) => prev.map(apply));
      setBlogs((prev) => prev.map(apply));
      toast(publishAfter ? "Saved & published!" : "Changes saved");
      setEditBlog(null);
    } catch (err) {
      console.error("Failed to save blog edits:", err);
      toast("Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  };

  // Connect Google Search Console. Real OAuth needs a backend route; add
  //   GSC_AUTH_URL: "/auth/google-search-console"
  // to ApiConfig (Google OAuth with scope webmasters.readonly). Until then
  // the connection is stored locally so the UI flow can be tested.
  const connectGSC = (): void => {
    const site = gscSite.trim();
    if (!site) {
      toast("Enter your site URL first");
      return;
    }
    const cfg: any = ApiConfig as any;
    if (cfg.GSC_AUTH_URL) {
      window.open(cfg.GSC_AUTH_URL, "_blank");
      toast("Finish Google sign-in in the new tab");
    } else {
      toast("Connected locally - add GSC_AUTH_URL in ApiConfig for real OAuth");
    }
    setGscConnected(true);
    try {
      window.localStorage.setItem(
        GSC_LS_KEY,
        JSON.stringify({ site, connectedAt: Date.now() })
      );
    } catch {}
  };

  const disconnectGSC = (): void => {
    setGscConnected(false);
    setGscSite("");
    try {
      window.localStorage.removeItem(GSC_LS_KEY);
    } catch {}
    toast("Google Console disconnected");
  };

  // Add / remove tracked backlinks.
  const addBacklink = (): void => {
    const url = blUrl.trim();
    if (!url) {
      toast("Enter the backlink URL");
      return;
    }
    const entry: Backlink = {
      id: uid(),
      url,
      anchor: blAnchor.trim(),
      target: blTarget.trim(),
      addedAt: Date.now(),
    };
    setBacklinks((prev) => [entry, ...prev]);
    setBlUrl("");
    setBlAnchor("");
    setBlTarget("");
    toast("Backlink added");
  };

  const removeBacklink = (id: string): void => {
    setBacklinks((prev) => prev.filter((b) => b.id !== id));
    toast("Backlink removed");
  };

  // Bulk actions for all blogs
  const bulkAction = async (action: "draft" | "pub" | "sched"): Promise<void> => {
    for (const blog of blogs) {
      try {
        const endpoint = action === "draft" ? ApiConfig.saveBlogDraft(blog.id) : ApiConfig.PUBLISH_BLOG(blog.id);
        await ApiService.post(endpoint, { blogId: blog.id, title: blog.title, html: blog.html });
        // update local status
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: action === "draft" ? "draft" : "pub" } : b))
        );
      } catch (err) {
        console.error(`Failed to ${action} blog ${blog.id}:`, err);
      }
    }
    toast(`All blogs ${action === "draft" ? "saved as draft" : action === "pub" ? "published" : "scheduled"}`);
  };

  const handleGenerateCampaign = async () => {
  // Basic validation
  if (!campaignCompetitorUrl) {
    toast("Please select a competitor URL");
    return;
  }
  if (!campaignCalendar.type || !campaignCalendar.name) {
    toast("Please fill in the calendar event");
    return;
  }

  // Build payload matching GenerateCampaignBlogDto
  const payload = {
    collections: campaignCollections,
    products: campaignProducts,
    competitorUrl: campaignCompetitorUrl,
    calendar: {
      type: campaignCalendar.type,
      name: campaignCalendar.name,
      country: campaignCalendar.country || undefined,
      date: campaignCalendar.date || undefined,
    },
    keywords: {
      shortTail: campaignKeywords.shortTail || undefined,
      longTail: campaignKeywords.longTail || undefined,
    },
  };

  setGenerating(true);
  toast("Generating campaign blog…");
  try {
    const res = await ApiService.post(ApiConfig.GENERATE_BLOGCAMPAIGN, payload);
    const blogData = res?.blog || res; // adjust depending on actual response shape

    let heroImg = blogData.heroImage?.url;
    // if (heroImg && heroImg.startsWith('/')) {
    //   heroImg = "http://localhost:5000" + heroImg;
    // }
    if (heroImg && heroImg.startsWith('/')) {
      heroImg = "https://hammerhead-app-7hn5u.ondigitalocean.app" + heroImg;
    }
    

    const newBlog: Blog = {
      id: blogData._id || uid(),
      topic: blogData.topic || campaignCalendar.name,
      title: blogData.title || "Campaign Blog",
      html: blogData.content || "",
      status: "none",
      heroImageUrl: heroImg,
      heroImagePrompt: blogData.heroImagePrompt,
    };

    setBlogs([newBlog]);   // assuming single blog returned; wrap in array
    setBlogOpen(true);
    toast("Campaign blog generated!");
  } catch (err) {
    console.error("Failed to generate campaign blog:", err);
    toast("Error generating campaign blog");
  } finally {
    setGenerating(false);
  }
};


  // ==========================================================================
  // Page renderers for the sidebar views
  // ==========================================================================

  const STATUS_BADGE: Record<BlogStatus, BlogStatusConfig> = {
    none: { cls: "b-none", label: "New" },
    draft: { cls: "b-draft", label: "Draft" },
    sched: { cls: "b-sched", label: "Scheduled" },
    pub: { cls: "b-pub", label: "Published" },
  };

  const blogCounts = {
    draft: allBlogs.filter((b) => b.status === "draft").length,
    sched: allBlogs.filter((b) => b.status === "sched").length,
    pub: allBlogs.filter((b) => b.status === "pub").length,
  };

  const filteredBlogs =
    blogTab === "all" ? allBlogs : allBlogs.filter((b) => b.status === blogTab);

  // ----- Content Hub: drafts / scheduled / published in one page -----
  const renderBlogsPage = () => (
    <div className="page">
      <h2>Content Hub</h2>
      <div className="psub">
        Manage all your blogs in one place - save drafts, schedule for later, or publish now.
      </div>
      <div className="tabbar">
        <div className={"tab" + (blogTab === "all" ? " active" : "")} onClick={() => setBlogTab("all")}>
          All ({allBlogs.length})
        </div>
        <div className={"tab" + (blogTab === "draft" ? " active" : "")} onClick={() => setBlogTab("draft")}>
          Drafts ({blogCounts.draft})
        </div>
        <div className={"tab" + (blogTab === "sched" ? " active" : "")} onClick={() => setBlogTab("sched")}>
          Scheduled ({blogCounts.sched})
        </div>
        <div className={"tab" + (blogTab === "pub" ? " active" : "")} onClick={() => setBlogTab("pub")}>
          Published ({blogCounts.pub})
        </div>
      </div>

      {loadingBlogs ? (
        <div className="empty">
          <span className="spin" /> Loading blogs…
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="empty">
          No blogs here yet. Go to the Dashboard and use <strong>preview → Topics → Products</strong> to generate blogs.
        </div>
      ) : (
        filteredBlogs.map((b) => (
          <div key={b.id} className="blog-row">
            <span className={"badge " + STATUS_BADGE[b.status || "none"].cls}>
              {STATUS_BADGE[b.status || "none"].label}
            </span>
            <span className="bt">{b.title}</span>
            <button
              type="button"
              className="abtn"
              onClick={() => openEditBlog(b)}
            >
              ✎ Edit
            </button>
            <button type="button" className="abtn" onClick={() => blogAction(b, "draft")}>
              Save Draft
            </button>
            <button
              type="button"
              className="abtn sch"
              onClick={() => {
                setSchedFor(schedFor === b.id ? null : b.id);
                setSchedDate("");
              }}
            >
              Schedule
            </button>
            <button type="button" className="abtn pub" onClick={() => blogAction(b, "pub")}>
              Publish
            </button>
            {schedFor === b.id && (
              <div className="schbox">
                <input
                  type="datetime-local"
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  style={{
                    background: "rgba(8,12,26,.85)",
                    color: "#eef2ff",
                    border: "1px solid rgba(130,160,255,.25)",
                  }}
                />
                <button
                  type="button"
                  className="abtn sch"
                  onClick={() => {
                    if (!schedDate) {
                      toast("Pick a date & time first");
                      return;
                    }
                    blogAction(b, "sched", new Date(schedDate).toISOString());
                    setSchedFor(null);
                  }}
                >
                  Confirm schedule
                </button>
              </div>
            )}
            {b.topic && <div className="bmeta">Topic: {b.topic}</div>}
          </div>
        ))
      )}
    </div>
  );

  // ----- Google Search Console -----
  const renderConsolePage = () => (
    <div className="page">
      <h2>Google Search Console</h2>
      <div className="psub">
        Connect Google Search Console to see how your blogs perform in Google Search - clicks, impressions, CTR and average position.
      </div>

      {!gscConnected ? (
        <>
          <div className="field" style={{ maxWidth: 560 }}>
            <input
              placeholder="Your site URL (e.g. https://mystore.com)"
              value={gscSite}
              onChange={(e) => setGscSite(e.target.value)}
            />
            <button type="button" className="btn btn-pri" onClick={connectGSC}>
              Connect Google Console
            </button>
          </div>
          <div className="muted">
            Real Google sign-in needs a backend OAuth route. Add{" "}
            <code>GSC_AUTH_URL</code> to your ApiConfig pointing to your server's Google OAuth endpoint
            (scope: webmasters.readonly). Until then, the connection is saved locally so you can test the flow.
          </div>
        </>
      ) : (
        <>
          <div className="muted" style={{ marginBottom: 16 }}>
            Connected site:{" "}
            <strong style={{ color: "#9cc2ff" }}>{gscSite}</strong>
            <button type="button" className="abtn" style={{ marginLeft: 12 }} onClick={disconnectGSC}>
              Disconnect
            </button>
          </div>
          <div className="gsc-stats">
            <div className="gsc-stat">
              <span className="gv">—</span>
              <span className="gl">Total clicks (28 days)</span>
            </div>
            <div className="gsc-stat">
              <span className="gv">—</span>
              <span className="gl">Total impressions</span>
            </div>
            <div className="gsc-stat">
              <span className="gv">—</span>
              <span className="gl">Average CTR</span>
            </div>
            <div className="gsc-stat">
              <span className="gv">—</span>
              <span className="gl">Average position</span>
            </div>
          </div>
          <div className="muted">
            Metrics will fill in once your backend exposes a <code>GSC_STATS</code> endpoint that
            proxies the Search Console API for the connected site.
          </div>
        </>
      )}
    </div>
  );

  // ----- Backlinks -----
  const renderBacklinksPage = () => (
    <div className="page">
      <h2>Backlinks</h2>
      <div className="psub">
        Track backlinks pointing to your store and blogs. Add links you have built or discovered.
      </div>

      <div className="field" style={{ flexWrap: "wrap", gap: 8 }}>
        <input
          placeholder="Backlink URL (e.g. https://partner-site.com/article)"
          value={blUrl}
          onChange={(e) => setBlUrl(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <input
          placeholder="Anchor text (optional)"
          value={blAnchor}
          onChange={(e) => setBlAnchor(e.target.value)}
          style={{ minWidth: 180 }}
        />
        <input
          placeholder="Target page on your store (optional)"
          value={blTarget}
          onChange={(e) => setBlTarget(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <button type="button" className="btn btn-pri" onClick={addBacklink}>
          + Add backlink
        </button>
      </div>

      {backlinks.length === 0 ? (
        <div className="empty">No backlinks tracked yet. Add your first one above.</div>
      ) : (
        <table className="bl-table">
          <thead>
            <tr>
              <th>Backlink URL</th>
              <th>Anchor text</th>
              <th>Target page</th>
              <th>Added</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {backlinks.map((b) => (
              <tr key={b.id}>
                <td>
                  <a href={b.url} target="_blank" rel="noreferrer" style={{ color: "#9cc2ff" }}>
                    {b.url}
                  </a>
                </td>
                <td>{b.anchor || "—"}</td>
                <td>{b.target || "—"}</td>
                <td>{new Date(b.addedAt).toLocaleDateString()}</td>
                <td>
                  <button type="button" className="abtn" onClick={() => removeBacklink(b.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="muted" style={{ marginTop: 14 }}>
        Tip: for automatic backlink discovery, connect Google Search Console above (Links report) or add a
        <code> BACKLINKS</code> endpoint in ApiConfig that proxies an SEO API (Ahrefs / Semrush / Moz).
      </div>
    </div>
  );

if (loading) {
  return (
    <>
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
        .space-loader {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 50% 40%, #0b0e1a 0%, #05070e 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          z-index: 9999;
        }
        .loader-portal {
          position: relative;
          width: 220px;
          height: 220px;
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
        .loader-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .star-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #ffffff;
          border-radius: 50%;
          animation: twinkle 2s ease-in-out infinite alternate;
        }
        .star-dot:nth-child(1) { left: 10%; top: 15%; animation-delay: 0.2s; width: 4px; height: 4px; }
        .star-dot:nth-child(2) { left: 85%; top: 25%; animation-delay: 0.8s; }
        .star-dot:nth-child(3) { left: 20%; top: 75%; animation-delay: 1.2s; width: 5px; height: 5px; }
        .star-dot:nth-child(4) { left: 70%; top: 80%; animation-delay: 0.5s; }
        .star-dot:nth-child(5) { left: 45%; top: 10%; animation-delay: 1.8s; width: 3px; height: 3px; }
        .star-dot:nth-child(6) { left: 5%; top: 50%; animation-delay: 0.1s; width: 2px; height: 2px; }
        .star-dot:nth-child(7) { left: 92%; top: 55%; animation-delay: 1.5s; width: 4px; height: 4px; }
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
          animation: twinkle 2.4s ease-in-out infinite;
        }
      `}</style>
      <div className="space-loader">
        <div className="loader-portal">
          {/* Rings */}
          <div className="loader-ring r1" />
          <div className="loader-ring r2" />
          <div className="loader-ring r3" />
          <div className="loader-ring r4" />
          {/* Core */}
          <div className="loader-core" />
          {/* Stars */}
          <div className="loader-stars">
            <div className="star-dot" />
            <div className="star-dot" />
            <div className="star-dot" />
            <div className="star-dot" />
            <div className="star-dot" />
            <div className="star-dot" />
            <div className="star-dot" />
          </div>
          {/* Label */}
          <div className="loader-text">Loading</div>
        </div>
      </div>
    </>
  );
}

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lvx-root">
        {/* ===== Sidebar navigation ===== */}
        <aside className="app-side">
          <div className="side-title">
            <span className="sdot" /> Blog Studio
          </div>
          {storeData && (
            <div className="side-store">
              <div className="ss-name">{storeData.shopDomain || "My store"}</div>
              <div className="ss-meta">{(storeData.niche || "").slice(0, 48)}</div>
              <div className="ss-meta">
                Market: {storeData.primaryMarket || "—"} · Topics: {topics.length}
              </div>
            </div>
          )}
          <div
            className={"side-item" + (view === "pedal" ? " active" : "")}
            onClick={() => setView("pedal")}
          >
            🎛️ Dashboard
          </div>
          <div className="side-sec">Content</div>
          <div
            className={"side-item" + (view === "blogs" && blogTab === "all" ? " active" : "")}
            onClick={() => {
              setView("blogs");
              setBlogTab("all");
            }}
          >
            📝 Content Hub <span className="cnt">{allBlogs.length}</span>
          </div>
          <div
            className={"side-item" + (view === "blogs" && blogTab === "draft" ? " active" : "")}
            onClick={() => {
              setView("blogs");
              setBlogTab("draft");
            }}
          >
            Draft blogs <span className="cnt">{allBlogs.filter((b) => b.status === "draft").length}</span>
          </div>
          <div
            className={"side-item" + (view === "blogs" && blogTab === "sched" ? " active" : "")}
            onClick={() => {
              setView("blogs");
              setBlogTab("sched");
            }}
          >
            Scheduled blogs <span className="cnt">{allBlogs.filter((b) => b.status === "sched").length}</span>
          </div>
          <div
            className={"side-item" + (view === "blogs" && blogTab === "pub" ? " active" : "")}
            onClick={() => {
              setView("blogs");
              setBlogTab("pub");
            }}
          >
            Published blogs <span className="cnt">{allBlogs.filter((b) => b.status === "pub").length}</span>
          </div>
          <div className="side-sec">SEO Tools</div>
          <div
            className={"side-item" + (view === "console" ? " active" : "")}
            onClick={() => setView("console")}
          >
            🔍 Google Console {gscConnected && <span className="cnt">✓</span>}
          </div>
          <div
            className={"side-item" + (view === "backlinks" ? " active" : "")}
            onClick={() => setView("backlinks")}
          >
            🔗 Backlinks <span className="cnt">{backlinks.length}</span>
          </div>
        </aside>

        {/* ===== Main area: pedal dashboard or a sidebar page ===== */}
        <div className="app-main">
        {view === "pedal" && (
        <div className="stage">
          <div className="pedal">
            {/* Knob tour: an arrow + message for EVERY knob, shown one at a
                time. Top-row knobs get a down-arrow from above; bottom-row
                knobs get an up-arrow from below the knob row. */}
            <AnimatePresence mode="wait">
              {knobStep !== null && KNOB_TOUR[knobStep] && (
                <motion.div
                  key={KNOB_TOUR[knobStep].key}
                  className={"knob-hint " + KNOB_TOUR[knobStep].layout}
                  style={KNOB_TOUR[knobStep].style}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div
                    className="guide-anchor kh-arrow"
                    style={KNOB_TOUR[knobStep].arrowStyle}
                  >
                    <GuideArrow
                      variant={KNOB_TOUR[knobStep].variant}
                      size="100%"
                    />
                  </div>
                  <div className="guide-bubble">
                    {KNOB_TOUR[knobStep].msg}
                    <div className="gb-actions">
                      <button
                        type="button"
                        className="btn btn-gho btn-sm"
                        onClick={dismissKnobTour}
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        className="btn btn-pri btn-sm"
                        onClick={nextKnobStep}
                      >
                        {knobStep >= knobStop ? "Got it ✓" : "Next →"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="panel-grid">
              <div className="knob-panel">
                <div className="head-row">
                  {/* Wide tile: preview opens topic selection, generator triggers blog generation directly */}
                  <div className="face tile wide-tile">
                    {/* Tiny "?" in this section: shows the hint again, no refresh needed */}
                    <motion.button
                      type="button"
                      className="hint-replay"
                      title="Show help"
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopTour();
                      }}
                    >
                      ?
                    </motion.button>
                    <div className="duo">
                      <div className="knob-unit" style={{ cursor: "pointer" }} onClick={openWiz}>
                        <div className="knob white" id="kPreview">
                          <div className="pointer" />
                        </div>
                        <span className="label">preview</span>
                      </div>
                      <div className="knob-unit" style={{ cursor: "pointer" }} onClick={handleGeneratorClick}>
                        <div className="knob white" id="kGenerator">
                          <div className="pointer" />
                        </div>
                        <span className="label">generator</span>
                      </div>
                    </div>
                  </div>

                  {/* Screen — Brand Voice + keyword stacks */}
                  <div className="screen bv-screen">
                    {/* top corner meta (market left, language right) */}
                    <div className="scr-corner tl">
                      {(storeData?.primaryMarket || "US").split("(")[0].trim()}
                    </div>
                    <div className="scr-corner tr">
                      {storeData?.language || "EN"}
                    </div>

                    {/* LEFT: short-tail keywords stacked */}
                    <div className="kw-col left">
                      <div className="kw-stack">
                        {(storeData?.shortTailKeywords || []).slice(0, 4).map((kw, i) => (
                          <span key={i} className="kw-item" title={kw}>
                            <span className="kw-text">{kw}</span>
                            <span className="kw-full">{kw}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CENTER: brand voice */}
                    <div className="bv-center">
                      <div className="bv-label">Brand Voice</div>
                      <div className="bv-value">
                        {(storeData?.brandVoice || "warm").split(/[,.;]/)[0].trim().slice(0, 18)}
                      </div>
                      <div className="bv-num">
                        {String(storeData?.blogTopics?.length || 0).padStart(2, "0")}
                      </div>
                    </div>

                    {/* RIGHT: long-tail keywords stacked */}
                    <div className="kw-col right">
                      <div className="kw-stack">
                        {(storeData?.longTailKeywords || []).slice(0, 4).map((kw, i) => (
                          <span key={i} className="kw-item" title={kw}>
                            <span className="kw-text">{kw}</span>
                            <span className="kw-full">{kw}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mix knob */}
                  <div className="face tile" onClick={handleGenerateCampaign}>
                    <div className="knob-unit">
                      <div className="knob white" id="kMix">
                        <div className="pointer" />
                      </div>
                      <span className="label">Generate</span>
                    </div>
                  </div>
                </div>

                {/* Knob row */}
                <div className="knob-row">
                  {/* "?" for THIS section: replays the Store / Competitor /
                      Calendar / Keywords hints — separate from the top one */}
                  <motion.button
                    type="button"
                    className="hint-replay"
                    title="Show help for these knobs"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBottomTour();
                    }}
                  >
                    ?
                  </motion.button>
                  {KNOBS.map((k) => (
                    <div
                      key={k.id}
                      className={"face tile" + (selected === k.id ? " selected" : "")}
                      ref={k.id === "kFeedback" ? feedbackRef : undefined}
                      onClick={(e) => clickKnob(e, k.id)}
                    >
                      <div className="knob-unit">
                        <div className="knob black" id={k.id}>
                          <div className="pointer" />
                        </div>
                        <span className="label">{k.label}</span>
                      </div>
                    </div>
                  ))}
                  <span className="arrow l">&#10216;</span>
                  <span className="arrow r">&#10217;</span>
                </div>
              </div>

              {/* Foot row */}
              <div
  className={"foot-row" + (selected ? " linked-green" : "")}
  ref={footRef}
  style={{ "--ox": ox } as React.CSSProperties}
>

  {getFootSwitches(selected).map((sw, i) => (
    <div key={i} className="fs-tile" onClick={sw.onClick} style={sw.onClick ? { cursor: "pointer" } : {}}>
      <div className="switch-unit">
        <div className={"led" + (sw.on ? " on" : "")} />
        <div className="footswitch" />
        <div className="sw-label">{sw.label}</div>
      </div>
    </div>
  ))}

  <div className="brand"> meris <span className="box">lvx</span> </div>
</div>
            </div>
          </div>
        </div>
        )}

        {view === "blogs" && renderBlogsPage()}
        {view === "console" && renderConsolePage()}
        {view === "backlinks" && renderBacklinksPage()}
        </div>
      </div>

      {collectionOpen && (
  <CollectionModal
    onClose={() => setCollectionOpen(false)}
    onSave={(ids) => setCampaignCollections(ids)}
    selectedIds={campaignCollections}
  />
)}
{productOpen && (
  <ProductModal
    onClose={() => setProductOpen(false)}
    onSave={(ids) => setCampaignProducts(ids)}
    selectedIds={campaignProducts}
    collectionIds={campaignCollections}
  />
)}
{competitorModal && (
  <CompetitorDetailModal
    competitor={competitorModal}
    isSelected={campaignCompetitorUrl === competitorModal.website}
    onSelect={(url) => setCampaignCompetitorUrl(url)}
    onClose={() => setCompetitorModal(null)}
  />
)}
{seasonalOpen && (
  <SeasonalModal
    onClose={() => setSeasonalOpen(false)}
    onSave={(data) => setCampaignCalendar(data)}
    initialData={campaignCalendar.type === "seasonal" ? campaignCalendar : undefined}
  />
)}
{culturalOpen && (
  <CulturalModal
    onClose={() => setCulturalOpen(false)}
    onSave={(data) => setCampaignCalendar(data)}
    initialData={campaignCalendar.type === "cultural" ? campaignCalendar : undefined}
  />
)}
{retailOpen && (
  <RetailModal
    onClose={() => setRetailOpen(false)}
    onSave={(data) => setCampaignCalendar(data)}
    initialData={campaignCalendar.type === "retail" ? campaignCalendar : undefined}
  />
)}
{experientialOpen && (
  <ExperientialModal
    onClose={() => setExperientialOpen(false)}
    onSave={(data) => setCampaignCalendar(data)}
    initialData={campaignCalendar.type === "experiential" ? campaignCalendar : undefined}
  />
)}
{shortTailOpen && (
  <ShortTailKeywordsModal
    onClose={() => setShortTailOpen(false)}
    onSave={(kws) => setCampaignKeywords(prev => ({ ...prev, shortTail: kws }))}
    availableKeywords={storeData?.shortTailKeywords || []}
    initialSelected={campaignKeywords.shortTail || []}
  />
)}
{longTailOpen && (
  <LongTailKeywordsModal
    onClose={() => setLongTailOpen(false)}
    onSave={(kws) => setCampaignKeywords(prev => ({ ...prev, longTail: kws }))}
    availableKeywords={storeData?.longTailKeywords || []}
    initialSelected={campaignKeywords.longTail || []}
  />
)}


      {/* Wizard overlay */}
      {wizOpen && (
        <div className="ov open">
          <div className="ov-bd" onClick={closeWiz} />
          <button type="button" className="wiz-x" onClick={closeWiz}>×</button>
          <div className="portal-wrap">
            {activeStar === null && !showProductConfig && (
              <div className="portal" id="portalHome">
                <span className="pring r1" />
                <span className="pring r2" />
                <span className="pring r3" />
                <span className="pring r4" />
                <div className="portal-core" />
                <div className="portal-hint">✦ Tap a star to explore</div>

                {/* "?" circle: replays the guided tour any time */}
                <motion.button
                  type="button"
                  className="help-fab"
                  title="Show me around"
                  onClick={() => setTourStep("topics")}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.85 }}
                >
                  ?
                </motion.button>

                {/* Guided tour: animated arrow + message per step */}
                <AnimatePresence mode="wait">
                  {tourStep && (
                    <motion.div
                      key={tourStep}
                      className="guide-layer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div
                        className="guide-anchor"
                        style={{
                          left: TOUR_CONFIG[tourStep].arrow.left,
                          top: TOUR_CONFIG[tourStep].arrow.top,
                        }}
                      >
                        <GuideArrow
                          rotate={TOUR_CONFIG[tourStep].arrow.rotate}
                          size={TOUR_CONFIG[tourStep].arrow.size}
                          flip={TOUR_CONFIG[tourStep].arrow.flip}
                        />
                      </div>
                      <motion.div
                        className="guide-bubble"
                        style={{
                          left: TOUR_CONFIG[tourStep].bubble.left,
                          top: TOUR_CONFIG[tourStep].bubble.top,
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        {TOUR_CONFIG[tourStep].msg}
                        <div className="gb-actions">
                          {tourStep !== "blogs" && (
                            <button
                              type="button"
                              className="btn btn-gho btn-sm"
                              onClick={() => setTourStep(null)}
                            >
                              Skip
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-pri btn-sm"
                            onClick={nextTourStep}
                          >
                            {tourStep === "blogs" ? "Got it ✓" : "Next →"}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  className={"pstar big" + (selTopics.size > 0 ? " done" : "")}
                  style={{ left: "28%", top: "38%" }}
                  onClick={() => setActiveStar("topics")}
                >
                  <span className="pstar-dot" />
                  <span className="pstar-label">Topics</span>
                </button>
                <button
                  type="button"
                  className={"pstar big" + (selTopics.size > 0 ? " done" : "")}
                  style={{ right: "8%", top: "38%" }}
                  onClick={() => {
                    if (selTopics.size === 0) {
                      toast("Select topics first");
                      return;
                    }
                    setActiveStar("topics");
                    openProductConfig();
                  }}
                >
                  <span className="pstar-dot" />
                  <span className="pstar-label">Product</span>
                </button>
                {/* New Blogs button */}
                <button
                  type="button"
                  className="pstar big"
                  style={{ left: "50%", top: "70%" }}
                  onClick={() => {
                    closeWiz();
                    setBlogOpen(true);
                  }}
                >
                  <span className="pstar-dot" />
                  <span className="pstar-label">Blogs</span>
                </button>
                <button
                  type="button"
                  className="portal-save"
                  onClick={() => {
                    closeWiz();
                    toast("Ready to generate blogs");
                  }}
                >
                  Save & close
                </button>
              </div>
            )}

            {activeStar === "topics" && !showProductConfig && (
              <div className="cardhost open">
                <div className="card">
                  <div className="cardtop">
                    <button type="button" className="btn btn-gho btn-sm" onClick={() => setActiveStar(null)}>
                      ✦ Stars
                    </button>
                    <h3>Blog Topics</h3>
                    {/* "?" — shows the New-titles hint again any time */}
                    <motion.button
                      type="button"
                      className="hint-replay in-card"
                      title="Show help"
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setTopicsHint((v) => !v)}
                    >
                      ?
                    </motion.button>
                  </div>
                  <div className="sub">
                    Step 1 of 3 — Select topics, then continue to product selection.
                  </div>
                  <div className="nt-toolbar">
                    <div className="product-search-box nt-promptbox">
                      <span className="search-icon">✦</span>
                      <input
                        placeholder='Optional: describe titles you want, e.g. "Diwali gift ideas"'
                        value={titlePrompt}
                        onChange={(e) => setTitlePrompt(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter" && !refreshingTopics) refreshTopics();
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-pri btn-sm"
                      onClick={refreshTopics}
                      disabled={refreshingTopics}
                    >
                      {refreshingTopics ? (
                        <>
                          <span className="spin" /> Generating…
                        </>
                      ) : (
                        <>↻ New titles</>
                      )}
                    </button>

                    {/* Floating arrow hint anchored below the New titles
                        button — overlays the content, never displaces it */}
                    <AnimatePresence>
                      {topicsHint && (
                        <motion.div
                          className="nt-hint"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <div className="guide-bubble">
                            ✦ Don't like these titles? Click <b>↻ New titles</b> to
                            generate fresh ones — or type a prompt in the box to
                            get titles about exactly what you want. Your selected
                            topics are always kept.
                            <div className="gb-actions">
                              <button
                                type="button"
                                className="btn btn-pri btn-sm"
                                onClick={() => setTopicsHint(false)}
                              >
                                Got it
                              </button>
                            </div>
                          </div>
                          <div className="guide-anchor nt-arrow" style={{ position: "relative" }}>
                            <GuideArrow variant="upRight" size="100%" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="muted" style={{ marginBottom: 10 }}>
                    Selected topics are kept when you generate new titles.
                  </div>
                  <div className="topic-grid">
                    {topics.map((t) => {
                      const on = selTopics.has(t.id);
                      return (
                        <div
                          key={t.id}
                          className={"topic-card" + (on ? " sel" : "")}
                          onClick={() => toggleTopic(t.id)}
                        >
                          <span className={"topic-check" + (on ? " on" : "")}>
                            {on ? "✓" : ""}
                          </span>
                          <span className="topic-name">{t.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="field" style={{ marginTop: 12 }}>
                    <input
                      placeholder="Add your own topic + Enter"
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") addCustomTopic();
                      }}
                    />
                    <button type="button" className="btn btn-gho" onClick={addCustomTopic}>Add</button>
                  </div>
                  <div className="wiz-foot">
                    <span className="muted">{selTopics.size} selected</span>
                    <button
                  type="button"
                      className="btn btn-pri"
                      disabled={selTopics.size === 0}
                      onClick={goToProductStep}
                    >
                      Next — Select Products →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Product configuration view – Step 2 of the sequential flow.
                "Save & Generate" persists the selection locally and then
                immediately starts blog generation (Step 3), which closes the
                wizard and opens the blog editor modal. */}
            {activeStar === "topics" && showProductConfig && (
              <div className="cardhost open w-full h-full">
                <div className="card">
                  <div className="cardtop">
                    <button type="button" className="btn btn-gho btn-sm" onClick={() => setShowProductConfig(false)}>
                      ← Back to Topics
                    </button>
                    <h3>Select Products (max 2 per topic)</h3>
                  </div>
                  <div className="sub">
                    Step 2 of 3 — Optional: attach up to 2 products to each blog.
                  </div>
                  <div className="pp-hintbar">
                    <span className="pp-step">
                      <span className="pp-stepnum">1</span> Pick a topic on the left
                    </span>
                    <span className="pp-step">
                      <span className="pp-stepnum">2</span> Tap products to attach (max 2)
                    </span>
                    <span className="pp-step">
                      <span className="pp-stepnum">3</span> Hit Generate when you're done
                    </span>
                  </div>
                  <div className="pp-why">
                    <span>💡</span>
                    <span>
                      <b>Why select products?</b> We place the product links
                      inside your blog content — so readers can click straight
                      through from the blog to buy them in your store.
                    </span>
                  </div>
                  <div className="pp-layout">
                    {/* LEFT: the selected topics — click one to attach products to it */}
                    <div className="pp-topics">
                      {selectedTopicList().map((topic) => {
                        const chosen = topicProductsMap[topic.id] || [];
                        const active = activeTopicForProduct === topic.id;
                        return (
                          <div
                            key={topic.id}
                            className={"pp-topic" + (active ? " active" : "")}
                            onClick={() => setActiveTopicForProduct(topic.id)}
                          >
                            <div className="ppt-name">{topic.name}</div>
                            <div className="ppt-count">
                              {chosen.length === 0 ? (
                                "No products yet"
                              ) : (
                                <span className={chosen.length === 2 ? "done" : ""}>
                                  {chosen.length}/2 products{chosen.length === 2 ? " ✓" : ""}
                                </span>
                              )}
                            </div>
                            {chosen.length > 0 && (
                              <div className="ppt-thumbs">
                                {chosen.map((prodId) => {
                                  const prod = productsCache[prodId];
                                  if (!prod) return null;
                                  return prod.image ? (
                                    <img key={prodId} src={prod.image} alt={prod.title} />
                                  ) : (
                                    <span key={prodId} className="ppt-chip">{prod.title}</span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* RIGHT: collection filter + search + product grid */}
                    <div className="pp-products">
                      {pickerCollections.length > 0 && (
                        <div className="pp-collections">
                          <span className="ppc-label">Collection:</span>
                          <div className="pp-colrow">
                            <div
                              className={"chip" + (!selectedCollection ? " sel" : "")}
                              onClick={() => selectCollection("")}
                            >
                              All products
                            </div>
                            {pickerCollections.map((c) => (
                              <div
                                key={c.id}
                                className={"chip" + (selectedCollection === c.id ? " sel" : "")}
                                onClick={() => selectCollection(c.id)}
                              >
                                {c.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="product-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder={
                            activeTopicForProduct
                              ? "Search products…"
                              : "Pick a topic on the left first"
                          }
                          value={productSearch}
                          disabled={!activeTopicForProduct}
                          onChange={(e) => handleProductSearch(e.target.value)}
                        />
                        {isSearching && <span className="loading-spinner spin" />}
                      </div>

                      {!activeTopicForProduct ? (
                        <div className="pp-empty">
                          👈 Pick a topic on the left to start
                          <br />
                          attaching products to it
                        </div>
                      ) : productsSearchResults.length === 0 && !isSearching ? (
                        <div className="pp-empty">
                          No products found.
                          <br />
                          Try a different search — or just skip this step,
                          products are optional.
                        </div>
                      ) : (
                        <div className="pp-grid">
                          {productsSearchResults.map((prod) => {
                            const chosen =
                              (topicProductsMap[activeTopicForProduct] || []).includes(prod.id);
                            return (
                              <div
                                key={prod.id}
                                className={"pp-card" + (chosen ? " sel" : "")}
                                onClick={() =>
                                  toggleProductForTopic(activeTopicForProduct, prod.id)
                                }
                              >
                                {chosen && <span className="ppc-tick">✓</span>}
                                {prod.image ? (
                                  <img src={prod.image} alt={prod.title} />
                                ) : (
                                  <div className="ppc-noimg">No image</div>
                                )}
                                <div className="ppc-body">
                                  <div className="ppc-name">{prod.title}</div>
                                  <div className="ppc-price">
                                    {prod.price} {prod.currency}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="wiz-foot">
                    <span className="muted">{selectedTopicList().length} topics configured</span>
                    <button type="button" className="btn btn-pri" onClick={saveProductSelectionLocally}>
                      Save &amp; Generate Blogs →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeStar === "products" && storeData && (
              <div className="cardhost open">
                <div className="card">
                  <div className="cardtop">
                    <button type="button" className="btn btn-gho btn-sm" onClick={() => setActiveStar(null)}>
                      ✦ Stars
                    </button>
                    <h3>Store Overview</h3>
                  </div>
                  <div className="sub">Key information from your store analysis.</div>
                  <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <p><strong>Niche:</strong> {storeData.niche}</p>
                    <p><strong>Business Summary:</strong> {storeData.businessSummary}</p>
                    <p><strong>Target Audience:</strong> {storeData.targetAudience}</p>
                    <p><strong>Brand Voice:</strong> {storeData.brandVoice}</p>
                    <p><strong>Primary Market:</strong> {storeData.primaryMarket}</p>
                    <p><strong>Short-tail Keywords:</strong> {storeData.shortTailKeywords.join(", ")}</p>
                    <p><strong>Long-tail Keywords:</strong> {storeData.longTailKeywords.join(", ")}</p>
                    <p><strong>Customer Pain Points:</strong> {storeData.customerPainPoints.join("; ")}</p>
                    <p><strong>Customer Goals:</strong> {storeData.customerGoals.join("; ")}</p>
                    <p><strong>FAQ Ideas:</strong> {storeData.faqIdeas.join("; ")}</p>
                    <p><strong>SEO Suggestions:</strong> {storeData.seoSuggestions.join("; ")}</p>
                  </div>
                  <div className="wiz-foot">
                    <span />
                    <button type="button" className="btn btn-pri" onClick={() => setActiveStar(null)}>
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeStar === "collection" && storeData && (
              <div className="cardhost open">
                <div className="card">
                  <div className="cardtop">
                    <button type="button" className="btn btn-gho btn-sm" onClick={() => setActiveStar(null)}>
                      ✦ Stars
                    </button>
                    <h3>Content Pillars</h3>
                  </div>
                  <div className="sub">
                    Recommended content pillars from AI analysis.
                  </div>
                  <div className="chips">
                    {storeData.contentPillars.map((pillar, idx) => (
                      <div key={idx} className="chip sel">
                        {pillar}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <p><strong>AI Recommendations:</strong></p>
                    <ul style={{ color: "#cdd7f5", paddingLeft: "1.2rem" }}>
                      {storeData.aiRecommendations.map((rec, i) => (
                        <li key={i} style={{ marginBottom: "0.5rem" }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="wiz-foot">
                    <span />
                    <button type="button" className="btn btn-pri" onClick={() => setActiveStar(null)}>
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {blogOpen && (
        <BlogEditorModal
          blogs={blogs}
          generating={generating}
          onClose={() => setBlogOpen(false)}
          toast={toast}
        />
      )}
      {/* {blogOpen && (
  <BlogEditorModal
    blogs={blogs}
    generating={generating}
    onClose={() => setBlogOpen(false)}
    toast={toast}
  />
)} */}

      {/* ===== Edit blog modal (opened from Content Hub) ===== */}
      {editBlog && (
        <div className="ov open">
          <div className="ov-bd" onClick={() => setEditBlog(null)} />
          <div className="blogwrap">
            <div className="blog-head">
              <h2>Edit Blog</h2>
              <button
                type="button"
                className="abtn"
                onClick={() => setEditBlog(null)}
              >
                ✕ Close
              </button>
            </div>
            <div className="blog-body">
              <div className="blogcard">
                <div className="bc-top">
                  <input
                    className="bc-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Blog title"
                    style={{ width: "70%" }}
                  />
                  <span className={"badge " + STATUS_BADGE[editBlog.status || "none"].cls}>
                    {STATUS_BADGE[editBlog.status || "none"].label}
                  </span>
                </div>
                {editBlog.heroImageUrl && (
                  <img
                    src={editBlog.heroImageUrl}
                    alt="Hero"
                    style={{ width: "100%", maxHeight: 220, objectFit: "cover" }}
                  />
                )}
                <div
                  className="editor"
                  contentEditable
                  suppressContentEditableWarning
                  ref={editRef}
                  dangerouslySetInnerHTML={{ __html: editBlog.html }}
                />
                <div className="bc-actions">
                  <button
                    type="button"
                    className="abtn"
                    disabled={savingEdit}
                    onClick={() => saveEditedBlog(false)}
                  >
                    {savingEdit && <span className="spin" />}
                    💾 Save changes
                  </button>
                  <button
                    type="button"
                    className="abtn pub"
                    disabled={savingEdit}
                    onClick={() => saveEditedBlog(true)}
                  >
                    {savingEdit && <span className="spin" />}
                    🚀 Save &amp; Publish
                  </button>
                  <button
                    type="button"
                    className="abtn"
                    disabled={savingEdit}
                    onClick={() => setEditBlog(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={"toast" + (toastMsg ? " show" : "")}>{toastMsg}</div>
    </>
  );
};

export default MerisLVX;