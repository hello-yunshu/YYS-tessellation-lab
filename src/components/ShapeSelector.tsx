import React from "react";
import { useApp } from "../AppContext";
import { shapeConfigs, type ShapeType } from "../utils/tiling";
import { regularPolygonPoints, pointsToSvg } from "../utils/geometry";

function MiniShape({ type }: { type: ShapeType }) {
  const config = shapeConfigs.find((s) => s.id === type)!;
  let points: { x: number; y: number }[];
  switch (type) {
    case "equilateral-triangle":
      points = regularPolygonPoints(3, 10);
      break;
    case "square":
      points = [
        { x: -10, y: -10 },
        { x: 10, y: -10 },
        { x: 10, y: 10 },
        { x: -10, y: 10 },
      ];
      break;
    case "rectangle":
      points = [
        { x: -14, y: -8 },
        { x: 14, y: -8 },
        { x: 14, y: 8 },
        { x: -14, y: 8 },
      ];
      break;
    case "parallelogram": {
      points = [
        { x: -10, y: -7 },
        { x: 10, y: -7 },
        { x: 14, y: 7 },
        { x: -6, y: 7 },
      ];
      break;
    }
    case "trapezoid":
      points = [
        { x: -6, y: -10 },
        { x: 6, y: -10 },
        { x: 14, y: 10 },
        { x: -14, y: 10 },
      ];
      break;
    case "hexagon":
      points = regularPolygonPoints(6, 10);
      break;
    case "pentagon":
      points = regularPolygonPoints(5, 10);
      break;
    case "octagon":
    case "octagon-square":
      points = regularPolygonPoints(8, 10);
      break;
    default:
      points = [{ x: 0, y: 0 }];
  }
  const centerX = type === "rectangle" || type === "parallelogram" || type === "trapezoid" ? 0 : 0;

  return (
    <svg viewBox="-16 -16 32 32" width="28" height="28">
      <polygon points={pointsToSvg(points)} fill={config.color} stroke="#888" strokeWidth="0.5" />
    </svg>
  );
}

export default function ShapeSelector() {
  const { selectedShape, setSelectedShape } = useApp();

  return (
    <div className="shape-selector">
      {shapeConfigs.map((config) => (
        <button
          key={config.id}
          className={`shape-btn ${selectedShape === config.id ? "active" : ""}`}
          onClick={() => setSelectedShape(config.id)}
          title={config.name}
        >
          <span className="shape-icon">
            <MiniShape type={config.id} />
          </span>
          <span>{config.name}</span>
        </button>
      ))}
    </div>
  );
}