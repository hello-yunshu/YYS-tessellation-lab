// 课堂提问 —— 三级难度递进

export interface Question {
  text: string;
  stars: number; // 1 / 2 / 3
}

export const questions: Question[] = [
  // ⭐ 基础观察 — 直觉感知，不需要计算或推理
  { text: "这些图形之间有没有空隙？", stars: 1 },
  { text: "这些图形有没有重叠？", stars: 1 },
  { text: "如果继续往外铺，还能铺下去吗？", stars: 1 },
  { text: "观察一下，密铺的图形之间有什么规律？", stars: 1 },
  { text: "你觉得怎样的图形能够密铺？", stars: 1 },
  { text: "生活中哪里见过这样的密铺？", stars: 1 },
  { text: "你家的地板砖是什么形状的？为什么用这种形状？", stars: 1 },
  { text: "马赛克瓷砖用的是密铺原理吗？你能举例吗？", stars: 1 },

  // ⭐⭐ 推理判断 — 需要角度计算或逻辑推理
  { text: "为什么正方形可以密铺？", stars: 2 },
  { text: "为什么正五边形不容易单独密铺？", stars: 2 },
  { text: "正三角形能不能密铺？为什么？", stars: 2 },
  { text: "长方形可以密铺吗？你是怎么判断的？", stars: 2 },
  { text: "平行四边形能密铺吗？和长方形有什么异同？", stars: 2 },
  { text: "梯形能密铺吗？试试看两个完全一样的梯形能拼成什么？", stars: 2 },
  { text: "菱形可以密铺吗？什么样的菱形可以？", stars: 2 },
  { text: "圆形能密铺吗？为什么不能？", stars: 2 },
  { text: "任意三角形能不能密铺？提示：两个一样的三角形能拼成什么？", stars: 2 },
  { text: "任意四边形都能密铺吗？动手试试看～", stars: 2 },
  { text: "正六边形的内角是多少度？3个正六边形能围满一圈吗？", stars: 2 },
  { text: "正三角形的每个内角是多少度？几个正三角形能围满一个点？", stars: 2 },
  { text: "正方形的内角是多少度？为什么正方形一定能密铺？", stars: 2 },
  { text: "正五边形的内角是多少度？算一算，几个正五边形可以围满一圈？", stars: 2 },
  { text: "正八边形的内角是多少度？它单独能密铺吗？", stars: 2 },
  { text: "几个相同的正三角形围在一起，能铺满一个点吗？", stars: 2 },
  { text: "如果要在一个点周围围满图形，这些图形的角度加起来必须等于多少？", stars: 2 },
  { text: "能密铺的图形有什么共同的特点？", stars: 2 },
  { text: "正多边形中，除了正三角形、正方形、正六边形，还有哪些可以单独密铺？", stars: 2 },
  { text: "为什么只有这三种正多边形能单独密铺？（提示：想想内角度数）", stars: 2 },

  // ⭐⭐⭐ 应用创造 — 组合密铺、跨学科、设计创造
  { text: "你发现正八边形单独铺的时候出现了什么？", stars: 3 },
  { text: "加上正方形以后，为什么正八边形也能密铺了？", stars: 3 },
  { text: "正三角形和正方形能搭配密铺吗？怎么搭配？", stars: 3 },
  { text: "正六边形和正三角形可以一起密铺吗？试试看～", stars: 3 },
  { text: "两种不同的图形组合密铺和一种图形单独密铺，有什么不同？", stars: 3 },
  { text: "蜂巢是什么形状的？蜜蜂为什么要用这种形状？", stars: 3 },
  { text: "足球上的图案是不是密铺？和平面密铺有什么不同？", stars: 3 },
  { text: "有没有在生活中见过用两种不同形状拼成的地砖？", stars: 3 },
  { text: "乌龟壳上的花纹是不是密铺？它用了几种图形？", stars: 3 },
  { text: "伊斯兰艺术中的几何图案是不是密铺？你发现了哪些图形？", stars: 3 },
  { text: "你能设计一种自己的密铺图案吗？", stars: 3 },
  { text: "如果让你设计教室的地砖，你会选什么形状？为什么？", stars: 3 },
  { text: "你能用剪贴画的方式创作一幅密铺作品吗？", stars: 3 },
  { text: "埃舍尔的画里用了哪些密铺技巧？你觉得神奇吗？", stars: 3 },
  { text: "如果让你把一只小鸟画成可以密铺的形状，你会怎么设计？", stars: 3 },
  { text: "如果换一种图形，还能铺满吗？", stars: 3 },
  { text: "你觉得'能围满一个点'和'能密铺'是什么关系？", stars: 3 },
  { text: "如果不规则图形可以密铺，那'规则'还重要吗？", stars: 3 },
  { text: "如果用一种能密铺的图形去铺球面，还能铺满吗？", stars: 3 },
  { text: "你觉得大自然中的密铺是巧合还是必然？", stars: 3 },
];

export const DIFFICULTY_LEVELS = [
  { stars: 1, label: "基础观察" },
  { stars: 2, label: "推理判断" },
  { stars: 3, label: "应用创造" },
];

export function getQuestionsByStars(stars: number): Question[] {
  return questions.filter((q) => q.stars === stars);
}

export function getRandomQuestionByStars(
  stars: number,
  excludeTexts?: string[]
): string {
  const pool = getQuestionsByStars(stars).filter(
    (q) => !excludeTexts?.includes(q.text)
  );
  if (pool.length === 0) return "";
  return pool[Math.floor(Math.random() * pool.length)].text;
}