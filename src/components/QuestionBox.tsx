import React, { useState } from "react";
import { getRandomQuestion } from "../utils/questions";
import AIExplainButton from "./AIExplainButton";

export default function QuestionBox() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const nextQuestion = () => {
    const q = getRandomQuestion();
    setQuestion(q);
    setHistory((prev) => [...prev, q]);
  };

  const clearAll = () => {
    setQuestion("");
    setHistory([]);
  };

  return (
    <section className="card" data-ai-explain-id="question-box" style={{ position: "relative", textAlign: "center" }}>
      <AIExplainButton explainId="question-box" />
      <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "16px", color: "var(--text)" }}>
        课堂提问
      </h2>

      {question ? (
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
      ) : (
        <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>
          点击按钮随机生成一个课堂讨论问题
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <button className="btn btn-accent" onClick={nextQuestion}>
          生成新问题
        </button>
        {(question || history.length > 0) && (
          <button className="btn btn-outline btn-sm" onClick={clearAll}>
            清空重来
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: "16px", textAlign: "left" }}>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
            已提问的问题：
          </p>
          <ul style={{ fontSize: "13px", color: "var(--text-secondary)", paddingLeft: "20px" }}>
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