"use client";
import React, { FC, useState, useEffect, useCallback } from "react";
import ApiService from "../app/lib/service";
import ApiConfig from "../app/lib/apiConfig";
import { useAppStore } from "../app/lib/appStore";

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
  // Get store data from the global store
  const { storeData } = useAppStore();
  
  // Get primary markets from store data
  const primaryMarkets = React.useMemo(() => {
    if (!storeData?.primaryMarket) return [];
    if (Array.isArray(storeData.primaryMarket)) {
      return storeData.primaryMarket;
    }
    return [storeData.primaryMarket];
  }, [storeData?.primaryMarket]);

  const [selectedCountry, setSelectedCountry] = useState(initialData?.country || "");
  const [events, setEvents] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(initialData?.name || "");
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Auto-select first primary market if available and no country selected
  useEffect(() => {
    if (primaryMarkets.length > 0 && !selectedCountry && !initialData?.country) {
      setSelectedCountry(primaryMarkets[0]);
    }
  }, [primaryMarkets, selectedCountry, initialData]);

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
      
      // If we have initial data and it matches this country, auto-select the event
      if (initialData?.country === country && initialData?.name) {
        setSelectedEvent(initialData.name);
      } else {
        setSelectedEvent("");
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoadingEvents(false);
    }
  }, [initialData]);

  // Fetch events when selected country changes
  useEffect(() => {
    if (selectedCountry) {
      fetchEvents(selectedCountry);
    } else {
      setEvents([]);
      setSelectedEvent("");
    }
  }, [selectedCountry, fetchEvents]);

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country);
    setSelectedEvent("");
  };

  const handleSave = () => {
    if (!selectedEvent || !selectedCountry) return;
    onSave({
      type: "seasonal",
      name: selectedEvent,
      country: selectedCountry,
    });
    onClose();
  };

  // Styles
  const styles = `
    .ov { position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; padding:24px; }
    .ov-bd { position:absolute; inset:0; background:rgba(6,9,18,.72); backdrop-filter:blur(3px); }
    .wiz-x { position:absolute; top:18px; right:22px; z-index:6; width:38px; height:38px; border-radius:50%;
      border:1px solid rgba(255,255,255,.25); background:rgba(10,14,28,.85); color:#fff; font-size:19px; line-height:1;
      cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .wiz-x:hover { background:rgba(30,38,60,.9); }
    .cardhost { width:min(94vw,560px); max-height:88vh; overflow:auto; animation:pop .25s ease; }
    .cardhost .card { padding:28px 30px; border-radius:20px; background:rgba(18,24,44,.92); border:1px solid rgba(130,160,255,.18);
      color:#e7ecfb; box-shadow:0 10px 40px rgba(0,0,0,.4); }
    .cardhost .card h3 { font-size:19px; font-weight:600; margin:0 0 4px; color:#eef2ff; }
    .cardhost .sub { font-size:13px; color:#9fb0d8; margin-bottom:14px; }
    .cardtop { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
    .cardtop h3 { margin:0; }
    
    .country-buttons { display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 16px; }
    .country-btn { padding:8px 16px; border-radius:999px; border:1px solid rgba(130,160,255,.25); 
      background:rgba(40,52,86,.6); color:#cdd7f5; cursor:pointer; font-size:13px; transition:.15s; user-select:none; }
    .country-btn:hover { border-color:rgba(130,160,255,.5); background:rgba(40,52,86,.8); }
    .country-btn.active { background:linear-gradient(180deg,#6ea2ff,#3b73ff); color:#fff; border-color:transparent; }
    
    .selected-country-label { font-size:13px; color:#9cc2ff; margin-bottom:12px; padding:8px 12px; 
      background:rgba(110,162,255,.08); border-radius:8px; border:1px solid rgba(130,160,255,.15); }
    .selected-country-label strong { color:#eef2ff; }
    
    .btn { border:none; border-radius:10px; padding:10px 16px; font:inherit; font-size:14px; font-weight:500; cursor:pointer; transition:.15s; }
    .btn:disabled { opacity:.5; cursor:default; }
    .btn-pri { background:linear-gradient(180deg,#6ea2ff,#3b73ff); color:#fff; }
    .btn-pri:hover:not(:disabled){ filter:brightness(1.08); }
    .btn-gho { background:rgba(255,255,255,.08); color:#cfd8f5; border:1px solid rgba(255,255,255,.16); }
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
    @keyframes pop { from{opacity:0; transform:translateY(10px) scale(.98)} to{opacity:1; transform:none} }
    .no-markets { color:#8ea0cc; padding:12px; text-align:center; border:1px dashed rgba(130,160,255,.2); border-radius:10px; }
    .event-count { font-size:12px; color:#8ea0cc; margin-left:8px; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="ov open">
        <div className="ov-bd" onClick={onClose} />
        <button className="wiz-x" onClick={onClose}>×</button>
        <div className="cardhost open w-full h-full flex items-center justify-center">
          <div className="card">
            <div className="cardtop">
              <h3>Seasonal Event</h3>
            </div>
            <div className="sub">Choose a country from your markets, then select a seasonal event.</div>

            {/* Country buttons - show all primary markets */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "12px", color: "#8ea0cc", marginBottom: "8px" }}>
                Your Markets:
              </div>
              {primaryMarkets.length > 0 ? (
                <div className="country-buttons">
                  {primaryMarkets.map((country: string) => (
                    <button
                      key={country}
                      className={`country-btn ${selectedCountry === country ? "active" : ""}`}
                      onClick={() => handleCountryClick(country)}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-markets">
                  No markets configured. Please add markets in your store settings.
                </div>
              )}
            </div>

            {/* Selected country display */}
            {selectedCountry && (
              <div className="selected-country-label">
                📍 Selected: <strong>{selectedCountry}</strong>
                {events.length > 0 && !loadingEvents && (
                  <span className="event-count">({events.length} events available)</span>
                )}
              </div>
            )}

            {/* Event list */}
            {selectedCountry ? (
              loadingEvents ? (
                <div style={{ textAlign: "center", padding: "1rem", color: "#8ea0cc" }}>
                  <span className="spin" /> Loading events for {selectedCountry}...
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
                  {events.length === 0 && !loadingEvents && (
                    <div style={{ color: "#8ea0cc", padding: "12px", width: "100%", textAlign: "center" }}>
                      No seasonal events found for {selectedCountry}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div style={{ color: "#8ea0cc", padding: "20px", textAlign: "center" }}>
                Please select a country above to see seasonal events
              </div>
            )}

            <div className="wiz-foot">
              <span className="muted">
                {selectedEvent ? `Selected: ${selectedEvent}` : "No event selected"}
              </span>
              <button
                className="btn btn-pri"
                disabled={!selectedEvent || !selectedCountry}
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SeasonalModal;