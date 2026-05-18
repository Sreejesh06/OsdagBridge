import { useEffect, useRef, useState, useCallback } from "react";
import svgPanZoom from "svg-pan-zoom";

const ACCENT = "#90AF13";

const HIGHLIGHT: Record<string, string> = {
  deck:           "rgba(144,175,19,0.25)",
  wearing_course: "rgba(40,40,40,0.28)",
  girder:         "rgba(100,120,180,0.30)",
  crash_barrier:  "rgba(220,80,80,0.25)",
  railing:        "rgba(80,180,220,0.25)",
  footpath:       "rgba(180,140,80,0.25)",
  median:         "rgba(160,100,200,0.25)",
  cross_bracing:  "rgba(200,160,40,0.25)",
};

type Zone = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  label: string;
};

type Props = {
  svgUrl: string;
};

const btnBase: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 4,
  border: "1px solid #bbb", background: "#fff",
  cursor: "pointer", fontWeight: "bold", fontSize: 16,
  display: "flex", alignItems: "center", justifyContent: "center",
  userSelect: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
  color: "#333",
};

const resetBtnStyle: React.CSSProperties = {
  ...btnBase, width: 52, fontSize: 11, fontWeight: "normal",
};

export default function CrossSectionCanvas({ svgUrl }: Props) {
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const panZoomRef = useRef<ReturnType<typeof svgPanZoom> | null>(null);

  const [markup,     setMarkup]     = useState<string | null>(null);
  const [zones,      setZones]      = useState<Zone[]>([]);
  const [widgetW,    setWidgetW]    = useState(1400);
  const [widgetH,    setWidgetH]    = useState(900);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [tooltip,    setTooltip]    = useState({ label: "", x: 0, y: 0 });
  const [ovScale,    setOvScale]    = useState({ sx: 1, sy: 1 });
  const [ovOffset,   setOvOffset]   = useState({ ox: 0, oy: 0 });

  // 1. Fetch SVG as inline text
  useEffect(() => {
    if (!svgUrl) { setMarkup(null); return; }
    setMarkup(null);
    fetch(svgUrl)
      .then(r => r.text())
      .then(txt => {
        let out = txt;
        // Qt exports tiny fonts — scale them up
        out = out.replace(/font-size="([0-9.]+)"/g, (_, s) =>
          `font-size="${Math.max(parseFloat(s) * 2.2, 14)}"`);
        // Remove fixed dimensions so the viewBox drives layout
        out = out.replace(/(<svg\b[^>]*?)\s+width="[^"]*"/i,  "$1");
        out = out.replace(/(<svg\b[^>]*?)\s+height="[^"]*"/i, "$1");
        // Give svg-pan-zoom a handle and make it fill its container
        out = out.replace(
          /(<svg\b)/i,
          '$1 id="bridge-svg" style="display:block;width:100%;height:100%;" '
        );
        setMarkup(out);
      })
      .catch(console.error);
  }, [svgUrl]);

  // 2. Fetch hover zones from backend
  useEffect(() => {
    if (!svgUrl) return;
    const zonesUrl = svgUrl.replace(/\/svg(\?.*)?$/, "/hover-zones");
    fetch(zonesUrl)
      .then(r => r.json())
      .then(data => {
        setZones(data.zones           ?? []);
        setWidgetW(data.widget_width  ?? 1400);
        setWidgetH(data.widget_height ?? 900);
      })
      .catch(console.error);
  }, [svgUrl]);

  // 3. Compute overlay positions from svg-pan-zoom's internal CTM
  const syncOverlay = useCallback(() => {
    const pz   = panZoomRef.current;
    const wrap = svgWrapRef.current;
    if (!pz || !wrap) return;

    const pan  = pz.getPan();
    const zoom = pz.getZoom();
    const r    = wrap.getBoundingClientRect();

    // Pixels per SVG coordinate unit
    const sx = zoom * r.width  / widgetW;
    const sy = zoom * r.height / widgetH;

    // svg-pan-zoom centers content before applying pan
    const baseOx = r.left + (r.width  - widgetW * sx) / 2;
    const baseOy = r.top  + (r.height - widgetH * sy) / 2;

    setOvScale({ sx, sy });
    setOvOffset({ ox: baseOx + pan.x, oy: baseOy + pan.y });
  }, [widgetW, widgetH]);

  // 4. Init svg-pan-zoom once markup is injected
  useEffect(() => {
    if (!markup) return;
    const t = setTimeout(() => {
      const svgEl = svgWrapRef.current?.querySelector("svg");
      if (!svgEl) return;

      panZoomRef.current?.destroy();
      panZoomRef.current = svgPanZoom(svgEl as SVGSVGElement, {
        zoomEnabled:          true,
        controlIconsEnabled:  false,
        fit:                  true,
        center:               true,
        minZoom:              0.2,
        maxZoom:              20,
        zoomScaleSensitivity: 0.25,
        onUpdatedCTM: syncOverlay,
        onZoom:       syncOverlay,
        onPan:        syncOverlay,
      });
      setTimeout(syncOverlay, 60);
    }, 120);

    return () => {
      clearTimeout(t);
      panZoomRef.current?.destroy();
      panZoomRef.current = null;
    };
  }, [markup, syncOverlay]);

  // 5. Re-sync when container resizes (window resize, panel resize)
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      panZoomRef.current?.resize();
      setTimeout(syncOverlay, 30);
    });
    if (svgWrapRef.current) ro.observe(svgWrapRef.current);
    return () => ro.disconnect();
  }, [syncOverlay, markup]);

  // 6. Zoom button handlers
  const zoomIn  = (e: React.MouseEvent) => { e.stopPropagation(); panZoomRef.current?.zoomIn();  syncOverlay(); };
  const zoomOut = (e: React.MouseEvent) => { e.stopPropagation(); panZoomRef.current?.zoomOut(); syncOverlay(); };
  const fitView = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pz = panZoomRef.current;
    if (!pz) return;
    pz.resetZoom(); pz.resetPan(); pz.fit(); pz.center();
    setTimeout(syncOverlay, 60);
  };

  // 7. Smallest zones on top so specific elements win over large backgrounds
  const sortedZones = [...zones].sort(
    (a, b) => a.width * a.height - b.width * b.height
  );

  const PAD = 8;

  return (
    <div style={{
      position: "absolute",
      top: "8%",
      left: "2%",
      width: "96%",
      height: "72%",
       overflow: "hidden",
      background: "#e0e0e0",
    }}>

      {/* Inline SVG — fills the whole panel, svg-pan-zoom handles fit */}
      <div
        ref={svgWrapRef}
        style={{ position: "absolute", inset: 0, background: "#ffffff" }}
        dangerouslySetInnerHTML={{ __html: markup ?? "" }}
      />

      {/* Loading placeholder */}
      {!markup && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#bbb", fontSize: 14, fontFamily: "sans-serif",
        }}>
          Loading cross-section…
        </div>
      )}

      {/* Hover overlays — use fixed positioning so they follow pan/zoom */}
      {markup && sortedZones.map((zone, i) => {
        const isActive = activeType === zone.type;
        return (
          <div
            key={i}
            style={{
              position:  "fixed",
              left:      ovOffset.ox + (zone.x - PAD) * ovScale.sx,
              top:       ovOffset.oy + (zone.y - PAD) * ovScale.sy,
              width:     (zone.width  + PAD * 2) * ovScale.sx,
              height:    (zone.height + PAD * 2) * ovScale.sy,
              background: isActive
                ? (HIGHLIGHT[zone.type] ?? "rgba(144,175,19,0.22)")
                : "transparent",
              border:     isActive ? `2px solid ${ACCENT}` : "none",
              borderRadius: 4,
              zIndex:    200 + (sortedZones.length - i),
              cursor:    "default",
              boxSizing: "border-box",
              transition: "background .1s",
              pointerEvents: "all",
            }}
            onMouseEnter={e => {
              setActiveType(zone.type);
              setTooltip({ label: zone.label, x: e.clientX, y: e.clientY });
            }}
            onMouseMove={e =>
              setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))
            }
            onMouseLeave={() => {
              setActiveType(null);
              setTooltip({ label: "", x: 0, y: 0 });
            }}
          />
        );
      })}

      {/* Zoom controls */}
      <div
        style={{
          position: "absolute", right: 10, top: 10, zIndex: 500,
          display: "flex", flexDirection: "column", gap: 6,
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <button style={btnBase}       onClick={zoomIn}  title="Zoom in">+</button>
        <button style={btnBase}       onClick={zoomOut} title="Zoom out">−</button>
        <button style={resetBtnStyle} onClick={fitView} title="Fit to screen">Reset</button>
      </div>

      {/* Tooltip */}
      {tooltip.label && (
        <div style={{
          position: "fixed",
          left: tooltip.x + 14, top: tooltip.y - 10,
          background: "#1f1f1f", color: "#fff",
          padding: "7px 13px", borderRadius: 8,
          fontSize: 14, fontWeight: 600, fontFamily: "sans-serif",
          pointerEvents: "none", zIndex: 9999,
          whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}>
          {tooltip.label}
        </div>
      )}
    </div>
  );
}