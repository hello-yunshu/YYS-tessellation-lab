import React from "react";

export default function Header() {
  return (
    <header style={{ textAlign: "center", padding: "32px 0 16px" }}>
      <h1
        style={{
          fontSize: "var(--font-size-2xl)",
          fontWeight: 800,
          color: "var(--primary)",
          letterSpacing: "1px",
        }}
      >
        《奇妙的图形密铺》
      </h1>
      <p
        style={{
          fontSize: "18px",
          color: "var(--text-secondary)",
          marginTop: "8px",
        }}
      >
        无空隙、不重叠，图形也能铺出规律和美。
      </p>
    </header>
  );
}