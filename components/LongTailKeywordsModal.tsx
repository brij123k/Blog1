"use client";
import React, { FC, useState } from "react";

interface LongTailKeywordsModalProps {
  onClose: () => void;
  onSave: (keywords: string[]) => void;
  availableKeywords: string[];   // the full list from store analysis
  initialSelected: string[];     // the currently saved selection (may contain custom keywords)
}

const LongTailKeywordsModal: FC<LongTailKeywordsModalProps> = ({
  onClose,
  onSave,
  availableKeywords = [],
  initialSelected = [],
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [customInput, setCustomInput] = useState("");

  // Custom keywords are those in `selected` but not in the original store list
  const customKeywords = Array.from(selected).filter(
    (kw) => !availableKeywords.includes(kw)
  );

  const toggleKeyword = (kw: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) {
        next.delete(kw);
      } else {
        next.add(kw);
      }
      return next;
    });
  };

  const addCustomKeyword = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (selected.has(trimmed)) return; // duplicate
    setSelected((prev) => new Set(prev).add(trimmed));
    setCustomInput("");
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    onClose();
  };

  return (
    <div className="ov open">
      <div className="ov-bd" onClick={onClose} />
      <button className="wiz-x" onClick={onClose}>×</button>
      <div className="cardhost open" style={{ maxWidth: "650px" }}>
        <div className="card">
          <div className="cardtop">
            <h3>Long‑tail Keywords</h3>
          </div>
          <div className="sub">
            Select keywords from the list or add your own (max 50)
          </div>

          {/* Store keywords as toggleable chips */}
          <div className="chips" style={{ marginBottom: "12px" }}>
            {availableKeywords.map((kw, i) => {
              const isSel = selected.has(kw);
              return (
                <div
                  key={i}
                  className={`chip ${isSel ? "sel" : ""}`}
                  onClick={() => toggleKeyword(kw)}
                >
                  {kw}
                </div>
              );
            })}
          </div>

          {/* Custom keyword input */}
          <div className="field" style={{ marginTop: "12px" }}>
            <input
              placeholder="Add your own keyword + Enter"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") addCustomKeyword();
              }}
            />
            <button className="btn btn-gho" onClick={addCustomKeyword}>
              Add
            </button>
          </div>

          {/* Display custom keywords with delete option */}
          {customKeywords.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <div className="muted" style={{ fontSize: "12px" }}>Custom added:</div>
              <div className="chips">
                {customKeywords.map((kw, i) => (
                  <div
                    key={`custom-${i}`}
                    className="chip sel"
                    onClick={() => setSelected((prev) => {
                      const next = new Set(prev);
                      next.delete(kw);
                      return next;
                    })}
                  >
                    {kw} ✕
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="wiz-foot">
            <span className="muted">{selected.size} / 50 selected</span>
            <button className="btn btn-pri" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LongTailKeywordsModal;