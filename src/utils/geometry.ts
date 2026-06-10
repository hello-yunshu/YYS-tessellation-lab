// 几何计算工具

export type Point = { x: number; y: number };

/** 将角度转为弧度 */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** 将弧度转为角度 */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** 围绕原点旋转点 */
export function rotatePoint(p: Point, angleDeg: number): Point {
  const rad = degToRad(angleDeg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  };
}

/** 平移点 */
export function translatePoint(p: Point, dx: number, dy: number): Point {
  return { x: p.x + dx, y: p.y + dy };
}

/** 缩放点 */
export function scalePoint(p: Point, s: number): Point {
  return { x: p.x * s, y: p.y * s };
}

/** 两点距离 */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** 生成正多边形的顶点（中心在原点，一个顶点在正上方） */
export function regularPolygonPoints(n: number, radius: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < n; i++) {
    // 从顶部开始 (-90°)，顺时针排列
    const angle = degToRad(-90 + (360 / n) * i);
    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
  }
  return points;
}

/** 给多边形加上旋转（围绕原点） */
export function rotatePoints(pts: Point[], angleDeg: number): Point[] {
  return pts.map((p) => rotatePoint(p, angleDeg));
}

/** 给多边形加上平移 */
export function translatePoints(pts: Point[], dx: number, dy: number): Point[] {
  return pts.map((p) => translatePoint(p, dx, dy));
}

/** 计算两个矩形的包围盒是否重叠 */
export function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

/** 计算多边形包围盒 */
export function polygonBounds(pts: Point[]): { x: number; y: number; w: number; h: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** 计算多边形中心 */
export function polygonCenter(pts: Point[]): Point {
  let cx = 0, cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / pts.length, y: cy / pts.length };
}

/** 将多边形的点转为 SVG polygon 的 points 属性字符串 */
export function pointsToSvg(points: Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/** 带圆角的 points 属性 */
export function pointsToSvgFixed(points: Point[], decimals = 1): string {
  return points.map((p) => `${p.x.toFixed(decimals)},${p.y.toFixed(decimals)}`).join(" ");
}