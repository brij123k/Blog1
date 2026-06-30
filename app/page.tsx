"use client";

import React, { useState, useRef, useEffect, FC, KeyboardEvent, MouseEvent } from "react";

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

  .stage {
    width: min(1000px, 92vw);
  }
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
    grid-template-columns: repeat(5, 1fr);
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
  .logo {
    margin-bottom: 2px;
    line-height: 0;
  }
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

  .topicblk { border:1px solid rgba(130,160,255,.16); border-radius:12px; padding:12px; margin-bottom:12px; background:rgba(10,14,30,.5); }
  .topicblk h4 { font-size:14.5px; margin-bottom:8px; color:#dbe4ff; }
  .plist { display:flex; flex-wrap:wrap; gap:7px; margin-top:8px; }
  .pcount { font-size:12px; color:#9fb0d8; margin-left:6px; }

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
  .cardhost .topicblk { padding:18px; border-radius:14px; margin-bottom:16px; }
  .cardhost .topicblk h4 { font-size:17px; margin-bottom:10px; }
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
`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Topic {
  id: string;
  name: string;
}

interface Blog {
  id: string;
  topic: string;
  title: string;
  html: string;
}

type StarKey = "topics" | "products" | "collection" | null;
type BlogStatus = "none" | "draft" | "sched" | "pub";

interface BlogStatusConfig {
  cls: string;
  label: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLLECTION_OPTS: string[] = [
  "Best sellers",
  "New arrivals",
  "Seasonal",
  "Featured",
  "Clearance",
  "Bundles",
  "Gift guide",
  "How-to / Guides",
];

const TOPIC_FALLBACK: string[] = [
  "Buying guide essentials",
  "Top trends this season",
  "How to choose the right one",
  "Care & maintenance tips",
  "Beginner mistakes to avoid",
  "Gift ideas",
  "Behind the craft",
  "Budget vs premium",
];

const KNOBS: Array<{ id: string; label: string }> = [
  { id: "kFeedback", label: "feedback" },
  { id: "kLeft", label: "left" },
  { id: "kPreset", label: "preset / pages" },
  { id: "kRight", label: "right" },
  { id: "kMod", label: "mod" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = (): string => Math.random().toString(36).slice(2, 9);

async function callClaude(prompt: string, maxTokens: number = 1200): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error("api " + res.status);
  const data = await res.json();
  return (data.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");
}

function parseJSON<T = unknown>(t: string): T | null {
  try {
    const clean = t.replace(/```json|```/g, "").trim();
    const i = clean.search(/[\[{]/);
    return JSON.parse(clean.slice(i)) as T;
  } catch {
    return null;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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

// ─── ProductBlock ─────────────────────────────────────────────────────────────

interface ProductBlockProps {
  topic: Topic;
  chosen: string[];
  onAdd: (p: string) => void;
  onRemove: (p: string) => void;
}

const ProductBlock: FC<ProductBlockProps> = ({ topic, chosen, onAdd, onRemove }) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  const doSearch = async (): Promise<void> => {
    if (!query.trim()) return;
    setSearching(true);
    let arr: string[] | null = null;
    try {
      arr = parseJSON<string[]>(
        await callClaude(
          `For a blog about "${topic.name}", user searched "${query}". Give 6 realistic product names. Return ONLY a JSON array of strings.`,
          400
        )
      );
    } catch {
      arr = null;
    }
    if (!arr) {
      arr = [
        `${query} Pro`,
        `${query} Lite`,
        `${query} Max`,
        `${query} Classic`,
        `${query} Mini`,
        `${query} Plus`,
      ];
    }
    setResults(arr);
    setSearching(false);
  };

  return (
    <div className="topicblk">
      <h4>
        {topic.name} <span className="pcount">({chosen.length}/5)</span>
      </h4>
      <div className="field">
        <input
          className="psearch"
          placeholder="search products for this topic"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") doSearch();
          }}
        />
        <button className="btn btn-gho btn-sm" onClick={doSearch}>
          {searching ? <span className="spin" /> : "Search"}
        </button>
      </div>
      <div className="plist results">
        {results.map((p, i) => (
          <div key={i} className="chip" onClick={() => onAdd(p)}>
            {p} +
          </div>
        ))}
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        Selected:
      </div>
      <div className="plist chosen">
        {chosen.length ? (
          chosen.map((p, i) => (
            <div key={i} className="chip sel" onClick={() => onRemove(p)}>
              {p} ✕
            </div>
          ))
        ) : (
          <span className="muted">none (optional)</span>
        )}
      </div>
    </div>
  );
};

// ─── BlogCard ─────────────────────────────────────────────────────────────────

interface BlogCardProps {
  blog: Blog;
  toast: (msg: string) => void;
}

const BlogCard: FC<BlogCardProps> = ({ blog, toast }) => {
  const edRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string>(blog.title);
  const [status, setStatus] = useState<BlogStatus>("none");
  const [sched, setSched] = useState<boolean>(false);
  const [when, setWhen] = useState<string>(
    () => new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16)
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const BADGE_MAP: Record<BlogStatus, BlogStatusConfig> = {
    none: { cls: "b-none", label: "Unsaved" },
    draft: { cls: "b-draft", label: "Draft" },
    sched: { cls: "b-sched", label: "Scheduled" },
    pub: { cls: "b-pub", label: "Published ✓" },
  };

  const badge = BADGE_MAP[status];
  const getHTML = (): string => edRef.current?.innerHTML ?? blog.html;

  const onAct = async (a: string): Promise<void> => {
    const html = getHTML();
    if (a === "copy") {
      try {
        await navigator.clipboard.writeText(html);
      } catch (_) {}
      toast("Copied HTML");
    } else if (a === "dl") {
      const blob = new Blob(
        [`<!doctype html><meta charset=utf-8><title>${title}</title>\n<h1>${title}</h1>\n${html}`],
        { type: "text/html" }
      );
      const u = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = u;
      link.download =
        (title || "blog").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".html";
      link.click();
      URL.revokeObjectURL(u);
      toast("Downloaded");
    } else if (a === "draft") {
      setStatus("draft");
      toast("Saved to draft");
    } else if (a === "pub") {
      setStatus("pub");
      toast("Published");
    } else if (a === "sched") {
      setSched(true);
    }
  };

  const confirmSched = (): void => {
    if (!when) {
      toast("Pick a time");
      return;
    }
    const ts = new Date(when).getTime();
    const delay = ts - Date.now();
    setStatus("sched");
    setSched(false);
    toast("Scheduled for " + new Date(ts).toLocaleString());
    if (timerRef.current) clearTimeout(timerRef.current);
    if (delay > 0 && delay < 24 * 3600 * 1000) {
      timerRef.current = setTimeout(() => {
        setStatus("pub");
        toast("Auto-published: " + title);
      }, delay);
    }
  };

  return (
    <div className="blogcard">
      <div className="bc-top">
        <input
          className="bc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <span className="bstat">
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
        </span>
      </div>
      <div
        className="editor"
        contentEditable
        suppressContentEditableWarning
        ref={edRef}
        dangerouslySetInnerHTML={{ __html: blog.html }}
      />
      <div className="bc-actions">
        <button className="abtn" onClick={() => onAct("copy")}>
          Copy
        </button>
        <button className="abtn" onClick={() => onAct("dl")}>
          Download HTML
        </button>
        <button className="abtn" onClick={() => onAct("draft")}>
          Save draft
        </button>
        <button className="abtn sch" onClick={() => onAct("sched")}>
          Schedule
        </button>
        <button className="abtn pub" onClick={() => onAct("pub")}>
          Publish
        </button>
        {sched && (
          <div className="schbox">
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
            <button className="abtn sch" onClick={confirmSched}>
              Set
            </button>
            <button className="abtn" onClick={() => setSched(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const MerisLVX: FC = () => {
  const [selected, setSelected] = useState<string>("kFeedback");
  const [ox, setOx] = useState<string>("10%");
  const footRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedbackRef.current && footRef.current) {
      const fr = footRef.current.getBoundingClientRect();
      const tr = feedbackRef.current.getBoundingClientRect();
      const cx = tr.left + tr.width / 2 - fr.left;
      setOx(((cx / fr.width) * 100).toFixed(1) + "%");
    }
  }, []);

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

  // Wizard state
  const [wizOpen, setWizOpen] = useState<boolean>(false);
  const [activeStar, setActiveStar] = useState<StarKey>(null);
  const [store, setStore] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selTopics, setSelTopics] = useState<Set<string>>(() => new Set());
  const [products, setProducts] = useState<Record<string, string[]>>({});
  const [collection, setCollection] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [custom, setCustom] = useState<string>("");
  const [colCustom, setColCustom] = useState<string>("");

  // Blog state
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogOpen, setBlogOpen] = useState<boolean>(false);

  // Toast state
  const [toastMsg, setToastMsg] = useState<string>("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = (m: string): void => {
    setToastMsg(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2200);
  };

  const openWiz = (): void => {
    setWizOpen(true);
    setActiveStar(null);
  };
  const closeWiz = (): void => setWizOpen(false);

  const analyze = async (): Promise<void> => {
    setAnalyzing(true);
    const s = store.trim() || "a general lifestyle & gadgets store";
    let arr: string[] | null = null;
    try {
      arr = parseJSON<string[]>(
        await callClaude(
          `You are a content strategist. For this store/niche: "${s}", give 8 short blog topic ideas. Return ONLY a JSON array of short strings.`,
          500
        )
      );
    } catch {
      arr = null;
    }
    if (!arr) arr = TOPIC_FALLBACK;
    setTopics(arr.map((n) => ({ id: uid(), name: String(n) })));
    setAnalyzing(false);
  };

  const toggleTopic = (id: string): void =>
    setSelTopics((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const addCustomTopic = (): void => {
    const v = custom.trim();
    if (!v) return;
    const t: Topic = { id: uid(), name: v };
    setTopics((p) => [...p, t]);
    setSelTopics((p) => new Set(p).add(t.id));
    setCustom("");
  };

  const addProduct = (tid: string, p: string): void =>
    setProducts((prev) => {
      const cur = prev[tid] ?? [];
      if (cur.includes(p)) return prev;
      if (cur.length >= 5) {
        toast("Max 5 per topic");
        return prev;
      }
      return { ...prev, [tid]: [...cur, p] };
    });

  const removeProduct = (tid: string, p: string): void =>
    setProducts((prev) => ({
      ...prev,
      [tid]: (prev[tid] ?? []).filter((x) => x !== p),
    }));

  const setCol = (o: string): void =>
    setCollection((c) => (c === o ? "" : o));

  const addColCustom = (): void => {
    const v = colCustom.trim();
    if (!v) return;
    setCollection(v);
    setColCustom("");
  };

  const selectedTopicList = (): Topic[] =>
    topics.filter((t) => selTopics.has(t.id));

  const starDone = (n: string): boolean => {
    if (n === "topics") return selTopics.size > 0;
    if (n === "products") return Object.values(products).some((a) => a && a.length > 0);
    return !!collection;
  };

  const generate = async (): Promise<void> => {
    if (selTopics.size === 0) {
      toast("Open preview and pick topics first.");
      openWiz();
      return;
    }
    toast("Generating blogs…");
    const list = selectedTopicList();
    const out: Blog[] = [];

    for (const t of list) {
      const prods = products[t.id] ?? [];
      let obj: { title: string; html: string } | null = null;
      try {
        const pl = prods.length
          ? `Naturally feature these products: ${prods.join(", ")}.`
          : "";
        const cl = collection ? ` It is part of the "${collection}" collection.` : "";
        obj = parseJSON<{ title: string; html: string }>(
          await callClaude(
            `Write a blog post about "${t.name}". ${pl}${cl} Return ONLY JSON: {"title":"...","html":"<h2>..</h2><p>..</p>"} clean semantic HTML body, ~350-500 words.`,
            2000
          )
        );
      } catch {
        obj = null;
      }
      if (!obj) {
        obj = {
          title: t.name,
          html:
            `<h2>${t.name}</h2><p>This is a sample blog about ${t.name}.</p>` +
            (prods.length ? `<p>Featured products: ${prods.join(", ")}.</p>` : "") +
            `<p>(AI unavailable — placeholder content.)</p>`,
        };
      }
      out.push({
        id: uid(),
        topic: t.name,
        title: obj.title || t.name,
        html: obj.html || "",
      });
    }

    setBlogs(out);
    setBlogOpen(true);
  };

  const footSwitches: Array<[string, string]> = [
    ["on", "rec / overdub"],
    ["", "play / stop"],
    ["", "loop fx 1"],
    ["on", "loop fx 2"],
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lvx-root">
        <div className="stage">
          <div className="pedal">
            <div className="panel-grid">
              <div className="knob-panel">
                <div className="head-row">
                  {/* Wide tile: preview + generator */}
                  <div className="face tile wide-tile">
                    <div className="duo">
                      <div
                        className="knob-unit"
                        style={{ cursor: "pointer" }}
                        onClick={openWiz}
                      >
                        <div className="knob white" id="kPreview">
                          <div className="pointer" />
                        </div>
                        <span className="label">preview</span>
                      </div>
                      <div
                        className="knob-unit"
                        style={{ cursor: "pointer" }}
                        onClick={generate}
                      >
                        <div className="knob white" id="kGenerator">
                          <div className="pointer" />
                        </div>
                        <span className="label">generator</span>
                      </div>
                    </div>
                  </div>

                  {/* Screen */}
                  <div className="screen">
                    <div className="pitch left">
                      <VU side="left" />
                      <div className="meta">
                        <div className="val">-9m2</div>
                        <div className="cap">pitch L</div>
                      </div>
                    </div>
                    <div className="screen-center">
                      <div className="logo">
                        <svg
                          viewBox="0 0 44 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 25 V13 a8 8 0 0 1 16 0 V25"
                            stroke="#ededed"
                            strokeWidth="4.4"
                            strokeLinecap="round"
                          />
                          <path
                            d="M25 25 V13 a8 8 0 0 1 16 0 V25"
                            stroke="#ededed"
                            strokeWidth="4.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="preset-name">multi voice</div>
                      <div className="preset-num">01</div>
                    </div>
                    <div className="pitch right">
                      <VU side="right" />
                      <div className="meta">
                        <div className="val">5m2</div>
                        <div className="cap">pitch R</div>
                      </div>
                    </div>
                  </div>

                  {/* Mix knob */}
                  <div className="face tile">
                    <div className="knob-unit">
                      <div className="knob white" id="kMix">
                        <div className="pointer" />
                      </div>
                      <span className="label">mix</span>
                    </div>
                  </div>
                </div>

                {/* Knob row */}
                <div className="knob-row">
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
                <div className="connector conn1">
                  <span className="ln" />
                  bank down
                  <span className="arr">&#8594;</span>
                </div>
                <div className="connector conn2">bank up</div>
                <div className="connector conn3">
                  <span className="arr">&#8592;</span>
                  tuner
                  <span className="ln" />
                </div>
                {footSwitches.map(([on, label], i) => (
                  <div key={i} className="fs-tile">
                    <div className="switch-unit">
                      <div className={"led" + (on ? " on" : "")} />
                      <div className="footswitch" />
                      <div className="sw-label">{label}</div>
                    </div>
                  </div>
                ))}
                <div className="brand">
                  meris <span className="box">lvx</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wizard overlay */}
      {wizOpen && (
        <div className="ov open">
          <div className="ov-bd" onClick={closeWiz} />
          <button className="wiz-x" onClick={closeWiz}>
            ×
          </button>
          <div className="portal-wrap">
            {activeStar === null && (
              <div className="portal" id="portalHome">
                <span className="pring r1" />
                <span className="pring r2" />
                <span className="pring r3" />
                <span className="pring r4" />
                <div className="portal-core" />
                <div className="portal-hint">✦ Tap a star to begin</div>
                <button
                  className={"pstar big" + (starDone("topics") ? " done" : "")}
                  style={{ left: "28%", top: "38%" }}
                  onClick={() => setActiveStar("topics")}
                >
                  <span className="pstar-dot" />
                  <span className="pstar-label">Topics</span>
                </button>
                <button
                  className={"pstar big" + (starDone("products") ? " done" : "")}
                  style={{ left: "72%", top: "38%" }}
                  onClick={() => setActiveStar("products")}
                >
                  <span className="pstar-dot" />
                  <span className="pstar-label">Products</span>
                </button>
                <button
                  className={"pstar big" + (starDone("collection") ? " done" : "")}
                  style={{ left: "50%", top: "66%" }}
                  onClick={() => setActiveStar("collection")}
                >
                  <span className="pstar-dot" />
                  <span className="pstar-label">Collection type</span>
                </button>
                <button
                  className="portal-save"
                  onClick={() => {
                    closeWiz();
                    toast("Saved. Now click the generator knob.");
                  }}
                >
                  Save &amp; close
                </button>
              </div>
            )}

            {activeStar !== null && (
              <div className="cardhost open">
                {/* Topics card */}
                {activeStar === "topics" && (
                  <div className="card">
                    <div className="cardtop">
                      <button
                        className="btn btn-gho btn-sm"
                        onClick={() => setActiveStar(null)}
                      >
                        ✦ Stars
                      </button>
                      <h3>Choose topics</h3>
                    </div>
                    <div className="sub">
                      Describe your store, let AI suggest topics, then pick any. Add your own too.
                    </div>
                    <div className="field">
                      <input
                        placeholder="e.g. handmade ceramic mugs for modern kitchens"
                        value={store}
                        onChange={(e) => setStore(e.target.value)}
                      />
                      <button className="btn btn-pri" onClick={analyze}>
                        {analyzing ? <span className="spin" /> : "Analyze"}
                      </button>
                    </div>
                    <div className="chips">
                      {topics.length ? (
                        topics.map((t) => (
                          <div
                            key={t.id}
                            className={"chip" + (selTopics.has(t.id) ? " sel" : "")}
                            onClick={() => toggleTopic(t.id)}
                          >
                            {t.name}
                          </div>
                        ))
                      ) : (
                        <span className="muted">No topics yet — click Analyze.</span>
                      )}
                    </div>
                    <div className="field" style={{ marginTop: 12 }}>
                      <input
                        placeholder="add your own topic + Enter"
                        value={custom}
                        onChange={(e) => setCustom(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") addCustomTopic();
                        }}
                      />
                      <button className="btn btn-gho" onClick={addCustomTopic}>
                        Add
                      </button>
                    </div>
                    <div className="wiz-foot">
                      <span className="muted">{selTopics.size} selected</span>
                      <button
                        className="btn btn-pri"
                        onClick={() => setActiveStar("products")}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {/* Products card */}
                {activeStar === "products" &&
                  (selTopics.size === 0 ? (
                    <div className="card">
                      <div className="cardtop">
                        <button
                          className="btn btn-gho btn-sm"
                          onClick={() => setActiveStar(null)}
                        >
                          ✦ Stars
                        </button>
                        <h3>Pick products</h3>
                      </div>
                      <div className="sub">
                        Choose some topics first, then come back to add products per topic.
                      </div>
                      <div className="wiz-foot">
                        <span />
                        <button
                          className="btn btn-pri"
                          onClick={() => setActiveStar("topics")}
                        >
                          Go to topics
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div className="cardtop">
                        <button
                          className="btn btn-gho btn-sm"
                          onClick={() => setActiveStar(null)}
                        >
                          ✦ Stars
                        </button>
                        <h3>Pick products per topic</h3>
                      </div>
                      <div className="sub">
                        Search and choose up to 5 products per topic (0 is fine).
                      </div>
                      {selectedTopicList().map((t) => (
                        <ProductBlock
                          key={t.id}
                          topic={t}
                          chosen={products[t.id] ?? []}
                          onAdd={(p) => addProduct(t.id, p)}
                          onRemove={(p) => removeProduct(t.id, p)}
                        />
                      ))}
                      <div className="wiz-foot">
                        <span />
                        <button
                          className="btn btn-pri"
                          onClick={() => setActiveStar("collection")}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Collection card */}
                {activeStar === "collection" && (
                  <div className="card">
                    <div className="cardtop">
                      <button
                        className="btn btn-gho btn-sm"
                        onClick={() => setActiveStar(null)}
                      >
                        ✦ Stars
                      </button>
                      <h3>Collection type</h3>
                    </div>
                    <div className="sub">
                      Pick the type of collection these blogs belong to (or add your own).
                    </div>
                    <div className="chips">
                      {COLLECTION_OPTS.map((o) => (
                        <div
                          key={o}
                          className={"chip" + (collection === o ? " sel" : "")}
                          onClick={() => setCol(o)}
                        >
                          {o}
                        </div>
                      ))}
                    </div>
                    <div className="field" style={{ marginTop: 12 }}>
                      <input
                        placeholder="add your own type + Enter"
                        value={colCustom}
                        onChange={(e) => setColCustom(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") addColCustom();
                        }}
                      />
                      <button className="btn btn-gho" onClick={addColCustom}>
                        Add
                      </button>
                    </div>
                    <div className="wiz-foot">
                      <span className="muted">
                        {collection ? "Selected: " + collection : "none selected"}
                      </span>
                      <button
                        className="btn btn-pri"
                        onClick={() => setActiveStar(null)}
                      >
                        Done →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blogs overlay */}
      {blogOpen && (
        <div className="ov open">
          <div className="ov-bd" onClick={() => setBlogOpen(false)} />
          <div className="blogwrap">
            <div className="blog-head">
              <h2>Generated blogs</h2>
              <button className="abtn" onClick={() => setBlogOpen(false)}>
                Close
              </button>
            </div>
            <div className="blog-body">
              {blogs.map((b) => (
                <BlogCard key={b.id} blog={b} toast={toast} />
              ))}
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