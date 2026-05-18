export const ACCENT = "#90AF13";

export const ZOOM_STEP = 0.15;
export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 8;

export const DEFAULT_CS_ZOOM = 0.85;
export const DEFAULT_TV_ZOOM = 0.80;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const HIGHLIGHT = {
  deck: "rgba(144,175,19,0.18)",
  wearing_course: "rgba(40,40,40,0.22)",
  girder: "rgba(100,120,180,0.20)",
  crash_barrier: "rgba(220,80,80,0.18)",
  railing: "rgba(80,180,220,0.20)",
  footpath: "rgba(180,140,80,0.18)",
  median: "rgba(160,100,200,0.20)",
  cross_bracing: "rgba(200,160,40,0.20)",
  end_diaphragm: "rgba(80,180,120,0.20)",
  bearing: "rgba(220,40,40,0.30)",
};

export const HIGHLIGHT_STROKE = {
  deck: "#90AF13",
  wearing_course: "#444",
  girder: "#6478b4",
  crash_barrier: "#dc5050",
  railing: "#50b4dc",
  footpath: "#b48c50",
  median: "#a064c8",
  cross_bracing: "#c8a028",
  end_diaphragm: "#50b478",
  bearing: "#dc2828",
};

export const defaultHighlight = "rgba(144,175,19,0.18)";

export const btnStyle = {
  width: 28,
  height: 28,
  borderRadius: 4,
  border: "1px solid #bbb",
  background: "#fff",
  cursor: "default",
  fontWeight: "bold",
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
  transition: "background .15s",
};

export const rstBtnStyle = {
  ...btnStyle,
  width: 50,
  fontSize: 11,
  fontWeight: "normal",
};