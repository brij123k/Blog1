import React, { useState } from "react";

/* ============================================================
   Footswitch — a single, standalone button component.
   Just the button: LED + metal switch + label, with a
   toggle state. No pedal body, no other controls.

   Props:
     • label      → text under the switch (default "footswitch")
     • defaultOn  → start lit/active            (default false)
     • onToggle   → callback(isOn) when tapped  (optional)
   ============================================================ */

const CSS = `
.fsbtn{
  --led-on:#ff5a26; --led-off:#cbcdcf; --label:#54585c;
  display:inline-flex;flex-direction:column;align-items:center;gap:16px;
  position:relative;cursor:pointer;background:none;border:none;padding:0;
  font-family:'Hanken Grotesk',sans-serif;-webkit-tap-highlight-color:transparent;
}
.fsbtn .led{width:13px;height:13px;border-radius:50%;background:var(--led-off);
  box-shadow:0 0 0 1px #b6b8bb inset,0 1px 1px rgba(0,0,0,.1);transition:background .15s}
.fsbtn.on .led{background:var(--led-on);
  box-shadow:0 0 0 1px #d6400d inset,0 0 10px 1px rgba(255,90,38,.9),0 0 4px #ff7e52 inset}
.fsbtn .switch{width:96px;height:96px;border-radius:50%;position:relative;
  background:
    radial-gradient(circle at 50% 34%, rgba(255,255,255,.95), rgba(255,255,255,0) 42%),
    conic-gradient(from 0deg,#c9cccf,#f3f4f5,#bdc0c3,#eef0f1,#c4c7ca,#f4f5f6,#c0c3c6,#edeff0,#c9cccf);
  box-shadow:0 3px 2px rgba(255,255,255,.8) inset,0 -6px 11px rgba(0,0,0,.32) inset,
    0 0 0 1px #9da0a3, 0 14px 20px -10px rgba(0,0,0,.45), 0 4px 8px -4px rgba(0,0,0,.2);
  transition:transform .1s}
.fsbtn .switch::after{content:"";position:absolute;inset:21px;border-radius:50%;
  background:radial-gradient(circle at 48% 40%,#fbfbfc,#d2d5d7 65%,#b3b6b9);
  box-shadow:0 0 0 1px rgba(255,255,255,.55) inset,0 1px 3px rgba(0,0,0,.22)}
.fsbtn:active .switch{transform:translateY(2px) scale(.97)}
.fsbtn .fslabel{font-size:17px;font-weight:400;color:var(--label)}
`;

export default function Footswitch({
  label = "footswitch",
  defaultOn = false,
  onToggle,
}) {
  const [on, setOn] = useState(defaultOn);
  const toggle = () => {
    const next = !on;
    setOn(next);
    onToggle && onToggle(next);
  };
  return (
    <>
      <style>{CSS}</style>
      <button
        type="button"
        className={"fsbtn" + (on ? " on" : "")}
        aria-pressed={on}
        onClick={toggle}
      >
        <span className="led" />
        <span className="switch" />
        <span className="fslabel">{label}</span>
      </button>
    </>
  );
}