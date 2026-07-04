"use client";
import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import ApiService from "../app/lib/service";
import ApiConfig from "../app/lib/apiConfig";

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
  selectedIds?: string[];
  collectionIds?: string[]; // selected collections to filter by
}

const ProductModal: FC<ProductModalProps> = ({
  onClose,
  onSave,
  selectedIds = [],
  collectionIds = [],
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(
    async (query: string) => {
      setLoading(true);
      try {
        const params: any = {};
        if (query) params.search = query;
        if (collectionIds.length > 0) {
          params.collections = collectionIds.join(","); // adjust key if your API expects different
        }
        const res = await ApiService.get(ApiConfig.PRODUCTS, params);
        setProducts(res || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    },
    [collectionIds]
  );

  // Initial fetch
  useEffect(() => {
    fetchProducts("");
  }, [fetchProducts]);

  // Debounced search handler
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchProducts(value);
    }, 300);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) return prev; // campaign DTO max 2
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
      <div className="cardhost open" style={{ maxWidth: "800px" }}>
        <div className="card">
          <div className="cardtop">
            <h3>Select 2 Products</h3>
          </div>
          <div className="sub">
            {collectionIds.length > 0
              ? "Products filtered by selected collections"
              : "All products (no collections selected)"}
          </div>

          {/* Search box */}
          <div className="product-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {loading && <span className="loading-spinner spin" />}
          </div>

          {/* Product grid */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              maxHeight: "60vh",
              overflowY: "auto",
              marginTop: "12px",
            }}
          >
            {products.length === 0 && !loading && (
              <div style={{ color: "#8ea0cc", padding: "1rem" }}>No products found.</div>
            )}
            {products.map((prod) => {
              const isSelected = selected.has(prod.id);
              return (
                <div
                  key={prod.id}
                  className={`prod-card ${isSelected ? "sel" : ""}`}
                  onClick={() => toggle(prod.id)}
                  style={{ width: "130px", cursor: "pointer" }}
                >
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.title}
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "80px",
                        background: "#1a1e2e",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: "#6a6e80",
                      }}
                    >
                      No img
                    </div>
                  )}
                  <div className="prod-name" style={{ marginTop: "4px", fontWeight: 600 }}>
                    {prod.title}
                  </div>
                  <div className="prod-price" style={{ fontSize: "11px", color: "#8ea0cc" }}>
                    {prod.price} {prod.currency}
                  </div>
                  {isSelected && (
                    <div style={{ marginTop: "2px", fontSize: "10px", color: "#6ea2ff" }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>

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

export default ProductModal;