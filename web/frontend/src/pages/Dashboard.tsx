import { useState, useEffect } from "react";
import LeftPanel from "../components/panels/InputDock";
import RightPanel from "../components/panels/OutputDock";
import CadArea from "../components/cad/CadArea";
import LogWindow from "../components/log/LogWindow";
import AdditionalInputsModal from "../components/modals/AdditionalInputsModal";

export default function Dashboard() {
  const [showAdditionalInputs, setShowAdditionalInputs] = useState(false);
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [showLog, setShowLog] = useState(false);

  const [logHeight, setLogHeight] = useState(180);
  const [isDragging, setIsDragging] = useState(false);

  // 🔹 DRAG LOGIC
  useEffect(() => {
    const onDrag = (e: MouseEvent) => {
      if (!isDragging) return;

      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 80 && newHeight < window.innerHeight - 120) {
        setLogHeight(newHeight);
      }
    };

    const stopDrag = () => setIsDragging(false);

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);

    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [isDragging]);
  const toolbarIcon = {
    width: "18px",
    height: "18px",
    border: "2px solid black",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  };
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔹 DESKTOP MENU */}
      <div
        style={{
          height: "28px",
          background: "#e9e9e9",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          fontSize: "13px",
          gap: "20px",
        }}
      >
        <span>File</span>
        <span>Edit</span>
        <span>Graphics</span>
        <span style={{ color: "#6a1b9a" }}>Help</span>
      </div>

{/* 🔹 GREEN TOOLBAR */}
<div
  style={{
    height: "40px",
    background: "#8DB600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid #6f9100",
  }}
>
  {/* CENTER CONTROL ICONS */}
  <div
    style={{
      display: "flex",
      gap: "12px",
      alignItems: "center",
    }}
  >
    {/* LEFT PANEL */}
    <button
      onClick={() => setShowLeft(v => !v)}
      style={toolbarIcon}
    >
      ◧
    </button>

    {/* RIGHT PANEL */}
    <button
      onClick={() => setShowRight(v => !v)}
      style={toolbarIcon}
    >
      ◨
    </button>

    {/* LOG WINDOW */}
    <button
      onClick={() => setShowLog(v => !v)}
      style={toolbarIcon}
    >
      ▬
    </button>

    {/* TOP CAD */}
    <button style={toolbarIcon}>
      ⊟
    </button>

    {/* BOTTOM CAD */}
    <button style={toolbarIcon}>
      ⊞
    </button>
  </div>
</div>


      {/* 🔹 MAIN AREA */}
      <div style={{ flex: 1, display: "flex", position: "relative" }}>
        
        {/* LEFT */}
        {showLeft && <LeftPanel
  onOpenAdditionalInputs={() =>
    setShowAdditionalInputs(true)
  }
/>}

        {/* CENTER */}
        <div style={{ flex: 1, position: "relative" }}>
          <CadArea />

          {/* 🔹 FLOATING LOG WINDOW */}
          {showLog && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: `${logHeight}px`,
                background: "#ffffff",
                borderTop: "2px solid #8DB600",
                display: "flex",
                flexDirection: "column",
                zIndex: 100,
              }}
            >
              {/* DRAG HANDLE */}
              <div
  onMouseDown={() => setIsDragging(true)}
  style={{
    height: "22px",
    cursor: "row-resize",
    background: "#d6d6d6",
    borderBottom: "1px solid #bdbdbd",
    display: "flex",
    alignItems: "center",
    paddingLeft: "12px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#111",
    userSelect: "none",
    flexShrink: 0,
  }}
>
  Log Window
</div>

<LogWindow />
            </div>
          )}
        </div>

        {/* RIGHT */}
        {showRight && <RightPanel />}
      </div>

      {/*  ADDITIONAL INPUTS MODAL */}
      <AdditionalInputsModal
        open={showAdditionalInputs}
        onClose={() => setShowAdditionalInputs(false)}
      />
    </div>
  );
}