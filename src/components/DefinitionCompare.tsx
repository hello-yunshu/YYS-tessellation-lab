import React, { useState } from "react";
import { useApp } from "../AppContext";
import AIExplainButton from "./AIExplainButton";

function TilingDemo({ type, revealed, animTrigger }: { type: "perfect" | "gap" | "overlap"; revealed: boolean; animTrigger: number }) {
  const size = 20;
  const gap = type === "gap" ? 6 : type === "overlap" ? -4 : 0;
  const colors = ["#A8D8EA", "#FFD3B6", "#DCEED1", "#AA96DA", "#FCBAD3", "#FFFFD2"];
  const animActive = revealed || animTrigger > 0;
  const animClass = animActive ? `tile-anim tile-anim-${type}` : "";
  // 用 key 强制重挂载 <g>，每次 animTrigger 变化都能重播动画
  const gKey = animTrigger || 0;

  // 情况A 每个方块的随机动画延迟（涟漪效果）
  const perfectDelays = React.useMemo(() => {
    const delays: number[] = [];
    for (let i = 0; i < 12; i++) {
      delays.push(Math.round(Math.random() * 500) / 1000); // 0 ~ 0.5s
    }
    return delays;
  }, []);

  if (type === "perfect") {
    const tiles: { x: number; y: number; color: string }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        tiles.push({
          x: c * (size + gap),
          y: r * (size + gap),
          color: colors[(r + c) % colors.length],
        });
      }
    }
    const cols = 4, rows = 3, pad = 4;
    const cw = (cols - 1) * (size + gap) + size;
    const ch = (rows - 1) * (size + gap) + size;
    return (
      <svg viewBox={`${-pad} ${-pad} ${cw + pad * 2} ${ch + pad * 2}`} xmlns="http://www.w3.org/2000/svg">
        <g key={gKey} className={animClass}>
          {tiles.map((t, i) => (
            <rect
              key={i}
              x={t.x} y={t.y} width={size} height={size}
              fill={t.color} rx="2"
              style={{ '--delay': `${perfectDelays[i]}s` } as React.CSSProperties}
            />
          ))}
        </g>
      </svg>
    );
  }

  if (type === "gap") {
    const tiles2: { x: number; y: number; color: string }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        tiles2.push({
          x: c * (size + gap),
          y: r * (size + gap),
          color: colors[(r + c) % colors.length],
        });
      }
    }
    const cols = 4, rows = 3, pad = 4;
    const cw = (cols - 1) * (size + gap) + size;
    const ch = (rows - 1) * (size + gap) + size;
    const vbW = cw + pad * 2;
    const vbH = ch + pad * 2;
    return (
      <svg viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`} xmlns="http://www.w3.org/2000/svg">
        <rect x={-pad} y={-pad} width={vbW} height={vbH} fill="#f5f5f5" />
        <g key={gKey} className={animClass}>
          {tiles2.map((t, i) => (
            <rect key={i} x={t.x} y={t.y} width={size} height={size} fill={t.color} rx="2" />
          ))}
        </g>
      </svg>
    );
  }

  // overlap — 随机 z-order，确保不超出画布
  const tiles3 = React.useMemo(() => {
    const tiles: { x: number; y: number; color: string }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        tiles.push({
          x: c * (size + gap),
          y: r * (size + gap),
          color: colors[(r + c) % colors.length],
        });
      }
    }
    // Fisher–Yates 洗牌：随机化图层上下顺序
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
  }, []);

  const cols = 4;
  const rows = 3;
  const padding = 2;
  const exactW = (cols - 1) * (size + gap) + size + padding * 2;
  const exactH = (rows - 1) * (size + gap) + size + padding * 2;

  return (
    <svg viewBox={`${-padding} ${-padding} ${exactW} ${exactH}`} xmlns="http://www.w3.org/2000/svg">
      <g key={gKey} className={animClass}>
        {tiles3.map((t, i) => (
          <rect key={i} x={t.x} y={t.y} width={size} height={size} fill={t.color} rx="2" opacity="0.85" stroke="#666" strokeWidth="1" />
        ))}
      </g>
    </svg>
  );
}

const judgments = [
  { type: "perfect" as const, label: "情况 A" },
  { type: "gap" as const, label: "情况 B" },
  { type: "overlap" as const, label: "情况 C" },
];

function getJudgment(type: string) {
  switch (type) {
    case "perfect":
      return { noGap: true, noOverlap: true, isTiling: true };
    case "gap":
      return { noGap: false, noOverlap: true, isTiling: false };
    case "overlap":
      return { noGap: true, noOverlap: false, isTiling: false };
    default:
      return { noGap: false, noOverlap: false, isTiling: false };
  }
}

export default function DefinitionCompare() {
  const { teacherMode } = useApp();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [animCount, setAnimCount] = useState<Record<string, number>>({});

  const toggleReveal = (type: string) => {
    setRevealed((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const triggerAnim = (type: string) => {
    setAnimCount((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
  };

  return (
    <section className="card" data-ai-explain-id="definition-compare" style={{ position: "relative" }}>
      <AIExplainButton explainId="definition-compare" />
      <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "16px", color: "var(--text)" }}>
        什么是密铺？
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
        观察下面三种情况，想一想：哪一种才是真正的密铺？
      </p>
      <div className="def-compare">
        {judgments.map((j) => {
          const result = getJudgment(j.type);
          const shown = revealed[j.type];
          return (
            <div key={j.type} className="compare-item">
              <div
                onClick={() => triggerAnim(j.type)}
                style={{ cursor: "pointer" }}
                title="点击查看动画"
              >
                <TilingDemo type={j.type} revealed={!!revealed[j.type]} animTrigger={animCount[j.type] || 0} />
              </div>
              <p style={{ fontWeight: 600, margin: "8px 0" }}>{j.label}</p>
              {!shown ? (
                <button className="btn btn-outline btn-sm" onClick={() => toggleReveal(j.type)}>
                  判断
                </button>
              ) : (
                <div className="fade-in">
                  <div className="judge-row">
                    <span className="judge-label">是否无空隙：</span>
                    <span>{result.noGap ? <span className="icon-check">✅</span> : <span className="icon-cross">❌</span>}</span>
                  </div>
                  <div className="judge-row">
                    <span className="judge-label">是否不重叠：</span>
                    <span>{result.noOverlap ? <span className="icon-check">✅</span> : <span className="icon-cross">❌</span>}</span>
                  </div>
                  <div className="judge-row">
                    <span className="judge-label">密铺：</span>
                    <span>
                      {result.isTiling ? (
                        <span className="tag tag-success">是密铺</span>
                      ) : (
                        <span className="tag tag-danger">不是密铺</span>
                      )}
                    </span>
                  </div>
                  {teacherMode && (
                    <p style={{ marginTop: "8px", fontSize: "13px", color: "var(--primary)" }}>
                      {result.isTiling
                        ? "图形紧密排列，无空隙、不重叠，可以不断延展。"
                        : result.noGap === false
                        ? "图形之间有白色缝隙，说明没有铺满。"
                        : "图形互相压住了，说明有重叠。"}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}