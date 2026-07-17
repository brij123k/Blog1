"use client";

import React, { FC } from "react";

// ============================================================================
// CompetitorDetailModal — styled to match the Blog Studio dashboard theme.
// Drop-in replacement, same props as before:
//   competitor:  { name, website, description, strengths[], weaknesses[] }
//   isSelected:  boolean            (already chosen for the campaign?)
//   onSelect:    (url: string) => void
//   onClose:     () => void
// ============================================================================

interface Competitor {
  name: string;
  website: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

interface CompetitorDetailModalProps {
  competitor: Competitor;
  isSelected: boolean;
  onSelect: (url: string) => void;
  onClose: () => void;
}

const CSS = `
  .cd-ov {
    position: fixed; inset: 0; z-index: 1200;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .cd-bd {
    position: absolute; inset: 0;
    background: rgba(6, 8, 16, 0.72);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  @keyframes cdPop { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
  .cd-card {
    position: relative;
    width: min(94vw, 820px);
    max-height: 88vh;
    display: flex; flex-direction: column;
    background: linear-gradient(180deg, #1b2136 0%, #10141f 100%);
    border: 1px solid rgba(130, 160, 255, 0.22);
    border-radius: 18px;
    color: #e7ecfb;
    box-shadow:
      0 0 0 1px rgba(130, 160, 255, 0.1),
      0 0 60px rgba(61, 147, 255, 0.15),
      0 30px 90px rgba(0, 0, 0, 0.7);
    animation: cdPop .3s cubic-bezier(.2,.8,.2,1);
    overflow: hidden;
  }

  /* ---- header ---- */
  .cd-head {
    display: flex; align-items: center; gap: 14px;
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(130, 160, 255, 0.15);
    background: rgba(10, 14, 28, 0.5);
  }
  .cd-avatar {
    width: 46px; height: 46px; flex: 0 0 auto;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 21px; font-weight: 700; color: #fff;
    background: radial-gradient(circle at 35% 30%, #79a8ff, #2b5aa6 70%, #21478e 100%);
    box-shadow: 0 0 18px rgba(61, 147, 255, 0.45);
  }
  .cd-headtxt { min-width: 0; }
  .cd-name {
    font-size: 21px; font-weight: 700; color: #eef2ff;
    line-height: 1.2;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .cd-site {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 5px;
    font-size: 12.5px; color: #9cc2ff; text-decoration: none;
    background: rgba(110, 162, 255, 0.1);
    border: 1px solid rgba(130, 160, 255, 0.3);
    border-radius: 999px;
    padding: 3px 11px;
    max-width: 100%;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    transition: background .15s, border-color .15s;
  }
  .cd-site:hover { background: rgba(110, 162, 255, 0.2); border-color: rgba(130, 160, 255, 0.55); }
  .cd-selpill {
    margin-left: auto; flex: 0 0 auto;
    font-size: 12px; font-weight: 600;
    color: #6fe0a8;
    background: rgba(60, 200, 130, 0.14);
    border: 1px solid rgba(60, 200, 130, 0.4);
    border-radius: 999px;
    padding: 4px 12px;
    white-space: nowrap;
  }
  .cd-x {
    flex: 0 0 auto;
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(130, 160, 255, 0.35);
    background: rgba(10, 14, 28, 0.7);
    color: #cfd8f5; font-size: 17px; line-height: 1;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, border-color .15s;
  }
  .cd-x:hover { background: rgba(110, 162, 255, 0.15); border-color: rgba(130, 160, 255, 0.6); }
  .cd-head .cd-x { margin-left: 10px; }

  /* ---- body ---- */
  .cd-body {
    padding: 18px 24px;
    overflow-y: auto;
    display: flex; flex-direction: column; gap: 16px;
  }
  .cd-body::-webkit-scrollbar { width: 6px; }
  .cd-body::-webkit-scrollbar-thumb { background: rgba(130, 160, 255, 0.25); border-radius: 6px; }

  .cd-sec-label {
    font-size: 11px; font-weight: 600;
    letter-spacing: 1.6px; text-transform: uppercase;
    color: #7386b3;
    margin-bottom: 8px;
  }
  .cd-desc {
    font-size: 14px; line-height: 1.65; color: #cdd7f5;
    background: rgba(8, 12, 26, 0.55);
    border: 1px solid rgba(130, 160, 255, 0.16);
    border-radius: 12px;
    padding: 13px 15px;
  }

  /* strengths / weaknesses columns */
  .cd-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 640px) { .cd-cols { grid-template-columns: 1fr; } }
  .cd-col {
    border-radius: 12px;
    padding: 13px 15px;
    border: 1px solid;
  }
  .cd-col.good {
    background: rgba(60, 200, 130, 0.07);
    border-color: rgba(60, 200, 130, 0.28);
  }
  .cd-col.bad {
    background: rgba(255, 170, 70, 0.06);
    border-color: rgba(255, 170, 70, 0.26);
  }
  .cd-col .cd-col-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 13.5px; font-weight: 600;
    margin-bottom: 10px;
  }
  .cd-col.good .cd-col-title { color: #6fe0a8; }
  .cd-col.bad .cd-col-title { color: #ffce7a; }
  .cd-item {
    display: flex; align-items: flex-start; gap: 9px;
    font-size: 13px; line-height: 1.55; color: #dbe4fb;
    padding: 6px 0;
  }
  .cd-item + .cd-item { border-top: 1px dashed rgba(130, 160, 255, 0.12); }
  .cd-item .cd-dot {
    flex: 0 0 auto; margin-top: 2px;
    width: 17px; height: 17px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; line-height: 1; color: #fff;
  }
  .cd-col.good .cd-dot { background: rgba(60, 200, 130, 0.85); box-shadow: 0 0 8px rgba(60, 200, 130, 0.5); }
  .cd-col.bad .cd-dot { background: rgba(255, 170, 70, 0.85); box-shadow: 0 0 8px rgba(255, 170, 70, 0.45); }

  /* ---- footer: select-for-campaign + close ---- */
  .cd-foot {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    padding: 14px 24px;
    border-top: 1px solid rgba(130, 160, 255, 0.15);
    background: rgba(8, 12, 26, 0.55);
  }
  .cd-use {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 16px;
    border-radius: 12px;
    cursor: pointer; user-select: none;
    font-size: 13.5px; font-weight: 500; color: #cfd8f5;
    background: rgba(27, 33, 58, 0.9);
    border: 1px solid rgba(130, 160, 255, 0.25);
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .cd-use:hover { border-color: rgba(130, 160, 255, 0.55); }
  .cd-use.on {
    color: #fff;
    background: linear-gradient(180deg, rgba(110, 162, 255, 0.25), rgba(59, 115, 255, 0.2));
    border-color: rgba(130, 195, 255, 0.65);
    box-shadow: 0 0 0 1px rgba(130, 195, 255, 0.35), 0 0 18px rgba(61, 147, 255, 0.45);
  }
  .cd-check {
    width: 19px; height: 19px; flex: 0 0 auto;
    border-radius: 6px;
    border: 1.5px solid rgba(130, 160, 255, 0.5);
    background: rgba(8, 12, 26, 0.85);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 12px; line-height: 1;
    transition: background .2s, border-color .2s, box-shadow .2s;
  }
  .cd-use.on .cd-check {
    background: linear-gradient(180deg, #6ea2ff, #3b73ff);
    border-color: transparent;
    box-shadow: 0 0 10px rgba(61, 147, 255, 0.7);
  }
  .cd-btn {
    margin-left: auto;
    border: none; border-radius: 10px;
    padding: 10px 20px;
    font: inherit; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: .15s;
    background: linear-gradient(180deg, #6ea2ff, #3b73ff);
    color: #fff;
    box-shadow: 0 0 14px rgba(61, 147, 255, 0.35);
  }
  .cd-btn:hover { filter: brightness(1.08); }
`;

const CompetitorDetailModal: FC<CompetitorDetailModalProps> = ({
  competitor,
  isSelected,
  onSelect,
  onClose,
}) => {
  const initial = (competitor.name || "?").trim().charAt(0).toUpperCase();

  // Toggle: select this competitor for the campaign, or unselect it.
  const toggleUse = (): void => {
    onSelect(isSelected ? "" : competitor.website);
  };

  return (
    <div className="cd-ov">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cd-bd" onClick={onClose} />
      <div className="cd-card">
        {/* Header */}
        <div className="cd-head">
          <div className="cd-avatar">{initial}</div>
          <div className="cd-headtxt">
            <div className="cd-name">{competitor.name}</div>
            <a
              className="cd-site"
              href={competitor.website}
              target="_blank"
              rel="noreferrer"
            >
              🔗 {competitor.website}
            </a>
          </div>
          {isSelected && <span className="cd-selpill">✓ In campaign</span>}
          <button type="button" className="cd-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="cd-body">
          <div>
            <div className="cd-sec-label">About</div>
            <div className="cd-desc">{competitor.description}</div>
          </div>

          <div className="cd-cols">
            <div className="cd-col good">
              <div className="cd-col-title">💪 Strengths</div>
              {(competitor.strengths || []).map((s, i) => (
                <div key={i} className="cd-item">
                  <span className="cd-dot">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="cd-col bad">
              <div className="cd-col-title">⚠️ Weaknesses</div>
              {(competitor.weaknesses || []).map((w, i) => (
                <div key={i} className="cd-item">
                  <span className="cd-dot">!</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cd-foot">
          <div
            className={"cd-use" + (isSelected ? " on" : "")}
            onClick={toggleUse}
          >
            <span className="cd-check">{isSelected ? "✓" : ""}</span>
            {isSelected
              ? "Selected for the campaign"
              : "Use this competitor for the campaign"}
          </div>
          <button type="button" className="cd-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompetitorDetailModal;