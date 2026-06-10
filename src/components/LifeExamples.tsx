import React, { useState } from "react";
import { useApp } from "../AppContext";
import AIExplainButton from "./AIExplainButton";

function FloorTiles() {
  const size = 14;
  const rows = 4;
  const cols = 4;
  const boxes: { x: number; y: number; w: number; h: number; color: string }[] = [];
  const colors = ["#F4A460", "#DEB887", "#D2B48C", "#C4A882", "#E8C98E"];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      boxes.push({
        x: c * (size + 0) + 4,
        y: r * (size + 0) + 4,
        w: size,
        h: size,
        color: colors[(r + c) % colors.length],
      });
    }
  }
  return (
    <svg viewBox="2 2 60 60" xmlns="http://www.w3.org/2000/svg">
      {boxes.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          fill={b.color}
          rx="2"
        />
      ))}
    </svg>
  );
}

function Honeycomb() {
  const r = 10;
  // 尖顶六边形：水平间距 sqrt(3)*r，行间距 1.5*r，奇数行偏移
  const dx = r * Math.sqrt(3);
  const dy = r * 1.5;
  const centers: { x: number; y: number; color: string }[] = [];
  const colors2 = ["#FFD700", "#FFC107", "#FFB300", "#FFA000"];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      centers.push({
        x: 20 + col * dx + (row % 2) * (dx / 2),
        y: 15 + row * dy,
        color: colors2[(row + col) % colors2.length],
      });
    }
  }
  // 生成单个尖顶六边形（中心在原点）
  const hexPoints: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (-90 + 60 * i);
    hexPoints.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
  }
  const pointsStr = hexPoints.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox="2 -7 98 74" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <polygon id="hex" points={pointsStr} />
      </defs>
      {centers.map((c, i) => (
        <use key={i} href="#hex" x={c.x} y={c.y} fill={c.color} stroke="#E6A700" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

function Mosaic() {
  const size = 10;
  const shapes: { x: number; y: number; w: number; h: number; color: string }[] = [];
  const colors3 = ["#7B9EBD", "#9BB7D4", "#A0C4E2", "#5B8DB8", "#8DB6CE"];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const x = c * size + 4;
      const y = r * size + 4;
      const mod = (r + c) % 3;
      if (mod === 0) {
        // 满格正方形
        shapes.push({ x, y, w: size, h: size, color: colors3[(r + c) % colors3.length] });
      } else if (mod === 1) {
        // 水平分割：上下两半各不同色，填满格子
        shapes.push({ x, y, w: size, h: size / 2, color: colors3[(r + c) % colors3.length] });
        shapes.push({ x, y: y + size / 2, w: size, h: size / 2, color: colors3[(r + c + 1) % colors3.length] });
      } else {
        // 垂直分割：左右两半各不同色，填满格子
        shapes.push({ x, y, w: size / 2, h: size, color: colors3[(r + c) % colors3.length] });
        shapes.push({ x: x + size / 2, y, w: size / 2, h: size, color: colors3[(r + c + 1) % colors3.length] });
      }
    }
  }
  return (
    <svg viewBox="2 2 48 48" xmlns="http://www.w3.org/2000/svg">
      {shapes.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.color} rx="1" />
      ))}
    </svg>
  );
}

function Patchwork() {
  const triangles: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number; color: string }[] = [];
  const colors4 = ["#D4A5A5", "#C98D8D", "#E8C4C4", "#B8A9C9", "#C4B5D8"];
  const s = 18;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cx = 6 + c * s;
      const cy = 6 + r * s;
      const colorIdx = (r + c) % colors4.length;
      // Upper left triangle
      triangles.push({ x1: cx, y1: cy, x2: cx + s, y2: cy, x3: cx, y3: cy + s, color: colors4[colorIdx] });
      // Lower right triangle
      triangles.push({ x1: cx + s, y1: cy + s, x2: cx + s, y2: cy, x3: cx, y3: cy + s, color: colors4[(colorIdx + 1) % colors4.length] });
    }
  }
  return (
    <svg viewBox="4 4 56 56" xmlns="http://www.w3.org/2000/svg">
      {triangles.map((t, i) => (
        <polygon
          key={i}
          points={`${t.x1},${t.y1} ${t.x2},${t.y2} ${t.x3},${t.y3}`}
          fill={t.color}
          stroke="#999"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}

export default function LifeExamples() {
  const [showHint, setShowHint] = useState(false);

  return (
    <section className="card" data-ai-explain-id="life-examples" style={{ position: "relative" }}>
      <AIExplainButton explainId="life-examples" />
      <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "16px", color: "var(--text)" }}>
        生活中的密铺
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
        这些图案有什么共同特点？
      </p>
      <div className="life-examples">
        <div className="life-item">
          <FloorTiles />
          <p>地砖</p>
        </div>
        <div className="life-item">
          <Honeycomb />
          <p>蜂巢</p>
        </div>
        <div className="life-item">
          <Mosaic />
          <p>马赛克墙面</p>
        </div>
        <div className="life-item">
          <Patchwork />
          <p>拼花图案</p>
        </div>
      </div>
      <div style={{ marginTop: "16px", textAlign: "center" }}>
        {!showHint ? (
          <button className="btn btn-primary" onClick={() => setShowHint(true)}>
            显示数学眼光
          </button>
        ) : (
          <div className="fade-in" style={{ padding: "16px", background: "var(--primary-light)", borderRadius: "var(--radius-sm)" }}>
            <p style={{ fontSize: "16px", color: "var(--primary)", fontWeight: 600 }}>
              它们都是由一些图形有规律地铺成的。图形之间没有空隙，也没有重叠。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}