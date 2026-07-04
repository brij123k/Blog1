"use client";
import React, { FC } from "react";

interface CompetitorDetailModalProps {
  competitor: {
    name: string;
    website: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  };
  isSelected: boolean;
  onSelect: (url: string) => void;   // pass the url to select, or empty string to deselect
  onClose: () => void;
}

const CompetitorDetailModal: FC<CompetitorDetailModalProps> = ({
  competitor,
  isSelected,
  onSelect,
  onClose,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelect(competitor.website);
    } else {
      onSelect(""); // deselect
    }
  };

  return (
    <div className="ov open">
      <div className="ov-bd" onClick={onClose} />
      <button className="wiz-x" onClick={onClose}>×</button>
      <div className="cardhost open">
        <div className="card">
          <div className="cardtop">
            <h3>{competitor.name}</h3>
          </div>
          <div className="sub">
            <strong>Website:</strong> <a href={competitor.website} target="_blank" rel="noopener noreferrer">
              {competitor.website}
            </a>
          </div>
          <p>{competitor.description}</p>
          <p><strong>Strengths:</strong></p>
          <ul>{competitor.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <p><strong>Weaknesses:</strong></p>
          <ul>{competitor.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>

          {/* Checkbox to select this competitor */}
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="select-competitor"
              checked={isSelected}
              onChange={handleCheckboxChange}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="select-competitor" style={{ color: "#cdd7f5", cursor: "pointer" }}>
              Use this competitor for the campaign
            </label>
          </div>

          <div className="wiz-foot">
            <span />
            <button className="btn btn-pri" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorDetailModal;