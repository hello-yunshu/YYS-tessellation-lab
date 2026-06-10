import React, { useState, useRef, useCallback, type MouseEvent } from "react";
import { shapeConfigs, type ShapeType } from "../utils/tiling";
import {
  regularPolygonPoints,
  rotatePoint,
  pointsToSvg,
  polygonBounds,
  type Point,
} from "../utils/geometry";
import AIExplainButton from "./AIExplainButton";

interface DraggedShape {
  id: string;
  type: ShapeType;
  points: Point[];
  color: string;
  x: number;
  y: number;
  rotation: number;
}

const toolShapes: ShapeType[] = [
  "equilateral-triangle",
  "square",
  "rectangle",
  "parallelogram",
  "trapezoid",
  "hexagon",
  "pentagon",
  "octagon",
];

// 所有图形尺寸设计为 10 的倍数，配合 SNAP_GRID=10 实现密铺
// 正三角形/正六边形因 √3 无法同时为正多边形且 10 整除，故做微调
function getBasePoints(type: ShapeType): Point[] {
  switch (type) {
    case "equilateral-triangle":
      // 底40 高30，两个拼成 40×30 矩形
      return [
        { x: 0, y: -15 },
        { x: 20, y: 15 },
        { x: -20, y: 15 },
      ];
    case "square":
      // 边长30
      return [
        { x: -15, y: -15 },
        { x: 15, y: -15 },
        { x: 15, y: 15 },
        { x: -15, y: 15 },
      ];
    case "rectangle":
      // 50×30
      return [
        { x: -25, y: -15 },
        { x: 25, y: -15 },
        { x: 25, y: 15 },
        { x: -25, y: 15 },
      ];
    case "parallelogram":
      // 底40 高30 偏移10
      return [
        { x: -20, y: -15 },
        { x: 20, y: -15 },
        { x: 30, y: 15 },
        { x: -10, y: 15 },
      ];
    case "trapezoid":
      // 上20 下40 高30
      return [
        { x: -10, y: -15 },
        { x: 10, y: -15 },
        { x: 20, y: 15 },
        { x: -20, y: 15 },
      ];
    case "hexagon":
      // 宽40 高40，尖顶六边形，可密铺：水平间距40，行间距30，奇数行偏移20
      return [
        { x: 0, y: -20 },
        { x: 20, y: -10 },
        { x: 20, y: 10 },
        { x: 0, y: 20 },
        { x: -20, y: 10 },
        { x: -20, y: -10 },
      ];
    case "pentagon":
      return regularPolygonPoints(5, 20);
    case "octagon":
      return regularPolygonPoints(8, 20);
    default:
      return regularPolygonPoints(4, 20);
  }
}

const ROTATION_STEPS = [15, 30, 45, 60, 90];

export default function DragPlayground() {
  const [shapes, setShapes] = useState<DraggedShape[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [wasDragging, setWasDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  const addShape = (type: ShapeType) => {
    const config = shapeConfigs.find((s) => s.id === type)!;
    const baseIcon = getBasePoints(type);
    const newShape: DraggedShape = {
      id: `shape-${idCounter.current++}`,
      type,
      points: baseIcon,
      color: config.color,
      x: Math.round((60 + Math.random() * 100) / 10) * 10,
      y: Math.round((60 + Math.random() * 100) / 10) * 10,
      rotation: 0,
    };
    setShapes((prev) => [...prev, newShape]);
    setWarning(null);
  };

  const getTransformedPoints = (shape: DraggedShape): Point[] => {
    return shape.points.map((p) => {
      const rotated = rotatePoint(p, shape.rotation);
      return { x: rotated.x + shape.x, y: rotated.y + shape.y };
    });
  };

  const SNAP_GRID = 10;

  // 将鼠标客户端坐标转换为 SVG viewBox 坐标
  const clientToViewBox = (clientX: number, clientY: number) => {
    const svgEl = canvasRef.current?.querySelector("svg");
    if (!svgEl) return { x: clientX, y: clientY };
    const svgRect = svgEl.getBoundingClientRect();
    return {
      x: ((clientX - svgRect.left) / svgRect.width) * 600,
      y: ((clientY - svgRect.top) / svgRect.height) * 400,
    };
  };

  const handleMouseDown = (e: MouseEvent, shapeId: string) => {
    e.stopPropagation();
    const shape = shapes.find((s) => s.id === shapeId);
    if (!shape) return;
    const vbPos = clientToViewBox(e.clientX, e.clientY);
    setDragging(shapeId);
    setSelectedId(shapeId);
    setDragOffset({
      x: vbPos.x - shape.x,
      y: vbPos.y - shape.y,
    });
  };

  const handleCanvasClick = () => {
    if (wasDragging) {
      setWasDragging(false);
      return;
    }
    setSelectedId(null);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const vbPos = clientToViewBox(e.clientX, e.clientY);
    let x = vbPos.x - dragOffset.x;
    let y = vbPos.y - dragOffset.y;
    if (snapToGrid) {
      x = Math.round(x / SNAP_GRID) * SNAP_GRID;
      y = Math.round(y / SNAP_GRID) * SNAP_GRID;
    }
    setShapes((prev) =>
      prev.map((s) => (s.id === dragging ? { ...s, x, y } : s))
    );
  };

  const handleMouseUp = () => {
    if (dragging) {
      // Check overlap
      const movedShape = shapes.find((s) => s.id === dragging);
      if (movedShape) {
        const movedBounds = polygonBounds(getTransformedPoints(movedShape));
        for (const other of shapes) {
          if (other.id === dragging) continue;
          const otherBounds = polygonBounds(getTransformedPoints(other));
          if (rectsOverlapSimple(movedBounds, otherBounds)) {
            setWarning("可能有重叠，请检查！");
            break;
          }
        }
      }
    }
    setDragging(null);
    setWasDragging(true);
  };

  const rotateShape = (shapeId: string, angle: number) => {
    setShapes((prev) =>
      prev.map((s) =>
        s.id === shapeId ? { ...s, rotation: s.rotation + angle } : s
      )
    );
  };

  const deleteShape = (shapeId: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== shapeId));
    setSelectedId(null);
    setWarning(null);
  };

  const clearAll = () => {
    setShapes([]);
    setSelectedId(null);
    setWarning(null);
  };

  return (
    <section className="card" data-ai-explain-id="drag-playground" style={{ position: "relative" }}>
      <AIExplainButton explainId="drag-playground" />
      <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "16px", color: "var(--text)" }}>
        拖拽拼摆区
      </h2>
      <div className="drag-playground">
        {/* Toolbox */}
        <div className="drag-toolbox">
          <p className="section-label">图形工具箱</p>
          <div className="tool-items">
          {toolShapes.map((type) => {
            const cfg = shapeConfigs.find((s) => s.id === type)!;
            return (
              <div
                key={type}
                className="tool-item"
                onClick={() => addShape(type)}
                title={`添加${cfg.name}`}
              >
                {cfg.name}
              </div>
            );
          })}
          </div>
          <div className="divider" />

          <p className="section-label">图形操作</p>
          <div className="tool-ops">
            {selectedId ? (
              <span className="status-text">
                已选中 {shapeConfigs.find((s) => s.id === shapes.find((sh) => sh.id === selectedId)!.type)?.name}
              </span>
            ) : (
              <span className="status-text">点击图形来选中</span>
            )}
            <span className="rotate-label">旋转:</span>
            <div className="rotate-btns">
              {ROTATION_STEPS.map((step) => (
                <button
                  key={step}
                  className="btn btn-outline btn-sm"
                  disabled={!selectedId}
                  onClick={() => selectedId && rotateShape(selectedId, step)}
                >
                  {step}°
                </button>
              ))}
            </div>
            <button
              className="btn btn-danger btn-sm"
              disabled={!selectedId}
              onClick={() => selectedId && deleteShape(selectedId)}
            >
              删除
            </button>
          </div>
          <div className="divider" />

          <div className="bottom-actions">
            <label>
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
              />
              吸附到网格
            </label>
            <button
              className="btn btn-danger btn-sm"
              onClick={clearAll}
            >
              一键清空
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="drag-canvas"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          style={{ minHeight: "400px" }}
        >
          <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
            {/* Grid - matches SNAP_GRID=10, major lines every 50 */}
            {snapToGrid &&
              Array.from({ length: 61 }).map((_, i) => (
                <line
                  key={`gv-${i}`}
                  x1={i * 10}
                  y1={0}
                  x2={i * 10}
                  y2={400}
                  stroke={i % 5 === 0 ? "#d0d0d0" : "#e8e8e8"}
                  strokeWidth={i % 5 === 0 ? "0.8" : "0.4"}
                />
              ))}
            {snapToGrid &&
              Array.from({ length: 41 }).map((_, i) => (
                <line
                  key={`gh-${i}`}
                  x1={0}
                  y1={i * 10}
                  x2={600}
                  y2={i * 10}
                  stroke={i % 5 === 0 ? "#d0d0d0" : "#e8e8e8"}
                  strokeWidth={i % 5 === 0 ? "0.8" : "0.4"}
                />
              ))}
            {shapes.map((shape) => {
              const pts = getTransformedPoints(shape);
              const isSelected = selectedId === shape.id || dragging === shape.id;
              return (
                <g key={shape.id}>
                  <polygon
                    points={pointsToSvg(pts)}
                    fill={shape.color}
                    stroke={isSelected ? "#333" : "#888"}
                    strokeWidth={isSelected ? 2 : 1}
                    opacity={0.85}
                    cursor="move"
                    onMouseDown={(e) => handleMouseDown(e, shape.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: "all" }}
                  />
                </g>
              );
            })}
          </svg>

          {warning && (
            <div
              className="fade-in"
              style={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--danger-light)",
                color: "var(--danger)",
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {warning}
            </div>
          )}

          {shapes.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "var(--text-muted)",
                fontSize: "14px",
                pointerEvents: "none",
              }}
            >
              从左侧工具箱拖入图形开始拼摆
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function rectsOverlapSimple(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}