import { useEffect, useRef, useState, useCallback } from "react";
import { useBridgeStore } from "../../store/bridgeStore";

// ── Types ────────────────────────────────────────────────────────────────────
type HoverZone = {
  id: string; type: string;
  x: number; y: number; width: number; height: number;
};

// ── Constants ────────────────────────────────────────────────────────────────
// Must match OUT_W / OUT_H in the backend router
const SVG_W = 1400;
const SVG_H = 700;

const HOVER_FILL: Record<string, string> = {
  girder:        "rgba(90,90,90,0.18)",
  cross_bracing: "rgba(120,120,120,0.18)",
  end_diaphragm: "rgba(150,150,150,0.18)",
  bearing:       "rgba(180,180,180,0.18)",
};
const HOVER_STROKE: Record<string, string> = {
  girder:        "#5a5a5a",
  cross_bracing: "#7a7a7a",
  end_diaphragm: "#9a9a9a",
  bearing:       "#b0b0b0",
};

const btnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 4,
  border: "1px solid #bbb", background: "#fff",
  cursor: "pointer", fontWeight: "bold", fontSize: 16,
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 1px 4px rgba(0,0,0,0.15)", color: "#333",
  userSelect: "none",
};
const resetBtnStyle: React.CSSProperties = {
  ...btnStyle, width: 52, fontSize: 11, fontWeight: "normal",
};

// ── Pure fit calculation ─────────────────────────────────────────────────────
function calcFit(cw: number, ch: number) {
  const s  = Math.min(cw / SVG_W, ch / SVG_H) * 1.35;
  const px = (cw - SVG_W * s) / 2;
  const py = (ch - SVG_H * s) / 2;
  return { scale: s, panX: px, panY: py };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TopViewCanvas() {
  const { bridgeInput, hasDesigned } = useBridgeStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // All mutable render data lives in a ref — no async state race possible
  const dr = useRef({
    blobUrl:  "" as string,
    zones:    [] as HoverZone[],
    fitScale: 1,
    fitPanX:  0,
    fitPanY:  0,
  });

  const zoomRef = useRef(1);
  const panRef  = useRef({ x: 0, y: 0 });
  const dragging  = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const prevBlob  = useRef("");   // track blob to revoke

  const [loading,    setLoading]    = useState(false);
  const [rendered,   setRendered]   = useState(false);  // flip to force re-render
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [tooltip,    setTooltip]    = useState({ text: "", x: 0, y: 0 });

  const forceRender = useCallback(() => setRendered(v => !v), []);

  // ── Fit ───────────────────────────────────────────────────────────────────
  const applyFit = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const { scale, panX, panY } = calcFit(c.clientWidth, c.clientHeight);
    dr.current.fitScale = scale;
    dr.current.fitPanX  = panX;
    dr.current.fitPanY  = panY;
    zoomRef.current = 1;
    panRef.current  = { x: 0, y: 0 };
    forceRender();
  }, [forceRender]);

  // Refit on resize
  useEffect(() => {
    const ro = new ResizeObserver(applyFit);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [applyFit]);

  // ── Generate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasDesigned) return;
    const t = setTimeout(runGenerate, 300);
    return () => clearTimeout(t);
  }, [bridgeInput, hasDesigned]);

  async function runGenerate() {
    setLoading(true);

    try {
      // 1. Tell backend to regenerate
      const genRes = await fetch("http://127.0.0.1:8000/top-view/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(bridgeInput),
      });
      if (!genRes.ok) throw new Error(`generate failed: ${genRes.status}`);

      // 2. Fetch normalised SVG (backend always returns 1400×700)
      const svgRes = await fetch(`http://127.0.0.1:8000/top-view/svg?t=${Date.now()}`);
      if (!svgRes.ok) throw new Error(`svg fetch failed: ${svgRes.status}`);
      const svgText = await svgRes.text();

      // 3. Build blob URL — revoke old one first
      if (prevBlob.current) URL.revokeObjectURL(prevBlob.current);
      const blob    = new Blob([svgText], { type: "image/svg+xml" });
      const blobUrl = URL.createObjectURL(blob);
      prevBlob.current   = blobUrl;
      dr.current.blobUrl = blobUrl;

      // 4. Fetch zones (backend returns coords in 0–1400 / 0–700 space)
      const zonesRes  = await fetch(`http://127.0.0.1:8000/top-view/hover-zones?t=${Date.now()}`);
      if (!zonesRes.ok) throw new Error(`zones fetch failed: ${zonesRes.status}`);
      const zonesJson = await zonesRes.json();
      dr.current.zones = zonesJson?.zones || [];

      // 5. Compute fit synchronously right now
      const c = containerRef.current;
      if (c) {
        const { scale, panX, panY } = calcFit(c.clientWidth, c.clientHeight);
        dr.current.fitScale = scale;
        dr.current.fitPanX  = panX;
        dr.current.fitPanY  = panY;
      }
      zoomRef.current = 1;
      panRef.current  = { x: 0, y: 0 };

    } catch (err) {
      console.error("TopView generate error:", err);
    }

    // Always clear loading — triggers re-render which reads updated dr.current
    setLoading(false);
  }

  // Revoke blob on unmount
  useEffect(() => () => { if (prevBlob.current) URL.revokeObjectURL(prevBlob.current); }, []);

  // ── Derived transform ─────────────────────────────────────────────────────
  const d          = dr.current;
  const totalScale = d.fitScale * zoomRef.current;
  const totalPanX  = d.fitPanX  + panRef.current.x;
  const totalPanY  = d.fitPanY  + panRef.current.y;

  // ── Zone → screen ─────────────────────────────────────────────────────────
  // Zones are already in 0–1400/0–700 space — just apply transform
  const getZoneStyle = (zone: HoverZone, isActive: boolean) => {
    const c = containerRef.current;
    if (!c) return {};
    const r = c.getBoundingClientRect();
    return {
      position:      "fixed" as const,
      left:          r.left  + totalPanX + zone.x * totalScale,
      top:           r.top   + totalPanY + zone.y * totalScale,
      width:         zone.width  * totalScale,
      height:        zone.height * totalScale,
      background:    isActive ? HOVER_FILL[zone.type]                  : "transparent",
      border:        isActive ? `2px solid ${HOVER_STROKE[zone.type]}` : "none",
      boxSizing:     "border-box" as const,
      zIndex:        300,
      pointerEvents: "all" as const,
    };
  };

  // ── Mouse pan ─────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current  = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    panRef.current = {
      x: panRef.current.x + e.clientX - lastMouse.current.x,
      y: panRef.current.y + e.clientY - lastMouse.current.y,
    };
    lastMouse.current = { x: e.clientX, y: e.clientY };
    forceRender();
  };
  const stopDrag = () => { dragging.current = false; };

  // ── Zoom buttons ──────────────────────────────────────────────────────────
  const zoomStep = (factor: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const c = containerRef.current;
    if (!c) return;
    const cx = c.clientWidth  / 2;
    const cy = c.clientHeight / 2;
    const oldZ  = zoomRef.current;
    const newZ  = Math.min(Math.max(oldZ * factor, 0.05), 50);
    const ratio = newZ / oldZ;
    panRef.current  = {
      x: cx - ratio * (cx - panRef.current.x),
      y: cy - ratio * (cy - panRef.current.y),
    };
    zoomRef.current = newZ;
    forceRender();
  };

  const doReset = (e: React.MouseEvent) => { e.stopPropagation(); applyFit(); };

  // ── Labels ────────────────────────────────────────────────────────────────
  const getLabel = (type: string) => ({
    girder:        "Girder",
    cross_bracing: "Cross Bracing",
    end_diaphragm: "End Diaphragm",
    bearing:       "Bearing",
  }[type] ?? type);

  // ── Not yet designed ──────────────────────────────────────────────────────
  if (!hasDesigned) {
    return (
      <div style={{ width:"100%", height:"100%", display:"flex",
        alignItems:"center", justifyContent:"center",
        background:"#fff", color:"#777" }}>
        Click Design to generate top view
      </div>
    );
  }

  const hasSvg = !!d.blobUrl && !loading;
  const sortedZones = [...d.zones].sort((a, b) => a.width * a.height - b.width * b.height);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: "8%", left: "2%", width: "96%", height: "72%",
        overflow: "hidden",
        background: "#e0e0e0",
        cursor: dragging.current ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position:"absolute", inset:0, zIndex:10,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"#fff", color:"#999", fontSize:14,
        }}>
          Generating top view…
        </div>
      )}

      {/* SVG — always SVG_W × SVG_H, transformed by CSS */}
      {hasSvg && (
        <img
          src={d.blobUrl}
          alt="Top View"
          draggable={false}
          style={{
            position:        "absolute",
            top: 0, left: 0,
            width:           SVG_W,
            height:          SVG_H,
            transformOrigin: "0 0",
            transform:       `translate(${totalPanX}px,${totalPanY}px) scale(${totalScale})`,
            imageRendering:  "crisp-edges",
            background:      "#fff",
            pointerEvents:   "none",
          }}
        />
      )}

      {/* Hover zones */}
      {hasSvg && sortedZones.map(zone => {
        const isActive = activeZone === zone.id;
        return (
          <div
            key={zone.id}
            style={getZoneStyle(zone, isActive)}
            onMouseEnter={e => {
              setActiveZone(zone.id);
              setTooltip({ text: getLabel(zone.type), x: e.clientX, y: e.clientY });
            }}
            onMouseMove={e => setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))}
            onMouseLeave={() => { setActiveZone(null); setTooltip({ text:"", x:0, y:0 }); }}
          />
        );
      })}

      {/* Zoom controls */}
      <div
        style={{
          position:"absolute", right:10, top:10, zIndex:500,
          display:"flex", flexDirection:"column", gap:6,
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <button style={btnStyle}      onClick={e => zoomStep(1.25, e)}>+</button>
        <button style={btnStyle}      onClick={e => zoomStep(0.8,  e)}>−</button>
        <button style={resetBtnStyle} onClick={doReset}>Reset</button>
      </div>

      {/* Tooltip */}
      {tooltip.text && (
        <div style={{
          position:"fixed",
          left: tooltip.x + 14, top: tooltip.y - 10,
          background:"#1f1f1f", color:"#fff",
          padding:"7px 13px", borderRadius:8,
          fontSize:14, fontWeight:600,
          pointerEvents:"none", zIndex:9999,
          whiteSpace:"nowrap",
          boxShadow:"0 4px 14px rgba(0,0,0,0.35)",
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}