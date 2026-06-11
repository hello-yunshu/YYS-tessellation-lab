import { useState, useRef, useCallback } from "react";
import { shapeConfigs, type ShapeType } from "../utils/tiling";
import {
  regularPolygonPoints,
  rotatePoint,
  pointsToSvg,
  polygonsOverlap,
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

// 图形基础顶点坐标（正六边形、正三角形使用密铺网格吸附，其他图形对齐 SNAP_GRID=10 网格）
function getBasePoints(type: ShapeType): Point[] {
  switch (type) {
    case "equilateral-triangle":
      return regularPolygonPoints(3, 20);
    case "square":
      return [
        { x: -10, y: -10 },
        { x: 10, y: -10 },
        { x: 10, y: 10 },
        { x: -10, y: 10 },
      ];
    case "rectangle":
      return [
        { x: -20, y: -10 },
        { x: 20, y: -10 },
        { x: 20, y: 10 },
        { x: -20, y: 10 },
      ];
    case "parallelogram":
      return [
        { x: -20, y: -10 },
        { x: 20, y: -10 },
        { x: 30, y: 10 },
        { x: -10, y: 10 },
      ];
    case "trapezoid":
      return [
        { x: -10, y: -10 },
        { x: 10, y: -10 },
        { x: 20, y: 10 },
        { x: -20, y: 10 },
      ];
    case "hexagon":
      return regularPolygonPoints(6, 20);
    case "pentagon":
      return regularPolygonPoints(5, 20);
    case "octagon":
      return regularPolygonPoints(8, 20);
    default:
      return regularPolygonPoints(4, 20);
  }
}

const ROTATION_STEPS = [15, 30, 45, 60, 90];

// SVG viewBox 尺寸
const VB_WIDTH = 600;
const VB_HEIGHT = 400;

export default function DragPlayground() {
  const [shapes, setShapes] = useState<DraggedShape[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const wasDraggingRef = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  const addShape = (type: ShapeType) => {
    const config = shapeConfigs.find((s) => s.id === type)!;
    const baseIcon = getBasePoints(type);
    let x: number, y: number;
    if (type === "hexagon") {
      // 正六边形使用密铺网格：x 半步 = r√3/2，y 行距 = 1.5r
      x = Math.round((60 + Math.random() * 100) / HEX_HALF_STEP) * HEX_HALF_STEP;
      y = Math.round((60 + Math.random() * 100) / HEX_ROW_STEP) * HEX_ROW_STEP;
    } else if (type === "equilateral-triangle") {
      // 正三角形：x 用密铺半步（可拼菱形/边贴边），y 用普通网格（一正一反 y 只差 r/2=10）
      x = Math.round((60 + Math.random() * 100) / HEX_HALF_STEP) * HEX_HALF_STEP;
      y = Math.round((60 + Math.random() * 100) / SNAP_GRID) * SNAP_GRID;
    } else {
      x = Math.round((60 + Math.random() * 100) / SNAP_GRID) * SNAP_GRID;
      y = Math.round((60 + Math.random() * 100) / SNAP_GRID) * SNAP_GRID;
    }
    const newShape: DraggedShape = {
      id: `shape-${idCounter.current++}`,
      type,
      points: baseIcon,
      color: config.color,
      x,
      y,
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

  // 正六边形/正三角形专属吸附参数：基于半径20
  // 水平半步长 = r * √3 / 2，两个图形边贴边正好是这个间距的2倍
  const HEX_HALF_STEP = 20 * Math.sqrt(3) / 2; // ≈ 17.32
  const HEX_ROW_STEP = 20 * 1.5; // 行间距 = 30（三角形高=30，六边形行距=30）

  // 将客户端坐标转换为 SVG viewBox 坐标
  const clientToViewBox = useCallback((clientX: number, clientY: number) => {
    const svgEl = canvasRef.current?.querySelector("svg");
    if (!svgEl) return { x: clientX, y: clientY };
    const svgRect = svgEl.getBoundingClientRect();
    return {
      x: ((clientX - svgRect.left) / svgRect.width) * VB_WIDTH,
      y: ((clientY - svgRect.top) / svgRect.height) * VB_HEIGHT,
    };
  }, []);

  // 统一的拖拽开始处理（mouse + touch 共用）
  const startDrag = useCallback(
    (clientX: number, clientY: number, shapeId: string) => {
      const shape = shapes.find((s) => s.id === shapeId);
      if (!shape) return;
      const vbPos = clientToViewBox(clientX, clientY);
      setDragging(shapeId);
      setSelectedId(shapeId);
      setDragOffset({
        x: vbPos.x - shape.x,
        y: vbPos.y - shape.y,
      });
    },
    [shapes, clientToViewBox]
  );

  // 统一的拖拽移动处理
  const moveDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging) return;
      const vbPos = clientToViewBox(clientX, clientY);
      let x = vbPos.x - dragOffset.x;
      let y = vbPos.y - dragOffset.y;
      if (snapToGrid) {
        const shape = shapes.find((s) => s.id === dragging);
        if (shape?.type === "hexagon") {
          // 正六边形使用密铺网格吸附：边与边正好贴合
          x = Math.round(x / HEX_HALF_STEP) * HEX_HALF_STEP;
          y = Math.round(y / HEX_ROW_STEP) * HEX_ROW_STEP;
        } else if (shape?.type === "equilateral-triangle") {
          // 正三角形：x 密铺半步，y 普通网格（一正一反 y 只差 r/2=10）
          x = Math.round(x / HEX_HALF_STEP) * HEX_HALF_STEP;
          y = Math.round(y / SNAP_GRID) * SNAP_GRID;
        } else {
          x = Math.round(x / SNAP_GRID) * SNAP_GRID;
          y = Math.round(y / SNAP_GRID) * SNAP_GRID;
        }
      }
      setShapes((prev) =>
        prev.map((s) => (s.id === dragging ? { ...s, x, y } : s))
      );
    },
    [dragging, dragOffset, snapToGrid, clientToViewBox, shapes]
  );

  // 统一的拖拽结束处理
  const endDrag = useCallback(() => {
    if (dragging) {
      const movedShape = shapes.find((s) => s.id === dragging);
      if (movedShape) {
        const movedPts = getTransformedPoints(movedShape);
        let hasOverlap = false;
        for (const other of shapes) {
          if (other.id === dragging) continue;
          const otherPts = getTransformedPoints(other);
          if (polygonsOverlap(movedPts, otherPts)) {
            hasOverlap = true;
            break;
          }
        }
        setWarning(hasOverlap ? "可能有重叠，请检查！" : null);
      }
    }
    setDragging(null);
    wasDraggingRef.current = true;
    requestAnimationFrame(() => { wasDraggingRef.current = false; });
  }, [dragging, shapes]);

  // --- Mouse 事件 ---
  const handleMouseDown = (e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    startDrag(e.clientX, e.clientY, shapeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    moveDrag(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    endDrag();
  };

  // --- Touch 事件 ---
  const handleTouchStart = (e: React.TouchEvent, shapeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY, shapeId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    e.preventDefault(); // 阻止页面滚动
    const touch = e.touches[0];
    moveDrag(touch.clientX, touch.clientY);
  };

  // canvas 上的 touchend：拖拽结束 + 触屏点击空白取消选中
  const handleCanvasTouchEnd = () => {
    if (dragging) {
      endDrag();
    } else if (!wasDraggingRef.current) {
      setSelectedId(null);
    }
  };

  const handleCanvasClick = () => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    setSelectedId(null);
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
          onTouchMove={handleTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
          onTouchCancel={handleCanvasTouchEnd}
          onClick={handleCanvasClick}
        >
          <svg viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            {/* Grid - matches SNAP_GRID=10, major lines every 50 */}
            {snapToGrid &&
              Array.from({ length: 61 }).map((_, i) => (
                <line
                  key={`gv-${i}`}
                  x1={i * 10}
                  y1={0}
                  x2={i * 10}
                  y2={VB_HEIGHT}
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
                  x2={VB_WIDTH}
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
                    onTouchStart={(e) => handleTouchStart(e, shape.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: "all", touchAction: "none" }}
                  />
                </g>
              );
            })}
          </svg>

          {warning && (
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div
                className="fade-in"
                style={{
                  background: "var(--danger-light)",
                  color: "var(--danger)",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {warning}
              </div>
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
