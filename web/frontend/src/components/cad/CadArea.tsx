import { useRef, useState, useCallback } from "react";
import TopViewCanvas from "./TopViewCanvas";
import CrossSectionCanvas from "./CrossSectionCanvas";
import { useBridgeStore } from "../../store/bridgeStore";

import {
  ZOOM_STEP,
  ZOOM_MIN,
  ZOOM_MAX,
  DEFAULT_TV_ZOOM,
  btnStyle,
  rstBtnStyle,
  clamp,
} from "../constants/cadConstants";

// ─── Pan/zoom hook ───────────────────────────────────────────────────────────
function usePanZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const zoomIn = () =>
    setZoom((z) => clamp(z + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));

  const zoomOut = () =>
    setZoom((z) => clamp(z - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));

  const resetView = (dz = initialZoom) => {
    setZoom(dz);
    setPan({ x: 0, y: 0 });
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;

    dragging.current = true;

    lastPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;

    setPan((p) => ({
      x: p.x + e.clientX - lastPos.current.x,
      y: p.y + e.clientY - lastPos.current.y,
    }));

    lastPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const stopDrag = () => {
    dragging.current = false;
  };

  return {
    zoom,
    pan,
    zoomIn,
    zoomOut,
    resetView,
    onMouseDown,
    onMouseMove,
    stopDrag,
  };
}

// ─── Shared Zoom Buttons ────────────────────────────────────────────────────
function ZoomButtons({ onZoomIn, onZoomOut, onReset, top = 12 }) {
  return (
    <div
      style={{
        position: "absolute",
        right: 10,
        top,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        zIndex: 30,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button onClick={onZoomIn} style={btnStyle}>
        +
      </button>

      <button onClick={onZoomOut} style={btnStyle}>
        −
      </button>

      <button onClick={onReset} style={rstBtnStyle}>
        Reset
      </button>
    </div>
  );
}

// ─── Tooltip ────────────────────────────────────────────────────────────────
function Tooltip({ label, x, y }) {
  if (!label) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: x + 14,
        top: y - 10,
        background: "#1f1f1f",
        color: "#fff",
        padding: "8px 14px",
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 600,
        fontFamily: "sans-serif",
        pointerEvents: "none",
        zIndex: 9999,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
      }}
    >
      {label}
    </div>
  );
}

// ─── Top View Panel ─────────────────────────────────────────────────────────
function TopViewPanel() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <TopViewCanvas />
    </div>
  );
}

// ─── Root ───────────────────────────────────────────────────────────────────
export default function CadArea() {
  const { svgUrl, hasDesigned } = useBridgeStore();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        background: "#ddd",
      }}
    >
      {/* Cross Section */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {hasDesigned && svgUrl ? (
          <CrossSectionCanvas svgUrl={svgUrl} />
        ) : (
          <div
            style={{
              position: "absolute",
              top: "8%",
              left: "2%",
              width: "96%",
              height: "72%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#bbb",
              fontSize: 14,
              fontFamily: "sans-serif",
            }}
          >
            Cross-section will appear here after Design
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 6,
          background: "#cfcfcf",
          borderTop: "1px solid #bbb",
          borderBottom: "1px solid #bbb",
          flexShrink: 0,
        }}
      />

      {/* Top View */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <TopViewPanel />
      </div>
    </div>
  );
}