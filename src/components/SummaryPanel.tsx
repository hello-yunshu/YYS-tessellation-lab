import React, { useState } from "react";
import AIExplainButton from "./AIExplainButton";

export default function SummaryPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="card" data-ai-explain-id="summary-panel" style={{ position: "relative" }}>
      <AIExplainButton explainId="summary-panel" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "0", color: "var(--text)" }}>
          今天我们发现了什么？
        </h2>
        <span
          style={{
            fontSize: "20px",
            transition: "transform var(--transition)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>

      {open && (
        <div className="fade-in" style={{ marginTop: "16px" }}>
          <ol
            style={{
              paddingLeft: "24px",
              fontSize: "16px",
              lineHeight: "2",
              color: "var(--text-secondary)",
            }}
          >
            <li>密铺要做到：<strong style={{ color: "var(--primary)" }}>无空隙、不重叠</strong>。</li>
            <li>
              有些图形可以单独密铺，如
              <strong style={{ color: "var(--success)" }}>三角形、四边形、正六边形</strong>。
            </li>
            <li>
              有些图形不能单独密铺，但可以
              <strong style={{ color: "var(--accent)" }}>和其他图形组合密铺</strong>。
            </li>
            <li>
              数学中的图形规律，也能创造<strong style={{ color: "var(--primary)" }}>生活中的美</strong>。
            </li>
          </ol>
        </div>
      )}
    </section>
  );
}