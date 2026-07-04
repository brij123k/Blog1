"use client";
import React, { FC, useState, useEffect } from "react";
import ApiService from "../app/lib/service";
import ApiConfig from "../app/lib/apiConfig";

interface Collection {
  id: string;
  title: string;
  handle: string;
  image: string | null;
  productsCount: number;
}

interface CollectionModalProps {
  onClose: () => void;
  onSave: (ids: string[]) => void;
  selectedIds?: string[];
}

const CollectionModal: FC<CollectionModalProps> = ({ onClose, onSave, selectedIds = [] }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await ApiService.get(ApiConfig.COLLECTIONS);
        setCollections(res?.collections || []);
      } catch (err) {
        console.error("Failed to fetch collections", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) return prev; // max 2
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    onClose();
  };

  return (
    <div className="ov open">
      <div className="ov-bd" onClick={onClose} />
      <button className="wiz-x" onClick={onClose}>×</button>
      <div className="cardhost open" style={{ maxWidth: "700px" }}>
        <div className="card">
          <div className="cardtop">
            <h3>Select up to 2 Collections</h3>
          </div>
          <div className="sub">Choose collections for your campaign (optional)</div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "1rem", color: "#8ea0cc" }}>
              <span className="spin" /> Loading collections...
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", maxHeight: "60vh", overflowY: "auto" }}>
              {collections.map((col) => {
                const isSelected = selected.has(col.id);
                return (
                  <div
                    key={col.id}
                    className={`prod-card ${isSelected ? "sel" : ""}`}
                    onClick={() => toggle(col.id)}
                    style={{ width: "150px", cursor: "pointer" }}
                  >
                    {col.image ? (
                      <img
                        src={col.image}
                        alt={col.title}
                        style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    ) : (
                      <div style={{ height: "80px", background: "#1a1e2e", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#6a6e80" }}>
                        No image
                      </div>
                    )}
                    <div className="prod-name" style={{ marginTop: "4px", fontWeight: 600 }}>{col.title}</div>
                    <div className="prod-price" style={{ fontSize: "11px", color: "#8ea0cc" }}>
                      {col.productsCount} products
                    </div>
                    {isSelected && (
                      <div style={{ marginTop: "4px", fontSize: "10px", color: "#6ea2ff" }}>✓ Selected</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="wiz-foot">
            <span className="muted">{selected.size} / 2 selected</span>
            <button className="btn btn-pri" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;