import type { Point } from "./geometry";
import {
  regularPolygonPoints,
  rotatePoints,
  translatePoints,
  pointsToSvg,
} from "./geometry";

export type ShapeType =
  | "equilateral-triangle"
  | "square"
  | "rectangle"
  | "parallelogram"
  | "trapezoid"
  | "hexagon"
  | "pentagon"
  | "octagon"
  | "octagon-square";

export interface TileDef {
  points: Point[];
  fill: string;
  label?: string;
}

export interface ShapeConfig {
  id: ShapeType;
  name: string;
  canTile: boolean;
  canTileAlone: boolean;
  explanation: string;
  angleInfo?: {
    interiorAngle: number;
    aroundPoint: string;
    conclusion: string;
  };
  color: string;
  generateTiles: (cols: number, rows: number, size: number) => TileDef[];
}

// 获取基础图形顶点
function getBaseShape(type: ShapeType, size: number): Point[] {
  switch (type) {
    case "equilateral-triangle":
      return regularPolygonPoints(3, size);
    case "square":
      return [
        { x: -size, y: -size },
        { x: size, y: -size },
        { x: size, y: size },
        { x: -size, y: size },
      ];
    case "rectangle": {
      const w = size * 1.6;
      const h = size;
      return [
        { x: -w / 2, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: w / 2, y: h / 2 },
        { x: -w / 2, y: h / 2 },
      ];
    }
    case "parallelogram": {
      const w = size * 1.4;
      const h = size * 0.9;
      const skew = size * 0.4;
      return [
        { x: -w / 2, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: w / 2 + skew, y: h / 2 },
        { x: -w / 2 + skew, y: h / 2 },
      ];
    }
    case "trapezoid": {
      const topW = size * 0.8;
      const bottomW = size * 1.5;
      const h = size * 0.9;
      return [
        { x: -topW / 2, y: -h / 2 },
        { x: topW / 2, y: -h / 2 },
        { x: bottomW / 2, y: h / 2 },
        { x: -bottomW / 2, y: h / 2 },
      ];
    }
    case "hexagon":
      return regularPolygonPoints(6, size);
    case "pentagon":
      return regularPolygonPoints(5, size);
    case "octagon":
      return regularPolygonPoints(8, size);
    case "octagon-square":
      return regularPolygonPoints(8, size);
    default:
      return [{ x: 0, y: 0 }];
  }
}

// 生成正三角形密铺
function generateTriTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  const triH = size * Math.sin(Math.PI / 3); // 三角形高度
  const triW = size; // 三角形边长 = 宽度

  const colors = ["#A8D8EA", "#AA96DA", "#FCBAD3", "#FFFFD2"];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * triW + (row % 2) * (triW / 2);
      const cy = row * triH;

      // 向上的三角形
      const upTri: Point[] = [
        { x: cx, y: cy },
        { x: cx + triW, y: cy },
        { x: cx + triW / 2, y: cy + triH },
      ];
      tiles.push({
        points: upTri,
        fill: colors[(col + row) % colors.length],
      });

      // 向下的三角形
      const downTri: Point[] = [
        { x: cx + triW / 2, y: cy + triH },
        { x: cx + triW * 1.5, y: cy + triH },
        { x: cx + triW, y: cy },
      ];
      tiles.push({
        points: downTri,
        fill: colors[(col + row + 2) % colors.length],
      });
    }
  }
  return tiles;
}

// 生成正方形密铺
function generateSquareTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  const s = size * 1.1;
  const colors = ["#FFD3B6", "#DCEED1", "#A8D8EA", "#AA96DA"];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push({
        points: [
          { x: col * s, y: row * s },
          { x: (col + 1) * s, y: row * s },
          { x: (col + 1) * s, y: (row + 1) * s },
          { x: col * s, y: (row + 1) * s },
        ],
        fill: colors[(col + row) % colors.length],
      });
    }
  }
  return tiles;
}

// 生成长方形密铺
function generateRectTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  const w = size * 1.6;
  const h = size;
  const colors = ["#FCBAD3", "#FFFFD2", "#A8D8EA", "#DCEED1"];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push({
        points: [
          { x: col * w, y: row * h },
          { x: (col + 1) * w, y: row * h },
          { x: (col + 1) * w, y: (row + 1) * h },
          { x: col * w, y: (row + 1) * h },
        ],
        fill: colors[(col + row) % colors.length],
      });
    }
  }
  return tiles;
}

// 生成平行四边形密铺
function generateParaTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  const w = size * 1.4;
  const h = size * 0.9;
  const skew = size * 0.4;
  const colors = ["#AA96DA", "#FFD3B6", "#DCEED1", "#FCBAD3"];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ox = col * w + row * skew;
      const oy = row * h;
      tiles.push({
        points: [
          { x: ox, y: oy },
          { x: ox + w, y: oy },
          { x: ox + w + skew, y: oy + h },
          { x: ox + skew, y: oy + h },
        ],
        fill: colors[(col + row) % colors.length],
      });
    }
  }
  return tiles;
}

// 生成梯形密铺（正向和倒置梯形交替排列拼成平行四边形，再逐行平移）
function generateTrapTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  const topW = size * 0.8;
  const bottomW = size * 1.5;
  const h = size * 0.9;
  const skew = (bottomW - topW) / 2;
  const unitW = topW + bottomW;
  const colors = ["#FFFFD2", "#A8D8EA", "#FCBAD3", "#AA96DA"];

  // 梯形较宽，减少列数保持图案大小一致
  const actualCols = Math.ceil(cols / 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < actualCols; col++) {
      // 平行四边形左上角基点
      const bx = col * unitW - row * skew + skew;
      const by = row * h;

      // 正向梯形（上底在上）
      tiles.push({
        points: [
          { x: bx, y: by },                     // 左上
          { x: bx + topW, y: by },               // 右上
          { x: bx + topW + skew, y: by + h },    // 右下
          { x: bx - skew, y: by + h },            // 左下
        ],
        fill: colors[(col * 2 + row) % colors.length],
      });

      // 倒置梯形（拼在正向梯形右侧，共享右斜边）
      tiles.push({
        points: [
          { x: bx + topW, y: by },                     // 左上（= 正向右上）
          { x: bx + topW + bottomW, y: by },            // 右上
          { x: bx + topW + bottomW - skew, y: by + h }, // 右下
          { x: bx + topW + skew, y: by + h },           // 左下（= 正向右下）
        ],
        fill: colors[(col * 2 + 1 + row) % colors.length],
      });
    }
  }
  return tiles;
}

// 生成正六边形密铺（尖顶六边形蜂巢排布）
function generateHexTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  const points = regularPolygonPoints(6, size);
  // 尖顶六边形：水平间距 sqrt(3)*size，垂直行间距 1.5*size，奇数行偏移一半水平间距
  const dx = size * Math.sqrt(3);
  const dy = size * 1.5;
  const colors = ["#FFD3B6", "#A8D8EA", "#DCEED1", "#FCBAD3"];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * dx + (row % 2) * (dx / 2);
      const cy = row * dy;
      tiles.push({
        points: translatePoints(points, cx, cy),
        fill: colors[(col + row) % colors.length],
      });
    }
  }
  return tiles;
}

// 生成正五边形排列（用于演示不能密铺）
function generatePentTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  const s = size * 2; // 间距
  const points = regularPolygonPoints(5, size);

  // 五边形不能密铺，让它们尝试排列但会有空隙
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push({
        points: translatePoints(points, col * s + (row % 2) * (s / 2), row * s * 0.9),
        fill: "#FCBAD3",
      });
    }
  }
  return tiles;
}

// 生成正八边形排列（用于演示不能单独密铺）
function generateOctTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  const points = regularPolygonPoints(8, size);
  const s = size * 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push({
        points: translatePoints(points, col * s + (row % 2) * (s / 2), row * s * 0.95),
        fill: "#AA96DA",
      });
    }
  }
  return tiles;
}

// 生成正八边形+正方形组合密铺（截角正方形镶嵌）
// 原理：正方形网格截角后，原正方形变八边形（旋转22.5°），原顶点变旋转45°正方形
function generateOctSquareTiles(cols: number, rows: number, size: number): TileDef[] {
  const tiles: TileDef[] = [];
  // 旋转22.5°的八边形，使边朝向正方向（上、右、下、左）
  const octPoints = rotatePoints(regularPolygonPoints(8, size), 22.5);
  const a = 2 * size * Math.sin(Math.PI / 8); // 八边形边长 = 正方形边长
  const s = a * (1 + Math.sqrt(2)); // 原始正方形网格边长

  // 八边形中心在 (0.5s, 0.5s), (1.5s, 0.5s), ...
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = (col + 0.5) * s;
      const cy = (row + 0.5) * s;
      tiles.push({
        points: translatePoints(octPoints, cx, cy),
        fill: "#AA96DA",
      });
    }
  }

  // 旋转45°正方形，中心在原始网格顶点 (0,0), (s,0), (0,s), (s,s), ...
  // 旋转45°正方形的4个顶点（中心在原点）：(±a/√2, 0), (0, ±a/√2)
  const d = a / Math.sqrt(2); // 半对角线
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const cx = col * s;
      const cy = row * s;
      tiles.push({
        points: [
          { x: cx, y: cy - d },      // 上
          { x: cx + d, y: cy },       // 右
          { x: cx, y: cy + d },       // 下
          { x: cx - d, y: cy },       // 左
        ],
        fill: "#A8D8EA",
      });
    }
  }

  return tiles;
}

export const shapeConfigs: ShapeConfig[] = [
  {
    id: "equilateral-triangle",
    name: "正三角形",
    canTile: true,
    canTileAlone: true,
    explanation: "可以密铺。6个正三角形围在一个点，角合起来正好铺满一周。",
    angleInfo: {
      interiorAngle: 60,
      aroundPoint: "60° × 6 = 360°",
      conclusion: "6个60°角正好拼成360°，所以正三角形可以密铺。",
    },
    color: "#A8D8EA",
    generateTiles: (cols, rows, size) => generateTriTiles(cols, rows, size),
  },
  {
    id: "square",
    name: "正方形",
    canTile: true,
    canTileAlone: true,
    explanation: "可以密铺。4个正方形围在一个点，角合起来正好铺满一周。",
    angleInfo: {
      interiorAngle: 90,
      aroundPoint: "90° × 4 = 360°",
      conclusion: "4个90°角正好拼成360°，所以正方形可以密铺。",
    },
    color: "#FFD3B6",
    generateTiles: (cols, rows, size) => generateSquareTiles(cols, rows, size),
  },
  {
    id: "rectangle",
    name: "长方形",
    canTile: true,
    canTileAlone: true,
    explanation: "可以密铺。长方形四个角都是90°，4个长方形围在一个点刚好360°。",
    angleInfo: {
      interiorAngle: 90,
      aroundPoint: "90° × 4 = 360°",
      conclusion: "4个90°角正好拼成360°，所以长方形可以密铺。",
    },
    color: "#FCBAD3",
    generateTiles: (cols, rows, size) => generateRectTiles(cols, rows, size),
  },
  {
    id: "parallelogram",
    name: "平行四边形",
    canTile: true,
    canTileAlone: true,
    explanation: "可以密铺。平行四边形平移排列，相邻角互补，4个可围360°。",
    color: "#AA96DA",
    generateTiles: (cols, rows, size) => generateParaTiles(cols, rows, size),
  },
  {
    id: "trapezoid",
    name: "梯形",
    canTile: true,
    canTileAlone: true,
    explanation: "可以密铺。两个相同梯形可以拼成平行四边形，再进行密铺。",
    color: "#FFFFD2",
    generateTiles: (cols, rows, size) => generateTrapTiles(cols, rows, size),
  },
  {
    id: "hexagon",
    name: "正六边形",
    canTile: true,
    canTileAlone: true,
    explanation: "可以密铺。3个正六边形围在一个点，120°×3=360°，刚好铺满一周。",
    angleInfo: {
      interiorAngle: 120,
      aroundPoint: "120° × 3 = 360°",
      conclusion: "3个120°角正好拼成360°，所以正六边形可以密铺。",
    },
    color: "#DCEED1",
    generateTiles: (cols, rows, size) => generateHexTiles(cols, rows, size),
  },
  {
    id: "pentagon",
    name: "正五边形",
    canTile: false,
    canTileAlone: false,
    explanation: "单独使用正五边形时，容易出现空隙，无法继续铺满。正五边形一个角是108°，3个是324°，4个是432°，不能刚好组成360°。",
    angleInfo: {
      interiorAngle: 108,
      aroundPoint: "108° × 3 = 324°（不足）\n108° × 4 = 432°（超出）",
      conclusion: "正五边形一个角是108°，不能刚好组成360°，所以正五边形不能单独密铺。",
    },
    color: "#FCBAD3",
    generateTiles: (cols, rows, size) => generatePentTiles(cols, rows, size),
  },
  {
    id: "octagon",
    name: "正八边形",
    canTile: false,
    canTileAlone: false,
    explanation: "单独使用正八边形时，容易出现空隙，无法继续铺满。但可以和正方形组合密铺。",
    color: "#AA96DA",
    generateTiles: (cols, rows, size) => generateOctTiles(cols, rows, size),
  },
  {
    id: "octagon-square",
    name: "正八边形+正方形",
    canTile: true,
    canTileAlone: true,
    explanation: "可以密铺。正八边形一个角是135°，搭配正方形90°角：135°+135°+90°=360°，可以组合铺满一周。",
    color: "#AA96DA",
    generateTiles: (cols, rows, size) => generateOctSquareTiles(cols, rows, size),
  },
];

// 用 Map 缓存，避免每次 .find() 遍历整个数组
const shapeConfigMap = new Map<ShapeType, ShapeConfig>(
  shapeConfigs.map((s) => [s.id, s])
);

export function getShapeConfig(type: ShapeType): ShapeConfig {
  return shapeConfigMap.get(type)!;
}