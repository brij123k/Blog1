import React, { useState, useEffect, useRef } from "react";
import ApiService from "../app/lib/service";
import ApiConfig from "../app/lib/apiConfig";

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (markets: string[]) => void;
  currentMarkets: string[];
  availableCountries: string[]; // from getCountry endpoint
}

const MarketModal: React.FC<MarketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentMarkets,
  availableCountries,
}) => {
  const [markets, setMarkets] = useState<string[]>(currentMarkets || []);
  const [inputValue, setInputValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMarkets(currentMarkets || []);
      setInputValue("");
      setSuggestions([]);
      setShowSuggestions(false);
      setError("");
    }
  }, [isOpen, currentMarkets]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filtered = availableCountries.filter((country) =>
        country.toLowerCase().includes(inputValue.toLowerCase())
      );
      // Remove already selected markets
      const available = filtered.filter((c) => !markets.includes(c));
      setSuggestions(available);
      setShowSuggestions(available.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, availableCountries, markets]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddMarket = () => {
    const value = inputValue.trim();
    if (!value) return;

    if (markets.includes(value)) {
      setError("This market is already added");
      return;
    }

    setMarkets([...markets, value]);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError("");
  };

  const handleRemoveMarket = (market: string) => {
    setMarkets(markets.filter((m) => m !== market));
    setError("");
  };

  const handleSelectSuggestion = (country: string) => {
    if (!markets.includes(country)) {
      setMarkets([...markets, country]);
      setInputValue("");
      setSuggestions([]);
      setShowSuggestions(false);
      setError("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If there are suggestions and one is highlighted (we're using keyboard nav)
      // For simplicity, just add the current input value
      handleAddMarket();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async () => {
    if (markets.length === 0) {
      setError("Please add at least one market");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await ApiService.post(ApiConfig.addCountry, {
        markets: markets,
      });

      if (response.success) {
        onSave(response.primaryMarket || markets);
        onClose();
      } else {
        setError("Failed to update markets. Please try again.");
      }
    } catch (err) {
      console.error("Failed to update markets:", err);
      setError("Failed to update markets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ov open">
      <div className="ov-bd" onClick={onClose} />
      <div className="cardhost open">
        <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="cardtop">
            <h3>Manage Markets</h3>
            <button
              type="button"
              className="btn btn-gho btn-sm"
              onClick={onClose}
              style={{ marginLeft: "auto" }}
            >
              ✕ Close
            </button>
          </div>
          <div className="sub">
            Add or remove markets for your store. Countries are suggested from our database.
          </div>

          {error && (
            <div
              style={{
                background: "rgba(255,70,70,0.15)",
                border: "1px solid rgba(255,70,70,0.3)",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#ff8a8a",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <div className="field" style={{ position: "relative" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                ref={inputRef}
                placeholder="Type a country name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (inputValue.trim().length > 0) {
                    const filtered = availableCountries.filter((c) =>
                      c.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    const available = filtered.filter((c) => !markets.includes(c));
                    if (available.length > 0) {
                      setSuggestions(available);
                      setShowSuggestions(true);
                    }
                  }
                }}
                disabled={loading}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "rgba(18,24,44,0.98)",
                    border: "1px solid rgba(130,160,255,0.3)",
                    borderRadius: 10,
                    maxHeight: 200,
                    overflowY: "auto",
                    zIndex: 10,
                    marginTop: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  {suggestions.map((country) => (
                    <div
                      key={country}
                      onClick={() => handleSelectSuggestion(country)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        color: "#dbe4fb",
                        fontSize: 14,
                        borderBottom: "1px solid rgba(130,160,255,0.1)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(110,162,255,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn btn-pri"
              onClick={handleAddMarket}
              disabled={!inputValue.trim() || loading}
            >
              Add
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                minHeight: 40,
                padding: 8,
                background: "rgba(8,12,26,0.4)",
                borderRadius: 10,
                border: "1px dashed rgba(130,160,255,0.2)",
              }}
            >
              {markets.length === 0 ? (
                <span style={{ color: "#7386b3", fontSize: 13, padding: 4 }}>
                  No markets added yet. Type a country above to add.
                </span>
              ) : (
                markets.map((market) => (
                  <div
                    key={market}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      background: "rgba(110,162,255,0.15)",
                      border: "1px solid rgba(130,160,255,0.3)",
                      borderRadius: 999,
                      color: "#dbe4fb",
                      fontSize: 13,
                    }}
                  >
                    {market}
                    <button
                      type="button"
                      onClick={() => handleRemoveMarket(market)}
                      disabled={loading}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#8ea0cc",
                        cursor: "pointer",
                        fontSize: 16,
                        padding: "0 2px",
                        lineHeight: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#ff6b6b";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#8ea0cc";
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="wiz-foot" style={{ marginTop: 16 }}>
            <span className="muted">{markets.length} market(s) selected</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-gho"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-pri"
                onClick={handleSubmit}
                disabled={loading || markets.length === 0}
              >
                {loading ? (
                  <>
                    <span className="spin" /> Saving...
                  </>
                ) : (
                  "Save Markets"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketModal;