import { useMemo, useState, useEffect } from "react";
import { useApp } from "../AppContext";
import { getShapeConfig } from "../utils/tiling";
import { pointsToSvg } from "../utils/geometry";

export default function TilingCanvas() {
  const {
    selectedShape,
    showBorders,
    showVertices,
    showConclusion,
    teacherMode,
  } = useApp();

  // 宽屏用小尺寸(80%)，窄屏保持原尺寸
  const [isWide, setIsWide] = useState(() => window.innerWidth > 600);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 601px)");
    const handler = (e: MediaQueryListEvent) => setIsWide(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const config = getShapeConfig(selectedShape);
  const tileSize = isWide ? 13 : 28;
  const tiles = useMemo(
    () => config.generateTiles(6, 4, tileSize),
    [selectedShape, tileSize]
  );

  // Calculate SVG viewBox from tiles
  const viewBox = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const tile of tiles) {
      for (const p of tile.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
    }
    const pad = 20;
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
  }, [tiles]);

  // 生成随机动画延迟（基于 selectedShape 确定性伪随机）
  const delays = useMemo(() => {
    // 简单伪随机：用 selectedShape 的 charCode 做种子
    let seed = 0;
    for (let k = 0; k < selectedShape.length; k++) seed += selectedShape.charCodeAt(k);
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    // 分3~5波落下，每波内随机偏移
    const waves = 3 + Math.floor(rand() * 3);
    return tiles.map(() => {
      const wave = Math.floor(rand() * waves);
      return wave * 40 + rand() * 30; // 每波间隔40ms，波内随机0~30ms
    });
  }, [selectedShape, tiles.length]);

  return (
    <div>
      <div className="tiling-canvas">
        <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
          {/* 多边形层 */}
          {tiles.map((tile, i) => (
            <polygon
              key={`${selectedShape}-${i}`}
              points={pointsToSvg(tile.points)}
              fill={tile.fill}
              stroke={showBorders ? "#666" : "none"}
              strokeWidth={showBorders ? 1.5 : 0}
              strokeLinejoin="round"
              className="tile-drop"
              style={{ animationDelay: `${delays[i]}ms` }}
            />
          ))}
          {/* 顶点层 — 置于最上方 */}
          {showVertices &&
            tiles.map((tile, i) =>
              tile.points.map((p, j) => (
                <circle
                  key={`v-${i}-${j}`}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="#333"
                />
              ))
            )}
        </svg>
      </div>

      {showConclusion && (
        <div className={`conclusion ${config.canTile ? "can-tile" : "cannot-tile"} fade-in`}>
          {config.canTile
            ? config.explanation
            : "单独使用这种图形时，容易出现空隙或无法继续铺满。"}
        </div>
      )}

      {teacherMode && config.canTile && (
        <div className="fade-in" style={{ padding: "12px", marginTop: "8px", background: "var(--primary-light)", borderRadius: "var(--radius-sm)", fontSize: "15px", color: "var(--primary)" }}>
          💡 观察这些图形，它们围在一个点的角合起来正好铺满一周。
        </div>
      )}
    </div>
  );
}