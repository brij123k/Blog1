"use client";

/**
 * app/lib/appStore.tsx
 * ---------------------------------------------------------------------------
 * A tiny shared store (no external library) used by BOTH the global Navbar and
 * the Dashboard page.
 *
 * Why this exists:
 *  - The Navbar now lives in app/layout.tsx, so it can no longer read the
 *    dashboard's React state (store name, primary market, blog counts).
 *  - Without a shared cache, the Navbar and the Dashboard would each call
 *    the analyze endpoint => two expensive calls on every page load.
 *
 * Everything here is module-level, so it survives client-side navigation
 * between pages and is fetched only once per session.
 */

import { useSyncExternalStore } from "react";
import ApiService from "./service";
import ApiConfig from "./apiConfig";

export interface AppStoreState {
  storeData: any | null;
  loadingStore: boolean;
  loadedStore: boolean;
  blogs: any[];
  loadedBlogs: boolean;
}

let state: AppStoreState = {
  storeData: null,
  loadingStore: false,
  loadedStore: false,
  blogs: [],
  loadedBlogs: false,
};

const listeners = new Set<() => void>();

function setState(patch: Partial<AppStoreState>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AppStoreState {
  return state;
}

/** Subscribe any client component to the shared store. */
export function useAppStore(): AppStoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ---------------------------------------------------------------------------
// Store analysis
// ---------------------------------------------------------------------------

let storePromise: Promise<any> | null = null;

/** Loads the store analysis once. Pass force=true to re-fetch. */
export function loadStoreData(force = false): Promise<any> {
  if (storePromise && !force) return storePromise;

  setState({ loadingStore: true });

  storePromise = ApiService.post(ApiConfig.analyzeStore)
    .then((res: any) => {
      setState({ storeData: res, loadingStore: false, loadedStore: true });
      return res;
    })
    .catch((err: any) => {
      storePromise = null; // allow a retry
      setState({ loadingStore: false, loadedStore: true });
      throw err;
    });

  return storePromise;
}

/** Patch the cached store data (e.g. after the market is edited in the navbar). */
export function updateStoreData(patch: Record<string, any>): void {
  setState({ storeData: { ...(state.storeData || {}), ...patch } });
}

// ---------------------------------------------------------------------------
// Blogs (used for the navbar counters)
// ---------------------------------------------------------------------------

/** The dashboard calls this so the navbar counters stay live. */
export function publishBlogs(blogs: any[]): void {
  setState({ blogs: blogs || [], loadedBlogs: true });
}

let blogsPromise: Promise<any[]> | null = null;

/**
 * Used by the navbar when it is mounted on a page that is NOT the dashboard
 * (e.g. /billings), so the counters are still correct there.
 */
export function loadBlogs(force = false): Promise<any[]> {
  if (blogsPromise && !force) return blogsPromise;

  const cfg: any = ApiConfig as any;
  const endpoint = cfg.LIST_BLOGS || cfg.GET_BLOGS || cfg.BLOGS;

  if (!endpoint) {
    blogsPromise = Promise.resolve(state.blogs);
    return blogsPromise;
  }

  blogsPromise = ApiService.get(endpoint, {})
    .then((data: any) => {
      const rawList: any[] = data?.blogs || data || [];
      const list = rawList.map((b: any) => ({
        id: b._id || b.id,
        title: b.title || "Untitled blog",
        status: b.status || "draft",
      }));
      setState({ blogs: list, loadedBlogs: true });
      return list;
    })
    .catch((err: any) => {
      console.error("Navbar: failed to load blogs", err);
      blogsPromise = null;
      setState({ loadedBlogs: true });
      return state.blogs;
    });

  return blogsPromise;
}
