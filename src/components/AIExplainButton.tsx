import React from "react";
import { useApp } from "../AppContext";

interface Props {
  explainId: string;
}

export default function AIExplainButton({ explainId }: Props) {
  const { aiExplainMode } = useApp();

  return (
    <div
      className={`ai-badge ${aiExplainMode ? "ai-badge-visible" : ""}`}
      title="查看这个功能如何由 AI 辅助实现"
      onClick={(e) => {
        e.stopPropagation();
        // This is handled by the global click handler in App.tsx
      }}
      data-ai-explain-trigger={explainId}
    >
      AI
    </div>
  );
}