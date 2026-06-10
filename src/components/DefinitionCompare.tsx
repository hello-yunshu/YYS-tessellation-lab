import React, { useState } from "react";
import { useApp } from "../AppContext";
import AIExplainButton from "./AIExplainButton";

function TilingDemo({ type }: { type: "perfect" | "gap" | "overlap" }) {
  const size = 20;
  const gap = type === "gap" ? 6 : type === "overlap" ? -4 : 0;
  const colors = ["#A8D8EA", "#FFD3B6", "#DCEED1", "#AA96DA", "#FCBAD3", "#FFFFD2"];

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
    // 精确 viewBox：内容居中 + 四周等距 padding，确保不超出画布
    const cols = 4, rows = 3, pad = 4;
    const cw = (cols - 1) * (size + gap) + size;
    const ch = (rows - 1) * (size + gap) + size;
    return (
      <svg viewBox={`${-pad} ${-pad} ${cw + pad * 2} ${ch + pad * 2}`} xmlns="http://www.w3.org/2000/svg">
        {tiles.map((t, i) => (
          <rect key={i} x={t.x} y={t.y} width={size} height={size} fill={t.color} rx="2" />
        ))}
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
    // 精确 viewBox：内容居中 + 四周等距 padding，确保不超出画布
    const cols = 4, rows = 3, pad = 4;
    const cw = (cols - 1) * (size + gap) + size;
    const ch = (rows - 1) * (size + gap) + size;
    const vbW = cw + pad * 2;
    const vbH = ch + pad * 2;
    return (
      <svg viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`} xmlns="http://www.w3.org/2000/svg">
        <rect x={-pad} y={-pad} width={vbW} height={vbH} fill="#f5f5f5" />
        {tiles2.map((t, i) => (
          <rect key={i} x={t.x} y={t.y} width={size} height={size} fill={t.color} rx="2" />
        ))}
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

  // 精确计算 viewBox：最右/最下边缘 = 最后一个瓦片的右下角
  const cols = 4;
  const rows = 3;
  const padding = 2;
  const exactW = (cols - 1) * (size + gap) + size + padding * 2;
  const exactH = (rows - 1) * (size + gap) + size + padding * 2;

  return (
    <svg viewBox={`${-padding} ${-padding} ${exactW} ${exactH}`} xmlns="http://www.w3.org/2000/svg">
      {tiles3.map((t, i) => (
        <rect key={i} x={t.x} y={t.y} width={size} height={size} fill={t.color} rx="2" opacity="0.85" stroke="#666" strokeWidth="1" />
      ))}
    </svg>
  );
}

const judgments = [
  { type: "perfect" as const, label: "正确密铺" },
  { type: "gap" as const, label: "有空隙" },
  { type: "overlap" as const, label: "有重叠" },
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

  const toggleReveal = (type: string) => {
    setRevealed((prev) => ({ ...prev, [type]: !prev[type] }));
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
              <TilingDemo type={j.type} />
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