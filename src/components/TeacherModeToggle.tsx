import React from "react";
import { useApp } from "../AppContext";

export default function TeacherModeToggle() {
  const { teacherMode, setTeacherMode } = useApp();

  return (
    <label className="toggle-label">
      <span>教师模式</span>
      <div
        className={`toggle-switch ${teacherMode ? "active" : ""}`}
        onClick={() => setTeacherMode(!teacherMode)}
      />
    </label>
  );
}