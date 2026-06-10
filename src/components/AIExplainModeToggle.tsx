import React from "react";
import { useApp } from "../AppContext";

export default function AIExplainModeToggle() {
  const { aiExplainMode, setAIExplainMode } = useApp();

  return (
    <label className="toggle-label">
      <span>AI 说明模式</span>
      <div
        className={`toggle-switch ${aiExplainMode ? "active" : ""}`}
        onClick={() => setAIExplainMode(!aiExplainMode)}
      />
    </label>
  );
}