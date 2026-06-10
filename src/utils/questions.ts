// 课堂提问

export const questions: string[] = [
  "这些图形之间有没有空隙？",
  "这些图形有没有重叠？",
  "如果继续往外铺，还能铺下去吗？",
  "为什么正方形可以密铺？",
  "为什么正五边形不容易单独密铺？",
  "生活中哪里见过这样的密铺？",
  "如果换一种图形，还能铺满吗？",
  "你能设计一种自己的密铺图案吗？",
  "你觉得怎样的图形能够密铺？",
  "几个相同的正三角形围在一起，能铺满一个点吗？",
  "正六边形的内角是多少度？3个正六边形能围满一圈吗？",
  "观察一下，密铺的图形之间有什么规律？",
  "你发现正八边形单独铺的时候出现了什么？",
  "加上正方形以后，为什么正八边形也能密铺了？",
];

export function getRandomQuestion(exclude?: string): string {
  const pool = exclude ? questions.filter((q) => q !== exclude) : questions;
  return pool[Math.floor(Math.random() * pool.length)];
}