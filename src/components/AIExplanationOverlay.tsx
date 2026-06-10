import React, { useEffect, useRef } from "react";
import { getAIExplanation } from "../utils/aiExplanations";

interface Props {
  explainId: string | null;
  onClose: () => void;
}

export default function AIExplanationOverlay({ explainId, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!explainId) return null;

  const explanation = getAIExplanation(explainId);
  if (!explanation) return null;

  const copyPrompt = () => {
    navigator.clipboard.writeText(explanation.promptExample).then(
      () => {
        alert("Prompt 已复制到剪贴板！");
      },
      () => {
        alert("复制失败，请手动复制：\n" + explanation.promptExample);
      }
    );
  };

  return (
    <div
      ref={overlayRef}
      className="overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", color: "var(--primary)", margin: 0 }}>
              AI 是如何帮助实现这个功能的？
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0" }}>
              ⏱ {explanation.implementationTime}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
          <Section title="一、它解决了什么教学问题？" content={explanation.teachingPurpose} />
          <Section title="二、AI 在这里做了什么？" content={explanation.aiContribution} />

          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "var(--text)" }}>三、可以怎样向 AI 提需求？</strong>
          </div>
          <div className="code-block" style={{ marginBottom: "12px" }}>
            {explanation.promptExample}
          </div>

          <Section title="四、网页是如何实现的？" content={explanation.technicalIdea} />

          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "var(--text)" }}>五、还可以怎样继续迭代？</strong>
          </div>
          <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
            {explanation.iterationIdeas.map((idea, i) => (
              <li key={i} style={{ marginBottom: "4px" }}>
                {idea}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button className="btn btn-primary btn-sm" onClick={copyPrompt}>
            复制这段 AI Prompt
          </button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <strong style={{ color: "var(--text)" }}>{title}</strong>
      <p style={{ marginTop: "4px" }}>{content}</p>
    </div>
  );
}