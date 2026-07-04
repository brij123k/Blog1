"use client";
import React, { FC, useState, useEffect, useCallback } from "react";
import ApiService from "../app/lib/service";
import ApiConfig from "../app/lib/apiConfig";

interface CalendarData {
  type: string;
  name: string;
  country?: string;
  date?: string;
}

interface SeasonalModalProps {
  onClose: () => void;
  onSave: (data: CalendarData) => void;
  initialData?: CalendarData;
}

const SeasonalModal: FC<SeasonalModalProps> = ({ onClose, onSave, initialData }) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(initialData?.country || "");
  const [countrySearch, setCountrySearch] = useState(initialData?.country || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(initialData?.name || "");
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await ApiService.get(ApiConfig.getCountry);
        setCountries(data || []);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch events when country changes
  const fetchEvents = useCallback(async (country: string) => {
    if (!country) {
      setEvents([]);
      setSelectedEvent("");
      return;
    }
    setLoadingEvents(true);
    try {
      const res = await ApiService.get(`${ApiConfig.getEvents(country)}`);
      setEvents(res?.seasonal || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchEvents(selectedCountry);
    } else {
      setEvents([]);
      setSelectedEvent("");
    }
  }, [selectedCountry, fetchEvents]);

  // Restore previously selected event from initialData when events load
  useEffect(() => {
    if (initialData?.name && events.includes(initialData.name)) {
      setSelectedEvent(initialData.name);
    } else if (!initialData?.name) {
      // If no initial data, don't auto-select anything
      setSelectedEvent("");
    }
  }, [events, initialData]);

  // Filter countries based on search
  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSave = () => {
    if (!selectedEvent) return;
    onSave({
      type: "seasonal",
      name: selectedEvent,
      country: selectedCountry,
    });
    onClose();
  };

  return (
    <div className="ov open">
      <div className="ov-bd" onClick={onClose} />
      <button className="wiz-x" onClick={onClose}>×</button>
      <div className="cardhost open w-full h-full flex items-center justify-center">
        <div className="card">
          <div className="cardtop">
            <h3>Seasonal Event</h3>
          </div>
          <div className="sub">Choose a country and a seasonal event.</div>

          {/* Country dropdown with search */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <input
              className="field"
              type="text"
              placeholder="Search country..."
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setShowDropdown(true);
                // When user types, we don't change selectedCountry until they pick
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && filteredCountries.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "rgba(14,19,38,.95)",
                  border: "1px solid rgba(130,160,255,.25)",
                  borderRadius: "0 0 10px 10px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                {filteredCountries.map((country) => (
                  <div
                    key={country}
                    style={{
                      padding: "8px 12px",
                      color: "#eef2ff",
                      cursor: "pointer",
                      background: selectedCountry === country ? "rgba(40,55,95,.9)" : "transparent",
                    }}
                    onMouseDown={() => {
                      setSelectedCountry(country);
                      setCountrySearch(country);
                      setShowDropdown(false);
                    }}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Event list */}
          {loadingEvents ? (
            <div style={{ textAlign: "center", padding: "1rem", color: "#8ea0cc" }}>
              <span className="spin" /> Loading events...
            </div>
          ) : (
            <div
              className="chips"
              style={{ marginTop: "12px", maxHeight: "40vh", overflowY: "auto" }}
            >
              {events.map((event, i) => {
                const isSel = selectedEvent === event;
                return (
                  <div
                    key={i}
                    className={`chip ${isSel ? "sel" : ""}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event}
                  </div>
                );
              })}
            </div>
          )}

          <div className="wiz-foot">
            <span className="muted">{selectedEvent ? "1 selected" : "None selected"}</span>
            <button
              className="btn btn-pri"
              disabled={!selectedEvent}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalModal;