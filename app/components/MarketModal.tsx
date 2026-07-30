"use client";

/**
 * components/MarketModal.tsx
 * ---------------------------------------------------------------------------
 * Primary market editor. Opened from the store card in components/Navbar.tsx.
 *
 * Props are exactly the ones the navbar already passes:
 *   isOpen             - show / hide
 *   onClose            - called on Cancel, Esc, backdrop click
 *   onSave(markets)    - receives the final string[]; may be async
 *   currentMarkets     - markets currently saved on the store
 *   availableCountries - suggestions fetched from ApiConfig.getCountry
 */

import React, {
  FC,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (markets: string[]) => void | Promise<void>;
  currentMarkets?: string[];
  availableCountries?: string[];
}

const MODAL_CSS = `
.mm-ov { position: fixed; inset: 0; z-index: 1000; display: flex;
  align-items: center; justify-content: center; padding: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.mm-bd { position: absolute; inset: 0; background: rgba(6,9,18,.72);
  backdrop-filter: blur(3px); animation: mmFade .18s ease; }
.mm-panel { position: relative; width: min(560px, 100%); max-height: 88vh;
  display: flex; flex-direction: column;
  background: linear-gradient(180deg,#1b2136,#10141f);
  border: 1px solid rgba(130,160,255,.18); border-radius: 18px;
  box-shadow: 0 30px 70px rgba(0,0,0,.55); color: #dbe4fb;
  animation: mmPop .2s cubic-bezier(.2,.8,.3,1); overflow: hidden; }
@keyframes mmFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes mmPop { from { opacity: 0; transform: translateY(10px) scale(.98) }
                   to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) {
  .mm-bd, .mm-panel { animation: none; }
}

.mm-head { padding: 20px 22px 14px; border-bottom: 1px solid rgba(130,160,255,.14); }
.mm-head h3 { margin: 0; font-size: 18px; font-weight: 600; color: #eef2ff; }
.mm-head p { margin: 5px 0 0; font-size: 13px; color: #8ea0cc; line-height: 1.5; }
.mm-x { position: absolute; top: 16px; right: 16px; width: 30px; height: 30px;
  border-radius: 8px; border: 1px solid rgba(130,160,255,.2);
  background: rgba(10,14,28,.6); color: #9fb0d8; cursor: pointer;
  font-size: 15px; line-height: 1; transition: .15s; }
.mm-x:hover { background: rgba(110,162,255,.16); color: #fff; }

.mm-body { padding: 18px 22px; overflow-y: auto; }
.mm-body::-webkit-scrollbar { width: 6px; }
.mm-body::-webkit-scrollbar-thumb { background: rgba(130,160,255,.25); border-radius: 6px; }

.mm-label { font-size: 11.5px; letter-spacing: 1.2px; text-transform: uppercase;
  color: #7386b3; margin-bottom: 9px; }

/* ---- selected markets ---- */
.mm-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.mm-chip { display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 8px 6px 13px; border-radius: 999px; font-size: 13.5px; color: #fff;
  background: linear-gradient(180deg,rgba(110,162,255,.26),rgba(59,115,255,.2));
  border: 1px solid rgba(130,160,255,.35); }
.mm-chip button { width: 18px; height: 18px; border-radius: 50%; border: none;
  background: rgba(8,12,24,.45); color: #cdd7f5; cursor: pointer;
  font-size: 12px; line-height: 1; display: grid; place-items: center; transition: .15s; }
.mm-chip button:hover { background: #e0567a; color: #fff; }
.mm-none { font-size: 13px; color: #8ea0cc; padding: 12px 14px;
  border: 1px dashed rgba(130,160,255,.25); border-radius: 12px; margin-bottom: 20px; }

/* ---- search ---- */
.mm-search { position: relative; margin-bottom: 12px; }
.mm-search input { width: 100%; padding: 11px 14px; border-radius: 11px;
  background: rgba(10,14,28,.6); border: 1px solid rgba(130,160,255,.22);
  color: #eef2ff; font-size: 14px; font-family: inherit; outline: none; transition: .15s; }
.mm-search input::placeholder { color: #6f80ad; }
.mm-search input:focus { border-color: #6ea2ff; box-shadow: 0 0 0 3px rgba(110,162,255,.16); }

.mm-list { border: 1px solid rgba(130,160,255,.16); border-radius: 12px;
  background: rgba(10,14,28,.4); max-height: 240px; overflow-y: auto; }
.mm-list::-webkit-scrollbar { width: 6px; }
.mm-list::-webkit-scrollbar-thumb { background: rgba(130,160,255,.25); border-radius: 6px; }
.mm-opt { display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 10px 14px; background: none; border: none; border-bottom: 1px solid rgba(130,160,255,.08);
  color: #cdd7f5; font-size: 14px; font-family: inherit; text-align: left; cursor: pointer; transition: .12s; }
.mm-opt:last-child { border-bottom: none; }
.mm-opt:hover { background: rgba(110,162,255,.1); color: #eef2ff; }
.mm-opt .mm-box { width: 17px; height: 17px; border-radius: 5px; flex: 0 0 auto;
  border: 1px solid rgba(130,160,255,.4); display: grid; place-items: center;
  font-size: 11px; color: #fff; }
.mm-opt.on .mm-box { background: linear-gradient(180deg,#6ea2ff,#3b73ff); border-color: transparent; }
.mm-opt.on { color: #eef2ff; }
.mm-empty { padding: 22px 14px; text-align: center; font-size: 13px; color: #8ea0cc; }
.mm-add { color: #9cc2ff; font-weight: 500; }

/* ---- footer ---- */
.mm-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 22px; border-top: 1px solid rgba(130,160,255,.14);
  background: rgba(8,11,20,.5); }
.mm-count { font-size: 12.5px; color: #8ea0cc; }
.mm-actions { display: flex; gap: 10px; }
.mm-btn { padding: 9px 18px; border-radius: 10px; font-size: 13.5px; font-family: inherit;
  cursor: pointer; transition: .15s; border: 1px solid transparent; }
.mm-btn:disabled { opacity: .55; cursor: not-allowed; }
.mm-gho { background: rgba(40,52,86,.6); border-color: rgba(130,160,255,.22); color: #cdd7f5; }
.mm-gho:hover:not(:disabled) { background: rgba(60,74,116,.7); color: #fff; }
.mm-pri { background: linear-gradient(180deg,#6ea2ff,#3b73ff); color: #fff; font-weight: 500; }
.mm-pri:hover:not(:disabled) { filter: brightness(1.08); }
.mm-spin { display: inline-block; width: 12px; height: 12px; margin-right: 7px;
  border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%;
  vertical-align: -1px; animation: mmSpin .7s linear infinite; }
@keyframes mmSpin { to { transform: rotate(360deg) } }

.mm-panel :focus-visible { outline: 2px solid #6ea2ff; outline-offset: 2px; }

@media (max-width: 560px) {
  .mm-ov { padding: 0; align-items: flex-end; }
  .mm-panel { max-height: 92vh; border-radius: 18px 18px 0 0; width: 100%; }
  .mm-foot { flex-direction: column-reverse; align-items: stretch; }
  .mm-actions { display: grid; grid-template-columns: 1fr 1fr; }
  .mm-count { text-align: center; }
}
`;

const MarketModal: FC<MarketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentMarkets = [],
  availableCountries = [],
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset to the saved markets every time the modal is opened, so a cancelled
  // edit never leaks into the next one.
  useEffect(() => {
    if (!isOpen) return;
    setSelected(currentMarkets.filter(Boolean));
    setQuery("");
    setSaving(false);
    const t = setTimeout(() => searchRef.current?.focus(), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Esc to close + lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const toggle = useCallback((market: string): void => {
    setSelected((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = availableCountries.filter(Boolean);
    return q ? list.filter((c) => c.toLowerCase().includes(q)) : list;
  }, [availableCountries, query]);

  // Allow a market that isn't in the suggestions list.
  const typed = query.trim();
  const canAddCustom =
    typed.length > 0 &&
    !filtered.some((c) => c.toLowerCase() === typed.toLowerCase()) &&
    !selected.some((m) => m.toLowerCase() === typed.toLowerCase());

  const addCustom = useCallback((): void => {
    if (!canAddCustom) return;
    setSelected((prev) => [...prev, typed]);
    setQuery("");
    searchRef.current?.focus();
  }, [canAddCustom, typed]);

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canAddCustom) addCustom();
      else if (filtered.length === 1) toggle(filtered[0]);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);
      await onSave(selected);
      onClose();
    } catch (err) {
      console.error("Failed to save markets:", err);
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MODAL_CSS }} />

      <div className="mm-ov" role="dialog" aria-modal="true" aria-labelledby="mm-title">
        <div className="mm-bd" onClick={saving ? undefined : onClose} />

        <div className="mm-panel">
          <button type="button" className="mm-x" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <div className="mm-head">
            <h3 id="mm-title">Primary markets</h3>
            <p>
              The countries you sell to. Blog topics, keywords and seasonal
              campaigns are generated for these markets.
            </p>
          </div>

          <div className="mm-body">
            <div className="mm-label">Selected</div>
            {selected.length > 0 ? (
              <div className="mm-chips">
                {selected.map((m) => (
                  <span key={m} className="mm-chip">
                    {m}
                    <button type="button" onClick={() => toggle(m)} aria-label={`Remove ${m}`}>
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="mm-none">
                No markets yet. Pick one below to start targeting a country.
              </div>
            )}

            <div className="mm-label">Add a market</div>
            <div className="mm-search">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKey}
                placeholder="Search countries…"
                aria-label="Search countries"
              />
            </div>

            <div className="mm-list">
              {canAddCustom && (
                <button type="button" className="mm-opt" onClick={addCustom}>
                  <span className="mm-box">+</span>
                  <span>
                    Add <span className="mm-add">{typed}</span>
                  </span>
                </button>
              )}

              {filtered.map((c) => {
                const on = selected.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    className={"mm-opt" + (on ? " on" : "")}
                    onClick={() => toggle(c)}
                    aria-pressed={on}
                  >
                    <span className="mm-box">{on ? "✓" : ""}</span>
                    <span>{c}</span>
                  </button>
                );
              })}

              {filtered.length === 0 && !canAddCustom && (
                <div className="mm-empty">
                  {availableCountries.length === 0
                    ? "Loading countries…"
                    : "No country matches that search."}
                </div>
              )}
            </div>
          </div>

          <div className="mm-foot">
            <span className="mm-count">
              {selected.length} {selected.length === 1 ? "market" : "markets"} selected
            </span>
            <div className="mm-actions">
              <button type="button" className="mm-btn mm-gho" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className="mm-btn mm-pri"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <span className="mm-spin" />}
                {saving ? "Saving" : "Save markets"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketModal;
