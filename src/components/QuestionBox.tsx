import React, { useState, useCallback } from "react";
import {
  getRandomQuestionByStars,
  getQuestionsByStars,
  DIFFICULTY_LEVELS,
} from "../utils/questions";
import AIExplainButton from "./AIExplainButton";

const STARS_MAP = ["", "★", "★★", "★★★"];

export default function QuestionBox() {
  const [currentLevel, setCurrentLevel] = useState(0); // 0 / 1 / 2
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [levelCount, setLevelCount] = useState(0);
  const [levelTarget, setLevelTarget] = useState(() =>
    Math.random() < 0.5 ? 2 : 3
  );
  const [upgrading, setUpgrading] = useState(false); // 升级动画状态

  const allExhausted = currentLevel >= DIFFICULTY_LEVELS.length;

  const advanceLevel = useCallback(() => {
    const next = currentLevel + 1;
    if (next >= DIFFICULTY_LEVELS.length) {
      setCurrentLevel(next);
      return;
    }
    setUpgrading(true);
    setTimeout(() => {
      setCurrentLevel(next);
      setLevelCount(0);
      setLevelTarget(Math.random() < 0.5 ? 2 : 3);
      setQuestion("");
      setUpgrading(false);
    }, 800);
  }, [currentLevel]);

  const nextQuestion = useCallback(() => {
    if (allExhausted) return;

    const { stars } = DIFFICULTY_LEVELS[currentLevel];
    const pool = getQuestionsByStars(stars).filter(
      (q) => !history.includes(q.text)
    );

    // 当前难度题目已抽完 或 已达目标数量 → 升级
    if (pool.length === 0 || levelCount >= levelTarget) {
      advanceLevel();
      return;
    }

    const q = getRandomQuestionByStars(stars, history);
    if (!q) {
      advanceLevel();
      return;
    }
    setQuestion(q);
    setHistory((prev) => [...prev, q]);
    setLevelCount((prev) => prev + 1);
  }, [allExhausted, currentLevel, history, levelCount, levelTarget, advanceLevel]);

  const clearAll = () => {
    setQuestion("");
    setHistory([]);
    setCurrentLevel(0);
    setLevelCount(0);
    setLevelTarget(Math.random() < 0.5 ? 2 : 3);
    setUpgrading(false);
  };

  const currentStars = allExhausted ? "" : STARS_MAP[DIFFICULTY_LEVELS[currentLevel].stars];
  const currentLabel = allExhausted ? "" : DIFFICULTY_LEVELS[currentLevel].label;

  return (
    <section
      className="card"
      data-ai-explain-id="question-box"
      style={{ position: "relative", textAlign: "center" }}
    >
      <AIExplainButton explainId="question-box" />
      <h2
        style={{
          fontSize: "var(--font-size-xl)",
          marginBottom: "4px",
          color: "var(--text)",
        }}
      >
        课堂提问
      </h2>

      {/* 难度指示器 */}
      {!allExhausted && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#f59e0b",
            marginBottom: "12px",
            letterSpacing: "2px",
          }}
        >
          {currentStars}
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginLeft: "6px",
            }}
          >
            {currentLabel} · 第{levelCount}/{levelTarget}题
          </span>
        </div>
      )}

      {/* 难度进度条 */}
      {!allExhausted && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            marginBottom: "16px",
          }}
        >
          {DIFFICULTY_LEVELS.map((lv, i) => (
            <div
              key={lv.stars}
              style={{
                width: "60px",
                height: "4px",
                borderRadius: "2px",
                background:
                  i < currentLevel
                    ? "var(--accent)"
                    : i === currentLevel
                    ? "var(--accent)"
                    : "var(--border)",
                opacity: i <= currentLevel ? 1 : 0.4,
                transition: "background var(--transition)",
              }}
            />
          ))}
        </div>
      )}

      {/* 升级动画 */}
      {upgrading && (
        <div className="fade-in">
          <div
            style={{
              padding: "20px",
              background: "var(--accent-light)",
              borderRadius: "var(--radius-sm)",
              fontSize: "16px",
              color: "var(--accent)",
              marginBottom: "12px",
            }}
          >
            太棒了！难度升级～
            <br />
            进入「{DIFFICULTY_LEVELS[currentLevel + 1]?.label}」
          </div>
        </div>
      )}

      {!upgrading && allExhausted && (
        <div className="fade-in">
          <div
            style={{
              padding: "20px",
              background: "var(--accent-light)",
              borderRadius: "var(--radius-sm)",
              fontSize: "16px",
              color: "var(--accent)",
              marginBottom: "12px",
            }}
          >
            全部三级难度都已经挑战完啦～共 {history.length} 道题！
            <br />
            点击"清空重来"重新开始
          </div>
        </div>
      )}

      {!upgrading && !allExhausted && question && (
        <div className="fade-in">
          <div
            style={{
              padding: "20px",
              background: "var(--accent-light)",
              borderRadius: "var(--radius-sm)",
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--accent)",
              marginBottom: "12px",
            }}
          >
            {question}
          </div>
        </div>
      )}

      {!upgrading && !allExhausted && !question && (
        <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>
          点击按钮，从「{currentLabel}」中随机抽题
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <button
          className="btn btn-accent"
          onClick={nextQuestion}
          disabled={allExhausted || upgrading}
        >
          {allExhausted ? "已完成" : upgrading ? "升级中…" : "生成新问题"}
        </button>
        {(question || history.length > 0) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={clearAll}
            disabled={upgrading}
          >
            清空重来
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: "16px", textAlign: "left" }}>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            已提问：{history.length} 道
          </p>
          <ul
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              paddingLeft: "20px",
            }}
          >
            {history.map((h, i) => (
              <li key={i} style={{ marginBottom: "4px" }}>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}