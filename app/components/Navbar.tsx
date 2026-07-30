"use client";

import React, {
  FC,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
const HIDDEN_ROUTES = ["/", "/welcome"];
import ApiService from "../lib/service";
import ApiConfig from "../lib/apiConfig";
import {
  useAppStore,
  loadStoreData,
  loadBlogs,
  updateStoreData,
} from "../lib/appStore";
// import MarketModal from "./MarketModal";

// ---------------------------------------------------------------------------
// Config — change these two if your routes are named differently
// ---------------------------------------------------------------------------
const DASHBOARD_PATH = "/dashboard";
/** Routes where the navbar should NOT be shown (login, onboarding, etc.) */
const HIDDEN_ON = ["/login", "/signup", "/auth", "/onboarding", "/install"];

// Local storage keys — same ones the dashboard already uses
const GSC_LS_KEY = "meris_gsc_v1";
const BL_LS_KEY = "meris_backlinks_v1";

type NavView = "pedal" | "blogs" | "console" | "backlinks";
type BlogTab = "all" | "draft" | "sched" | "pub";

// ---------------------------------------------------------------------------
// Styles (moved here from the dashboard CSS so every page gets them)
// ---------------------------------------------------------------------------
const NAV_CSS = `
/* Page wrapper in app/layout.tsx leaves room for the fixed nav */
.app-shell { width: 100%; padding-left: 290px; }

.app-side { position: fixed; left: 20px; top: 80px; bottom: 20px; width: 240px;
  overflow-y: auto; z-index: 500;
  background: linear-gradient(180deg,#1b2136,#10141f);
  border: 1px solid rgba(130,160,255,.18);
  border-radius: 18px; padding: 18px 12px; color: #dbe4fb;
  box-shadow: 0 20px 50px rgba(0,0,0,.45);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.app-side::-webkit-scrollbar { width: 6px; }
.app-side::-webkit-scrollbar-thumb { background: rgba(130,160,255,.25); border-radius: 6px; }

.app-side .side-title { font-size: 16px; font-weight: 600; letter-spacing: .5px;
  color: #eef2ff; padding: 4px 10px 14px; display: flex; align-items: center; gap: 9px; }
.app-side .side-title .sdot { width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #eaf2ff, #6294ec 46%, #21478e 100%);
  box-shadow: 0 0 12px rgba(98,148,236,.9); }

/* ---- store card + primary market editing area ---- */
.side-store { margin: 0 8px 12px; padding: 10px 12px;
  border: 1px solid rgba(130,160,255,.2); border-radius: 12px;
  background: rgba(10,14,28,.55); }
.side-store .ss-name { font-size: 14px; font-weight: 600; color: #eef2ff; margin-bottom: 3px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.side-store .ss-meta { font-size: 12.5px; color: #8ea0cc; line-height: 1.5; }
.side-store .ss-market { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.side-store .ss-market span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nv-edit { padding: 2px 10px; font-size: 11px; line-height: 1.6;
  background: rgba(110,162,255,.1); border: 1px solid rgba(130,160,255,.2);
  border-radius: 6px; color: #9cc2ff; cursor: pointer; flex: 0 0 auto; transition: .15s; }
.nv-edit:hover { background: rgba(110,162,255,.22); color: #fff; }
.side-store .ss-skel { height: 11px; border-radius: 6px; margin: 6px 0;
  background: linear-gradient(90deg, rgba(130,160,255,.10), rgba(130,160,255,.22), rgba(130,160,255,.10));
  background-size: 200% 100%; animation: nvShimmer 1.2s linear infinite; }
@keyframes nvShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ---- nav items ---- */
.side-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-radius: 10px; cursor: pointer; font-size: 15px; color: #b9c6ea;
  transition: .15s; border: 1px solid transparent; user-select: none;
  width: 100%; background: none; text-align: left; font-family: inherit; }
.side-item:hover { background: rgba(110,162,255,.08); color: #eef2ff; }
.side-item.active { background: linear-gradient(180deg,rgba(110,162,255,.22),rgba(59,115,255,.18));
  border-color: rgba(130,160,255,.35); color: #fff; }
.side-item .cnt { margin-left: auto; font-size: 11px; background: rgba(40,52,86,.9);
  border: 1px solid rgba(130,160,255,.25); border-radius: 999px; padding: 1px 8px; color: #9fb0d8; }
.side-sec { margin: 14px 10px 6px; font-size: 11.5px; letter-spacing: 1.2px;
  text-transform: uppercase; color: #7386b3; }

/* ---- toast ---- */
.nv-toast { position: fixed; left: 20px; bottom: 26px; z-index: 900;
  background: #10141f; border: 1px solid rgba(130,160,255,.3); color: #e7ecfb;
  padding: 10px 16px; border-radius: 10px; font-size: 13px;
  box-shadow: 0 12px 30px rgba(0,0,0,.5); opacity: 0; transform: translateY(8px);
  transition: .2s; pointer-events: none; }
.nv-toast.show { opacity: 1; transform: translateY(0); }

/* ---- mobile: nav becomes a normal block on top ---- */
@media (max-width: 980px) {
  .app-shell { padding-left: 0; }
  .app-side { position: static; width: auto; margin: 20px; bottom: auto; top: auto;
    left: auto; max-height: none; }
}
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const NavbarInner: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { storeData, loadedStore, blogs, loadedBlogs } = useAppStore();

  const [marketModalOpen, setMarketModalOpen] = useState<boolean>(false);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [savingMarket, setSavingMarket] = useState<boolean>(false);
  const [backlinkCount, setBacklinkCount] = useState<number>(0);
  const [gscConnected, setGscConnected] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hidden = HIDDEN_ON.some((r) => pathname?.startsWith(r));

  const toast = useCallback((msg: string): void => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2600);
  }, []);

  // ---- data -----------------------------------------------------------
  useEffect(() => {
    if (hidden) return;
    loadStoreData().catch(() => {
      /* the dashboard surfaces the error; the nav just stays empty */
    });
  }, [hidden]);

  // Only fetch blogs ourselves when the dashboard has not published them.
  useEffect(() => {
    if (hidden || loadedBlogs) return;
    loadBlogs().catch(() => {});
  }, [hidden, loadedBlogs]);

  // Backlinks + Google Console counters live in localStorage.
  const readLocal = useCallback((): void => {
    try {
      const g = window.localStorage.getItem(GSC_LS_KEY);
      setGscConnected(!!(g && JSON.parse(g)?.site));
      const bl = window.localStorage.getItem(BL_LS_KEY);
      const parsed = bl ? JSON.parse(bl) : [];
      setBacklinkCount(Array.isArray(parsed) ? parsed.length : 0);
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    readLocal();
    window.addEventListener("focus", readLocal);
    window.addEventListener("storage", readLocal);
    const id = setInterval(readLocal, 4000); // keeps counts live on the dashboard
    return () => {
      window.removeEventListener("focus", readLocal);
      window.removeEventListener("storage", readLocal);
      clearInterval(id);
    };
  }, [readLocal, pathname]);

  const fetchAvailableCountries = useCallback(async (): Promise<void> => {
    try {
      const response = await ApiService.get(ApiConfig.getCountry);
      if (Array.isArray(response)) {
        if (typeof response[0] === "string") setAvailableCountries(response);
        else if (response[0]?.name) setAvailableCountries(response.map((c: any) => c.name));
        else if (response[0]?.country) setAvailableCountries(response.map((c: any) => c.country));
        else setAvailableCountries([]);
      } else if (response?.countries && Array.isArray(response.countries)) {
        setAvailableCountries(response.countries);
      } else {
        setAvailableCountries([]);
      }
    } catch (err) {
      console.error("Failed to fetch countries:", err);
      toast("Failed to load country suggestions");
    }
  }, [toast]);

  // ---- primary market editing -----------------------------------------
  const openMarketEditor = useCallback((): void => {
    fetchAvailableCountries();
    setMarketModalOpen(true);
  }, [fetchAvailableCountries]);

  const handleMarketSave = useCallback(
    async (newMarkets: any): Promise<void> => {
      // 1. update the shared cache immediately (dashboard re-renders too)
      updateStoreData({ primaryMarket: newMarkets });

      // 2. persist, if an endpoint is configured. Remove this block if your
      //    MarketModal already saves to the backend itself.
      const cfg: any = ApiConfig as any;
      const endpoint = cfg.updateMarket || cfg.updatePrimaryMarket || cfg.updateStore;
      if (endpoint) {
        try {
          setSavingMarket(true);
          await ApiService.post(endpoint, { primaryMarket: newMarkets });
        } catch (err) {
          console.error("Failed to save markets:", err);
          toast("Markets updated locally, but saving failed");
          setSavingMarket(false);
          return;
        } finally {
          setSavingMarket(false);
        }
      }
      toast("Markets updated successfully!");
    },
    [toast]
  );

  // ---- navigation ------------------------------------------------------
  const currentView = (searchParams.get("view") || "pedal") as NavView;
  const currentTab = (searchParams.get("tab") || "all") as BlogTab;
  const onDashboard = pathname === DASHBOARD_PATH;

  const go = useCallback(
    (view: NavView, tab?: BlogTab): void => {
      const qs = new URLSearchParams();
      qs.set("view", view);
      if (tab) qs.set("tab", tab);
      router.push(`${DASHBOARD_PATH}?${qs.toString()}`);
    },
    [router]
  );

  const isActive = (view: NavView, tab?: BlogTab): boolean =>
    onDashboard && currentView === view && (!tab || currentTab === tab);

  const count = (status?: string): number =>
    status ? blogs.filter((b: any) => b.status === status).length : blogs.length;

  if (hidden) return null;

  const marketLabel = Array.isArray(storeData?.primaryMarket)
    ? storeData.primaryMarket.join(", ")
    : storeData?.primaryMarket || "—";

const pathnames = usePathname();

  const hideNavbar = HIDDEN_ROUTES.some(
    (route) => pathnames === route || pathnames.startsWith(`${route}/`)
  );

  if (hideNavbar) return null;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NAV_CSS }} />

      <aside className="app-side">
        <div className="side-title">
          <span className="sdot" /> Blog Studio
        </div>

        {/* ===== Store card + PRIMARY MARKET editing area ===== */}
        {storeData ? (
          <div className="side-store">
            <div className="ss-name">{storeData.shopDomain || "My store"}</div>
            <div className="ss-meta">{(storeData.niche || "").slice(0, 48)}</div>
            <div className="ss-meta ss-market">
              <span title={marketLabel}>Market: {marketLabel}</span>
              <button
                type="button"
                className="nv-edit"
                onClick={openMarketEditor}
                disabled={savingMarket}
              >
                {savingMarket ? "…" : "✎ Edit"}
              </button>
            </div>
          </div>
        ) : (
          !loadedStore && (
            <div className="side-store">
              <div className="ss-skel" style={{ width: "70%" }} />
              <div className="ss-skel" style={{ width: "90%" }} />
              <div className="ss-skel" style={{ width: "55%" }} />
            </div>
          )
        )}

        {/* ===== Navigation ===== */}
        <button
          type="button"
          className={"side-item" + (isActive("pedal") ? " active" : "")}
          onClick={() => go("pedal")}
        >
          🎛️ Dashboard
        </button>

        <div className="side-sec">Content</div>
        <button
          type="button"
          className={"side-item" + (isActive("blogs", "all") ? " active" : "")}
        >
          <a href="/contents">
          📝 Content Hub <span className="cnt">{count()}</span>
          </a>
        </button>
        <button
          type="button"
          className={"side-item" + (isActive("blogs", "draft") ? " active" : "")}
          onClick={() => go("blogs", "draft")}
        >
          Draft blogs <span className="cnt">{count("draft")}</span>
        </button>
        <button
          type="button"
          className={"side-item" + (isActive("blogs", "sched") ? " active" : "")}
          onClick={() => go("blogs", "sched")}
        >
          Scheduled blogs <span className="cnt">{count("sched")}</span>
        </button>
        <button
          type="button"
          className={"side-item" + (isActive("blogs", "pub") ? " active" : "")}
          onClick={() => go("blogs", "pub")}
        >
          Published blogs <span className="cnt">{count("pub")}</span>
        </button>

        <div className="side-sec">SEO Tools</div>
        <button
          type="button"
          className={"side-item" + (isActive("console") ? " active" : "")}
          onClick={() => go("console")}
        >
          🔍 Google Console {gscConnected && <span className="cnt">✓</span>}
        </button>
        <button
          type="button"
          className={"side-item" + (isActive("backlinks") ? " active" : "")}
          onClick={() => go("backlinks")}
        >
          🔗 Backlinks <span className="cnt">{backlinkCount}</span>
        </button>

        <div className="side-sec">Account</div>
        <button
          type="button"
          className={"side-item" + (pathname === "/billings" ? " active" : "")}
          onClick={() => router.push("/billings")}
        >
          💳 Billings
        </button>
      </aside>

      {/* ===== Market modal (primary market editing) ===== */}
      {/* <MarketModal
        isOpen={marketModalOpen}
        onClose={() => setMarketModalOpen(false)}
        onSave={handleMarketSave}
        currentMarkets={
          Array.isArray(storeData?.primaryMarket)
            ? storeData.primaryMarket
            : storeData?.primaryMarket
            ? [storeData.primaryMarket]
            : []
        }
        availableCountries={availableCountries}
      /> */}

      <div className={"nv-toast" + (toastMsg ? " show" : "")}>{toastMsg}</div>
    </>
  );
};

// useSearchParams() needs a Suspense boundary during prerender.
const Navbar: FC = () => (
  <Suspense fallback={null}>
    <NavbarInner />
  </Suspense>
);

export default Navbar;
