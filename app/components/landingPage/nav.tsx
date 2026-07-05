"use client";

export default function Nav() {
  return (
    <header style={{ position: "relative", zIndex: 2, padding: "1rem 2rem" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
          }}
        >
          AI Studio
        </div>
        <div style={{ display: "flex", gap: "1rem", color: "rgba(255,255,255,0.85)" }}>
          <a href="/welcome" style={{ color: "inherit", textDecoration: "none" }}>
            Welcome
          </a>
          <a href="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>
            Dashboard
          </a>
        </div>
      </nav>
    </header>
  );
}
