import { useEffect, useRef, useState, useCallback } from "react";
import svgPanZoom from "svg-pan-zoom";

// ─── Desktop Qt hover: changes element fill to warm-cream / brighter tone ─────
// CSS backdrop-filter modifies the actual SVG pixels behind the overlay div,
// which is the closest equivalent to Qt repainting an element with a new brush.
//
//  Element         Qt normal fill      Qt hovered fill       CSS filter
//  ──────────────────────────────────────────────────────────────────────────
//  deck            rgb(225,225,225)  → rgb(240,240,240)   brightness(1.07)
//  wearing_course  rgb(40,40,40)     → (no hover defined) brightness(1.30)
//  girder          rgb(179,180,160)  → rgb(249,250,230)   brightness(1.39)
//  cross_bracing   rgb(235,236,211)  → (no hover defined) brightness(1.08)
//  crash_barrier   concrete          → rgb(255,250,220)   brightness(1.08) sepia(0.30)
//  railing         concrete          → rgb(255,250,220)   brightness(1.08) sepia(0.30)
//  median          concrete          → rgb(255,250,220)   brightness(1.08) sepia(0.30)
//  footpath        concrete          → rgb(255,250,220)   brightness(1.08) sepia(0.28)

const FILTER: Record<string, string> = {
  deck:           "brightness(1.07)",
  wearing_course: "brightness(1.30)",
  girder:         "brightness(1.39)",
  cross_bracing:  "brightness(1.08)",
  crash_barrier:  "brightness(1.08) sepia(0.30)",
  railing:        "brightness(1.08) sepia(0.30)",
  median:         "brightness(1.08) sepia(0.30)",
  footpath:       "brightness(1.08) sepia(0.28)",
};

type Zone = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  label: string;
};

// SVG current-transformation-matrix: maps SVG user coords → screen pixels
type CTM = { a: number; d: number; e: number; f: number };

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

/** Read the SVG element's current CTM from the DOM, in screen-pixel space. */
function readCTM(svgEl: SVGSVGElement): CTM {
  try {
    const m = svgEl.getScreenCTM();
    if (m) return { a: m.a, d: m.d, e: m.e, f: m.f };
  } catch (_) { /* ignore */ }
  return { a: 1, d: 1, e: 0, f: 0 };
}

export default function CrossSectionCanvas({ svgUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapRef   = useRef<HTMLDivElement>(null);
  const panZoomRef   = useRef<ReturnType<typeof svgPanZoom> | null>(null);

  const [markup,     setMarkup]     = useState<string | null>(null);
  const [zones,      setZones]      = useState<Zone[]>([]);
  const [ctm,        setCtm]        = useState<CTM>({ a: 1, d: 1, e: 0, f: 0 });
  const [activeType, setActiveType] = useState<string | null>(null);
  const [tooltip,    setTooltip]    = useState({ label: "", x: 0, y: 0 });

  // 1. Fetch SVG as inline text
  useEffect(() => {
    if (!svgUrl) { setMarkup(null); return; }
    setMarkup(null);
    fetch(svgUrl)
      .then(r => r.text())
      .then(txt => {
        let out = txt;
        out = out.replace(/font-weight="400"/g, 'font-weight="600"');
        // Remove hardcoded w/h so the SVG is fluid inside its container
        out = out.replace(/(<svg\b[^>]*?)\s+width="[^"]*"/i,  "$1");
        out = out.replace(/(<svg\b[^>]*?)\s+height="[^"]*"/i, "$1");
        // ID + fill-container style for svg-pan-zoom
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
      .then(data => setZones(data.zones ?? []))
      .catch(console.error);
  }, [svgUrl]);

  // 3. Sync CTM — read SVG's actual screen transform matrix.
  //    getScreenCTM() accounts for pan, zoom, scroll, devicePixelRatio
  //    automatically and is the only reliable mapping SVG coords → screen px.
  const syncCTM = useCallback(() => {
    const svgEl = svgWrapRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svgEl) return;
    setCtm(readCTM(svgEl));
  }, []);

  // Helper to compute a tight bounding box from the hover zones.
  // DOM getBBox() often fails or returns 0 for injected SVGs. The zones
  // perfectly bound the structural elements of the bridge, so we calculate
  // their union bounding box and add padding for the dimension lines.
  const getContentBBox = useCallback(() => {
    if (!zones || zones.length === 0) return null;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const z of zones) {
      minX = Math.min(minX, z.x);
      minY = Math.min(minY, z.y);
      maxX = Math.max(maxX, z.x + z.width);
      maxY = Math.max(maxY, z.y + z.height);
    }
    
    if (minX !== Infinity) {
      // Add padding for dimension lines which are drawn outside the structure
      const PAD_X = 120;
      const PAD_Y_TOP = 150; // carriageway dims above deck
      const PAD_Y_BOT = 250; // overall width dims below girders
      
      return {
        x: minX - PAD_X,
        y: minY - PAD_Y_TOP,
        width: (maxX - minX) + 2 * PAD_X,
        height: (maxY - minY) + PAD_Y_TOP + PAD_Y_BOT
      };
    }
    return null;
  }, [zones]);

  // 4. Init svg-pan-zoom once the SVG is injected into the DOM.
  //    We compute a tight viewBox around the actual drawn content (bridge + dimensions),
  //    so fit:true scales the important part to fill the container instead of the
  //    mostly-empty 1400x700 canvas.
  useEffect(() => {
    if (!markup || zones.length === 0) return;
    const t = setTimeout(() => {
      const svgEl = svgWrapRef.current?.querySelector<SVGSVGElement>("svg");
      if (!svgEl) return;

      // ── Step 1: Tighten the viewBox to actual content bounds ──────────────
      const bbox = getContentBBox();
      if (bbox) {
        svgEl.setAttribute(
          "viewBox",
          `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
        );
      }

      // ── Step 2: Initialise svg-pan-zoom ───────────────────────────────────
      panZoomRef.current?.destroy();
      panZoomRef.current = svgPanZoom(svgEl as SVGSVGElement, {
        zoomEnabled:          true,
        panEnabled:           true,
        controlIconsEnabled:  false,
        fit:                  true,
        center:               true,
        minZoom:              0.1,
        maxZoom:              20,
        zoomScaleSensitivity: 0.3,
        onUpdatedCTM: syncCTM,
        onZoom:       syncCTM,
        onPan:        syncCTM,
      });

      setTimeout(syncCTM, 80);
    }, 150);

    return () => {
      clearTimeout(t);
      panZoomRef.current?.destroy();
      panZoomRef.current = null;
    };
  }, [markup, syncCTM, getContentBBox]);


  // 5. Re-sync on container resize
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      panZoomRef.current?.resize();
      setTimeout(syncCTM, 30);
    });
    if (svgWrapRef.current) ro.observe(svgWrapRef.current);
    return () => ro.disconnect();
  }, [syncCTM, markup]);

  // Re-sync on scroll (fixed-position overlays need updated screen offset)
  useEffect(() => {
    const onScroll = () => syncCTM();
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [syncCTM]);

  // 6. Zoom button handlers
  const zoomIn  = (e: React.MouseEvent) => {
    e.stopPropagation();
    panZoomRef.current?.zoomIn();
    syncCTM();
  };
  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    panZoomRef.current?.zoomOut();
    syncCTM();
  };
  const fitView = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pz = panZoomRef.current;
    if (!pz) return;
    // Re-tighten viewBox and reset fit/center (same as initial load)
    const svgEl = svgWrapRef.current?.querySelector<SVGSVGElement>("svg");
    if (svgEl) {
      const bbox = getContentBBox(); // now uses zones, not svgEl
      if (bbox) {
        svgEl.setAttribute(
          "viewBox",
          `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
        );
        pz.updateBBox(); // tell svg-pan-zoom the viewBox changed
      }
    }
    pz.fit(); pz.center();
    setTimeout(syncCTM, 60);
  };

  // 7. Zone deduplication (singleton types merged; per-instance types kept separate)
  const KEEP_INDIVIDUAL = new Set(["girder", "cross_bracing"]);

  const deduplicatedZones = (() => {
    const merged: Record<string, Zone> = {};
    const individuals: Zone[] = [];
    for (const z of zones) {
      if (KEEP_INDIVIDUAL.has(z.type)) {
        individuals.push(z);
      } else {
        if (!merged[z.type]) {
          merged[z.type] = { ...z };
        } else {
          const ex = merged[z.type];
          const x1 = Math.min(ex.x, z.x);
          const y1 = Math.min(ex.y, z.y);
          const x2 = Math.max(ex.x + ex.width, z.x + z.width);
          const y2 = Math.max(ex.y + ex.height, z.y + z.height);
          merged[z.type] = { ...ex, x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
        }
      }
    }
    // Sort smallest-area-first so the most specific (small) zone wins on hover
    return [...Object.values(merged), ...individuals].sort(
      (a, b) => a.width * a.height - b.width * b.height
    );
  })();

  // 8. Hover hit-test — runs on mousemove over the container.
  //    The overlay divs have pointer-events: none so this handler receives ALL
  //    mouse events without the overlays intercepting them.
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const mx = e.clientX;
    const my = e.clientY;
    let hitZone: Zone | null = null;

    for (const zone of deduplicatedZones) {
      const sx = ctm.e + zone.x * ctm.a;
      const sy = ctm.f + zone.y * ctm.d;
      const sw = Math.max(1, zone.width  * ctm.a);
      const sh = Math.max(1, zone.height * ctm.d);
      if (mx >= sx && mx <= sx + sw && my >= sy && my <= sy + sh) {
        hitZone = zone; // zones sorted smallest-first → first match = most specific
        break;
      }
    }

    if (hitZone) {
      setActiveType(hitZone.type);
      setTooltip({ label: hitZone.label, x: mx, y: my });
    } else {
      setActiveType(null);
      setTooltip({ label: "", x: 0, y: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctm, deduplicatedZones]);

  const handleMouseLeave = useCallback(() => {
    setActiveType(null);
    setTooltip({ label: "", x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#ffffff",
        // Mouse events for hover detection (overlay divs are pointer-events: none)
        cursor: activeType ? "default" : "grab",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      {/* Inline SVG — fills the whole panel, svg-pan-zoom handles fit+pan+zoom */}
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

      {/* ── Backdrop-filter overlay divs ─────────────────────────────────────
          CRITICAL: pointerEvents = "none" on every overlay div.
          This means svg-pan-zoom receives ALL wheel / mousedown / mousemove
          events for zoom and pan. Hover detection is done entirely by the
          container's onMouseMove handler above (hit-testing zone bboxes).
          backdrop-filter then modifies the SVG pixels directly — no color wash.
      */}
      {markup && deduplicatedZones.map((zone, i) => {
        const isActive = activeType === zone.type;
        const filter   = FILTER[zone.type] ?? "brightness(1.08)";

        const screenX = ctm.e + zone.x * ctm.a;
        const screenY = ctm.f + zone.y * ctm.d;
        const screenW = Math.max(1, zone.width  * ctm.a);
        const screenH = Math.max(1, zone.height * ctm.d);

        return (
          <div
            key={`${zone.type}-${i}`}
            style={{
              position:           "fixed",
              left:               screenX,
              top:                screenY,
              width:              screenW,
              height:             screenH,
              background:         "transparent",
              backdropFilter:     isActive ? filter : "none",
              WebkitBackdropFilter: isActive ? filter : "none",
              border:             "none",
              borderRadius:       0,
              zIndex:             200 + (deduplicatedZones.length - i),
              // NEVER intercept pointer events — svg-pan-zoom must get them all
              pointerEvents:      "none",
              transition:         "backdrop-filter 0s, -webkit-backdrop-filter 0s",
            }}
          />
        );
      })}

      {/* Zoom controls — above overlays, own pointer events */}
      <div
        style={{
          position: "absolute", right: 10, top: 10, zIndex: 600,
          display: "flex", flexDirection: "column", gap: 6,
          pointerEvents: "all",
        }}
        onMouseDown={e => e.stopPropagation()}
        onMouseMove={e => e.stopPropagation()}
      >
        <button style={btnBase}       onClick={zoomIn}  title="Zoom in">+</button>
        <button style={btnBase}       onClick={zoomOut} title="Zoom out">−</button>
        <button style={resetBtnStyle} onClick={fitView} title="Fit to screen">Reset</button>
      </div>

      {/* Tooltip — follows cursor, positioned at fixed screen coords */}
      {tooltip.label && (
        <div style={{
          position: "fixed",
          left: tooltip.x + 14, top: tooltip.y - 10,
          background: "#1f1f1f", color: "#fff",
          padding: "6px 12px", borderRadius: 7,
          fontSize: 13, fontWeight: 600, fontFamily: "sans-serif",
          pointerEvents: "none", zIndex: 9999,
          whiteSpace: "nowrap", boxShadow: "0 3px 12px rgba(0,0,0,0.32)",
        }}>
          {tooltip.label}
        </div>
      )}
    </div>
  );
}