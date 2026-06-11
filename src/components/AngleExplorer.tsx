import React, { useState } from "react";
import { useApp } from "../AppContext";
import { getShapeConfig, type ShapeType } from "../utils/tiling";
import { degToRad } from "../utils/geometry";
import AIExplainButton from "./AIExplainButton";

export default function AngleExplorer() {
  const { selectedShape, teacherMode } = useApp();
  const config = getShapeConfig(selectedShape);

  if (!config.angleInfo) {
    return (
      <div className="card angle-explorer" data-ai-explain-id="angle-explorer" style={{ textAlign: "center", padding: "40px", position: "relative" }}>
        <AIExplainButton explainId="angle-explorer" />
        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "16px", color: "var(--text)" }}>
          角度观察器
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          选择正三角形、正方形、长方形、正六边形或正五边形来查看角度演示。
        </p>
      </div>
    );
  }

  return <AngleExplorerInner config={config} />;
}

function AngleExplorerInner({
  config,
}: {
  config: ReturnType<typeof getShapeConfig>;
}) {
  const { teacherMode } = useApp();
  const [count, setCount] = useState(0);
  const angle = config.angleInfo!.interiorAngle;
  const total = count * angle;
  const isFull = total === 360;
  const isOver = total > 360;
  const isUnder = total < 360;

  // Generate SVG arc segments
  const arcs = [];
  const cx = 100;
  const cy = 100;
  const r = 70;
  // First arc starts from top (-90°). Each subsequent segment starts from where the previous ends.
  for (let i = 0; i < count; i++) {
    const startAngle = -90 + i * angle;
    const startRad = degToRad(startAngle);
    const endRad = degToRad(startAngle + angle);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const fillColor = ["#A8D8EA", "#FFD3B6", "#DCEED1", "#AA96DA", "#FCBAD3", "#FFFFD2"][i % 6];

    arcs.push(
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={fillColor}
        stroke="#666"
        strokeWidth="1.5"
        opacity="0.8"
      />
    );
  }

  // Full circle reference
  const circle = (
    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="4 2" />
  );

  return (
    <div className="card angle-explorer" data-ai-explain-id="angle-explorer" style={{ position: "relative" }}>
      <AIExplainButton explainId="angle-explorer" />
      <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "16px", color: "var(--text)" }}>
        角度观察器
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "14px" }}>
        {config.name}一个角是 {angle}°，点击按钮看看能不能正好围满一圈。
      </p>

      <div className="angle-circle">
        <svg viewBox="0 0 200 200">
          {circle}
          {arcs}
          {/* Center point */}
          <circle cx={cx} cy={cy} r="3" fill="#333" />
        </svg>
      </div>

      <div className="angle-info" style={{ minHeight: "40px" }}>
        {count > 0 && (
          <div className={isFull ? "full" : isOver ? "over" : "under"}>
            {angle}° × {count} = {total}°
            {isFull && <span> ✅ 刚好铺满一周！</span>}
            {isUnder && <span>（还差 {360 - total}°）</span>}
            {isOver && <span>（超出了 {total - 360}°）</span>}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          className="btn btn-primary"
          onClick={() => setCount(count + 1)}
          disabled={isOver}
        >
          增加一个角
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setCount(Math.max(0, count - 1))}
          disabled={count === 0}
        >
          减少一个角
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => setCount(0)}>
          重置
        </button>
      </div>

      {teacherMode && (
        <div className="fade-in" style={{ marginTop: "16px", padding: "12px", background: "var(--primary-light)", borderRadius: "var(--radius-sm)", fontSize: "15px", color: "var(--primary)", textAlign: "left" }}>
          <pre style={{ margin: "0 0 8px", fontFamily: "inherit", fontSize: "14px" }}>
            {config.angleInfo!.aroundPoint}
          </pre>
          <p>{config.angleInfo!.conclusion}</p>
        </div>
      )}
    </div>
  );
}