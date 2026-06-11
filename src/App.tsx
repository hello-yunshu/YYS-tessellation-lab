import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { AppProvider, useApp } from "./AppContext";
import Header from "./components/Header";
import TeacherModeToggle from "./components/TeacherModeToggle";
import AIExplainModeToggle from "./components/AIExplainModeToggle";
import LifeExamples from "./components/LifeExamples";
import AIExplanationOverlay from "./components/AIExplanationOverlay";

// 首屏以下组件懒加载，减少初始 JS 体积
const DefinitionCompare = lazy(() => import("./components/DefinitionCompare"));
const ShapeSelector = lazy(() => import("./components/ShapeSelector"));
const TilingCanvas = lazy(() => import("./components/TilingCanvas"));
const AngleExplorer = lazy(() => import("./components/AngleExplorer"));
const DragPlayground = lazy(() => import("./components/DragPlayground"));
const QuestionBox = lazy(() => import("./components/QuestionBox"));
const SummaryPanel = lazy(() => import("./components/SummaryPanel"));

// 课堂流程侧栏
const flowSteps = [
  { id: "life", label: "看一看", num: 1, scrollTo: "life-examples" },
  { id: "define", label: "想一想", num: 2, scrollTo: "definition" },
  { id: "lab", label: "试一试", num: 3, scrollTo: "lab" },
  { id: "angle", label: "说一说", num: 4, scrollTo: "angle" },
  { id: "drag", label: "画一画", num: 5, scrollTo: "drag" },
  { id: "question", label: "找一找", num: 6, scrollTo: "question" },
];

function FlowSidebar() {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState("");
  const [sidebarY, setSidebarY] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ mouseY: 0, sidebarY: 0 });
  const wasDraggedRef = useRef(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveStep(id);
    }
  };

  // 面板整体上下拖拽
  const handleToggleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    wasDraggedRef.current = false;
    const sidebar = (e.target as HTMLElement).closest(".flow-sidebar") as HTMLElement;
    const currentY = sidebarY ?? sidebar.getBoundingClientRect().top;
    dragStartRef.current = { mouseY: e.clientY, sidebarY: currentY };
    setDragging(true);
  };

  const handleToggleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    wasDraggedRef.current = false;
    const sidebar = (e.target as HTMLElement).closest(".flow-sidebar") as HTMLElement;
    const currentY = sidebarY ?? sidebar.getBoundingClientRect().top;
    dragStartRef.current = { mouseY: e.touches[0].clientY, sidebarY: currentY };
    setDragging(true);
  };

  // 拖拽结束后才允许 click 展开
  const handleToggleClick = () => {
    if (wasDraggedRef.current) return;
    setOpen(!open);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dy = clientY - dragStartRef.current.mouseY;
      if (Math.abs(dy) > 3) wasDraggedRef.current = true;
      setSidebarY(dragStartRef.current.sidebarY + dy);
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging]);

  return (
    <div
      className="flow-sidebar"
      style={sidebarY != null ? { top: `${sidebarY}px`, transform: "none" } : undefined}
    >
      <div
        className="flow-toggle"
        onClick={handleToggleClick}
        onMouseDown={handleToggleMouseDown}
        onTouchStart={handleToggleTouchStart}
      >
        课堂流程
      </div>
      {open && (
        <div className="flow-panel">
          {flowSteps.map((step) => (
            <div
              key={step.id}
              className={`flow-step ${activeStep === step.scrollTo ? "active" : ""}`}
              onClick={() => scrollTo(step.scrollTo)}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <span className="flow-step-num">{step.num}</span>
              {step.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// AI 赋能展示导览
function AIShowcase() {
  const [open, setOpen] = useState(false);

  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <h3 style={{ fontSize: "16px", color: "var(--accent)" }}>
          这个项目如何体现 AI 赋能课堂？
        </h3>
        <span
          style={{
            transition: "transform var(--transition)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div className="fade-in" style={{ marginTop: "12px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
          <p>这个演示网页展示了 AI 在课堂教学中的三种作用：</p>
          <ol style={{ paddingLeft: "20px", margin: "8px 0" }}>
            <li>帮教师把教材内容转化为可视化演示。</li>
            <li>帮教师把抽象数学概念转化为可操作、可观察的学习活动。</li>
            <li>帮教师快速生成课堂问题、交互工具和教学说明。</li>
          </ol>
          <p style={{ marginTop: "8px" }}>
            你可以按住 <strong>Ctrl / Command</strong> 并点击任意模块，查看这个功能是如何通过 AI 辅助设计和实现的。
          </p>
          <div
            style={{
              marginTop: "12px",
              padding: "10px",
              background: "var(--accent-light)",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            教材理解 → 教学活动设计 → AI 生成网页 → 教师调整 → 课堂使用
          </div>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const {
    selectedShape,
    setSelectedShape,
    showBorders,
    setShowBorders,
    showVertices,
    setShowVertices,
    showConclusion,
    setShowConclusion,
    teacherMode,
    setTeacherMode,
    aiExplainMode,
    setAIExplainMode,
  } = useApp();

  const [aiExplainId, setAIExplainId] = useState<string | null>(null);

  // Global Ctrl/Cmd + click handler for AI explanations
  const handleGlobalClick = useCallback(
    (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const target = e.target as HTMLElement;
        const container = target.closest("[data-ai-explain-id]") as HTMLElement | null;
        if (container) {
          e.preventDefault();
          e.stopPropagation();
          setAIExplainId(container.dataset.aiExplainId || null);
        }
      }
    },
    []
  );

  // Also handle clicks on AI badges
  const handleAIBadgeClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const trigger = target.closest("[data-ai-explain-trigger]") as HTMLElement | null;
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      setAIExplainId(trigger.dataset.aiExplainTrigger || null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleGlobalClick, true);
    document.addEventListener("click", handleAIBadgeClick, true);
    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
      document.removeEventListener("click", handleAIBadgeClick, true);
    };
  }, [handleGlobalClick, handleAIBadgeClick]);

  return (
    <div className="app-container">
      <Header />

      {/* Toolbar */}
      <div className="toolbar">
        <TeacherModeToggle />
        <AIExplainModeToggle />
      </div>

      {/* AI Showcase */}
      <AIShowcase />

      {/* Module 1: Life Examples */}
      <div id="life-examples" style={{ marginTop: "20px" }}>
        <LifeExamples />
      </div>

      {/* Module 2: Definition Compare */}
      <div id="definition" style={{ marginTop: "20px" }}>
        <Suspense fallback={null}>
          <DefinitionCompare />
        </Suspense>
      </div>

      {/* Module 3: Tiling Lab */}
      <div id="lab" style={{ marginTop: "20px" }}>
        <Suspense fallback={null}>
          <section className="card" data-ai-explain-id="tiling-lab" style={{ position: "relative" }}>
            <div
              className={`ai-badge ${aiExplainMode ? "ai-badge-visible" : ""}`}
              data-ai-explain-trigger="tiling-lab"
              title="查看这个功能如何由 AI 辅助实现"
            >
              AI
            </div>
            <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "16px", color: "var(--text)" }}>
              图形密铺实验室
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
              选择一种图形，观察它是否能密铺。
            </p>

            <ShapeSelector />

            {/* Controls */}
            <div className="controls">
              <label>
                <input
                  type="checkbox"
                  checked={showBorders}
                  onChange={(e) => setShowBorders(e.target.checked)}
                />
                显示边线
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showVertices}
                  onChange={(e) => setShowVertices(e.target.checked)}
                />
                显示顶点
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showConclusion}
                  onChange={(e) => setShowConclusion(e.target.checked)}
                />
                显示判断结论
              </label>
            </div>

            <TilingCanvas />
          </section>
        </Suspense>
      </div>

      {/* Module 4: Angle Explorer */}
      <div id="angle" style={{ marginTop: "20px" }}>
        <Suspense fallback={null}>
          <AngleExplorer />
        </Suspense>
      </div>

      {/* Module 5: Drag Playground */}
      <div id="drag" style={{ marginTop: "20px" }}>
        <Suspense fallback={null}>
          <DragPlayground />
        </Suspense>
      </div>

      {/* Module 6: Question Box */}
      <div id="question" style={{ marginTop: "20px" }}>
        <Suspense fallback={null}>
          <QuestionBox />
        </Suspense>
      </div>

      {/* Module 7: Summary */}
      <div id="summary" style={{ marginTop: "20px" }}>
        <Suspense fallback={null}>
          <SummaryPanel />
        </Suspense>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "13px" }}>
        奇妙的图形密铺｜苏教版五年级数学演示
      </footer>

      {/* AI Explanation Overlay */}
      <AIExplanationOverlay
        explainId={aiExplainId}
        onClose={() => setAIExplainId(null)}
      />

      {/* Flow Sidebar */}
      <FlowSidebar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}