import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ShapeType } from "./utils/tiling";

interface AppState {
  teacherMode: boolean;
  setTeacherMode: (v: boolean) => void;
  aiExplainMode: boolean;
  setAIExplainMode: (v: boolean) => void;
  selectedShape: ShapeType;
  setSelectedShape: (s: ShapeType) => void;
  showBorders: boolean;
  setShowBorders: (v: boolean) => void;
  showVertices: boolean;
  setShowVertices: (v: boolean) => void;
  showConclusion: boolean;
  setShowConclusion: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [teacherMode, setTeacherMode] = useState(false);
  const [aiExplainMode, setAIExplainMode] = useState(true);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("square");
  const [showBorders, setShowBorders] = useState(true);
  const [showVertices, setShowVertices] = useState(false);
  const [showConclusion, setShowConclusion] = useState(false);

  return (
    <AppContext.Provider
      value={{
        teacherMode,
        setTeacherMode,
        aiExplainMode,
        setAIExplainMode,
        selectedShape,
        setSelectedShape,
        showBorders,
        setShowBorders,
        showVertices,
        setShowVertices,
        showConclusion,
        setShowConclusion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}