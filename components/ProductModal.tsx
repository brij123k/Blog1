"use client";

import React, { useState, useEffect, useRef, useCallback, FC } from "react";
import ApiService from "../app/lib/service";
import ApiConfig from "../app/lib/apiConfig";

// ============================================================================
// ProductModal — styled to match the Blog Studio dashboard theme.
// Same props as before, so it's a drop-in replacement:
//   onClose:      () => void
//   onSave:       (ids: string[]) => void
//   selectedIds:  string[]           (already-selected product ids)
//   collectionIds?: string[]         (optional collection filter scope)
// ============================================================================

const MAX_PRODUCTS = 2; // change this to allow more products

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  image: string | null;
  price: string;
  currency: string;
}

interface ProductModalProps {
  onClose: () => void;
  onSave: (ids: string[]) => void;
  selectedIds: string[];
  collectionIds?: string[];
}

const CSS = `
  .pm-ov {
    position: fixed; inset: 0; z-index: 1200;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .pm-bd {
    position: absolute; inset: 0;
    background: rgba(6, 8, 16, 0.72);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  @keyframes pmPop { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
  .pm-card {
    position: relative;
    width: min(94vw, 780px);
    max-height: 86vh;
    display: flex; flex-direction: column;
    background: linear-gradient(180deg, #1b2136 0%, #10141f 100%);
    border: 1px solid rgba(130, 160, 255, 0.22);
    border-radius: 18px;
    color: #e7ecfb;
    box-shadow:
      0 0 0 1px rgba(130, 160, 255, 0.1),
      0 0 60px rgba(61, 147, 255, 0.15),
      0 30px 90px rgba(0, 0, 0, 0.7);
    animation: pmPop .3s cubic-bezier(.2,.8,.2,1);
    overflow: hidden;
  }

  /* ---- header ---- */
  .pm-head {
    display: flex; align-items: center; gap: 12px;
    padding: 18px 22px 14px;
    border-bottom: 1px solid rgba(130, 160, 255, 0.15);
    background: rgba(10, 14, 28, 0.5);
  }
  .pm-title { font-size: 19px; font-weight: 600; color: #eef2ff; }
  .pm-count-pill {
    font-size: 12px; font-weight: 600;
    color: #9cc2ff;
    background: rgba(110, 162, 255, 0.14);
    border: 1px solid rgba(130, 160, 255, 0.35);
    border-radius: 999px;
    padding: 4px 12px;
    white-space: nowrap;
  }
  .pm-x {
    margin-left: auto;
    width: 34px; height: 34px; flex: 0 0 auto;
    border-radius: 50%;
    border: 1px solid rgba(130, 160, 255, 0.35);
    background: rgba(10, 14, 28, 0.7);
    color: #cfd8f5; font-size: 17px; line-height: 1;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, border-color .15s;
  }
  .pm-x:hover { background: rgba(110, 162, 255, 0.15); border-color: rgba(130, 160, 255, 0.6); }

  /* ---- scope + search ---- */
  .pm-body {
    display: flex; flex-direction: column; gap: 12px;
    padding: 16px 22px;
    flex: 1; min-height: 0;
  }
  .pm-scope {
    display: flex; align-items: center; gap: 8px;
    font-size: 12.5px; color: #8ea0cc;
  }
  .pm-scope .pm-chip {
    font-size: 11.5px; color: #cdd7f5;
    background: rgba(40, 52, 86, 0.8);
    border: 1px solid rgba(130, 160, 255, 0.25);
    border-radius: 999px;
    padding: 3px 10px;
  }
  .pm-search {
    display: flex; align-items: center;
    background: rgba(8, 12, 26, 0.85);
    border: 1px solid rgba(130, 160, 255, 0.25);
    border-radius: 12px;
    padding: 0 12px;
    transition: border-color .2s;
  }
  .pm-search:focus-within { border-color: #6ea2ff; }
  .pm-search .pm-ic { color: #6ea2ff; font-size: 15px; margin-right: 6px; }
  .pm-search input {
    flex: 1; background: transparent; border: none; outline: none;
    color: #eef2ff; font: inherit; font-size: 14px;
    padding: 11px 4px;
  }
  .pm-search input::placeholder { color: #7386b3; }
  @keyframes pmSp { to { transform: rotate(360deg); } }
  .pm-spin {
    width: 15px; height: 15px; flex: 0 0 auto;
    border: 2px solid rgba(255, 255, 255, 0.25);
    border-top-color: #9cc2ff;
    border-radius: 50%;
    animation: pmSp .7s linear infinite;
  }

  /* ---- product grid ---- */
  .pm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    gap: 10px;
    overflow-y: auto;
    padding-right: 4px;
    flex: 1; min-height: 220px;
    align-content: start;
  }
  .pm-grid::-webkit-scrollbar { width: 6px; }
  .pm-grid::-webkit-scrollbar-thumb { background: rgba(130, 160, 255, 0.25); border-radius: 6px; }
  .pm-prod {
    position: relative;
    border-radius: 12px; overflow: hidden;
    cursor: pointer; user-select: none;
    background: linear-gradient(180deg, rgba(27, 33, 58, 0.96) 0%, rgba(15, 19, 33, 0.96) 100%);
    border: 1px solid rgba(130, 160, 255, 0.18);
    transition: border-color .2s, box-shadow .2s, transform .15s;
  }
  .pm-prod:hover { border-color: rgba(130, 160, 255, 0.5); transform: translateY(-2px); }
  .pm-prod.sel {
    border-color: rgba(130, 195, 255, 0.7);
    box-shadow: 0 0 0 1px rgba(130, 195, 255, 0.4), 0 0 18px rgba(61, 147, 255, 0.4);
  }
  .pm-prod img, .pm-prod .pm-noimg {
    width: 100%; aspect-ratio: 1; object-fit: cover; display: block;
    background: #131a2e;
  }
  .pm-prod .pm-noimg {
    display: flex; align-items: center; justify-content: center;
    color: #6a7ba8; font-size: 11px;
  }
  .pm-prod .pm-pbody { padding: 8px 9px 9px; }
  .pm-prod .pm-pname {
    font-size: 12px; line-height: 1.35; color: #dbe4fb;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; min-height: 2.7em;
  }
  .pm-prod .pm-pprice { font-size: 11px; color: #8ea0cc; margin-top: 3px; }
  .pm-prod .pm-tick {
    position: absolute; top: 7px; right: 7px;
    width: 22px; height: 22px; border-radius: 50%;
    background: linear-gradient(180deg, #6ea2ff, #3b73ff);
    color: #fff; font-size: 12px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 12px rgba(61, 147, 255, 0.7);
  }

  /* ---- empty / loading states ---- */
  .pm-empty {
    flex: 1; min-height: 220px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 8px;
    text-align: center;
    color: #8ea0cc; font-size: 13.5px; line-height: 1.6;
    border: 1px dashed rgba(130, 160, 255, 0.25);
    border-radius: 12px;
    padding: 26px 20px;
  }
  .pm-empty .pm-emoji { font-size: 26px; }

  /* ---- footer ---- */
  .pm-foot {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 22px;
    border-top: 1px solid rgba(130, 160, 255, 0.15);
    background: rgba(8, 12, 26, 0.55);
  }
  .pm-selinfo { font-size: 13px; color: #9fb0d8; }
  .pm-selinfo b { color: #9cc2ff; }
  .pm-btn {
    border: none; border-radius: 10px;
    padding: 10px 18px;
    font: inherit; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: .15s;
  }
  .pm-btn:disabled { opacity: .5; cursor: default; }
  .pm-btn.gho {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.07);
    color: #cfd8f5;
    border: 1px solid rgba(255, 255, 255, 0.16);
  }
  .pm-btn.gho:hover { background: rgba(110, 162, 255, 0.12); }
  .pm-btn.pri {
    background: linear-gradient(180deg, #6ea2ff, #3b73ff);
    color: #fff;
    box-shadow: 0 0 14px rgba(61, 147, 255, 0.35);
  }
  .pm-btn.pri:hover:not(:disabled) { filter: brightness(1.08); }
`;

const ProductModal: FC<ProductModalProps> = ({
  onClose,
  onSave,
  selectedIds,
  collectionIds = [],
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>(selectedIds || []);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch products (optionally scoped to the chosen collections). If several
  // collections are selected, products of each are fetched and de-duplicated.
  const fetchProducts = useCallback(
    async (query: string): Promise<void> => {
      setLoading(true);
      try {
        let list: Product[] = [];
        if (collectionIds.length > 0) {
          const results = await Promise.all(
            collectionIds.map((cid) => {
              const params: any = { collection: cid };
              if (query) params.search = query;
              return ApiService.get(ApiConfig.PRODUCTS, params).catch(() => []);
            })
          );
          const seen = new Set<string>();
          results.flat().forEach((p: Product) => {
            if (p && !seen.has(p.id)) {
              seen.add(p.id);
              list.push(p);
            }
          });
        } else {
          const params: any = {};
          if (query) params.search = query;
          const data = await ApiService.get(ApiConfig.PRODUCTS, params);
          list = data || [];
        }
        setProducts(list);
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [collectionIds]
  );

  useEffect(() => {
    fetchProducts("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  const onSearch = (value: string): void => {
    setSearch(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchProducts(value), 300);
  };

  const toggle = (id: string): void => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_PRODUCTS) return prev; // cap reached
      return [...prev, id];
    });
  };

  const save = (): void => {
    onSave(selected);
    onClose();
  };

  return (
    <div className="pm-ov">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pm-bd" onClick={onClose} />
      <div className="pm-card">
        {/* Header */}
        <div className="pm-head">
          <span className="pm-title">Select Products</span>
          <span className="pm-count-pill">
            {selected.length} / {MAX_PRODUCTS} selected
          </span>
          <button type="button" className="pm-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="pm-body">
          <div className="pm-scope">
            {collectionIds.length > 0 ? (
              <>
                Showing products from
                <span className="pm-chip">
                  {collectionIds.length} selected collection
                  {collectionIds.length > 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <>
                Showing <span className="pm-chip">All products</span>
                <span>— pick Collections first to narrow this down</span>
              </>
            )}
          </div>

          <div className="pm-search">
            <span className="pm-ic">🔍</span>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
            {loading && <span className="pm-spin" />}
          </div>

          {loading && products.length === 0 ? (
            <div className="pm-empty">
              <span className="pm-spin" />
              Loading products…
            </div>
          ) : products.length === 0 ? (
            <div className="pm-empty">
              <span className="pm-emoji">🛍️</span>
              <span>
                No products found{search ? <> for “{search}”</> : ""}.
                <br />
                Try a different search
                {collectionIds.length > 0 ? " or change your collections" : ""}.
              </span>
            </div>
          ) : (
            <div className="pm-grid">
              {products.map((p) => {
                const isSel = selected.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={"pm-prod" + (isSel ? " sel" : "")}
                    onClick={() => toggle(p.id)}
                  >
                    {isSel && <span className="pm-tick">✓</span>}
                    {p.image ? (
                      <img src={p.image} alt={p.title} />
                    ) : (
                      <div className="pm-noimg">No image</div>
                    )}
                    <div className="pm-pbody">
                      <div className="pm-pname">{p.title}</div>
                      <div className="pm-pprice">
                        {p.price} {p.currency}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pm-foot">
          <span className="pm-selinfo">
            <b>{selected.length}</b> of <b>{MAX_PRODUCTS}</b> products selected
          </span>
          <button type="button" className="pm-btn gho" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="pm-btn pri"
            disabled={selected.length === 0}
            onClick={save}
          >
            Save selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;