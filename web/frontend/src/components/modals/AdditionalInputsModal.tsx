import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import CrossSectionCanvas from "../cad/CrossSectionCanvas";
import { useBridgeStore } from "../../store/bridgeStore";

const GREEN = "#95b80f";
const API   = "http://127.0.0.1:8000";

type Props = {
  open: boolean;
  onClose: () => void;
};

// ── helpers ──────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14 }}>{children}</div>;
}

function Input({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      style={{
        width: "70%", height: 24,
        borderRadius: 14, border: "2px solid #444",
        background: "#f7f7f7", padding: "0 12px", fontSize: 12,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdditionalInputsModal({ open, onClose }: Props) {
  const { svgUrl, hasDesigned, bridgeData, setBridgeData, setSvgUrl } =
    useBridgeStore();

  // Local form state — initialised from store whenever modal opens
  const [form, setForm] = useState({
    girderSpacing:      "",
    noOfGirders:        "",
    deckOverhangWidth:  "",
    overallBridgeWidth: "",
    deckThickness:      "",
    footpathThickness:  "",
    footpathWidth:      "",
  });

  // URL shown in the modal's preview CAD — refreshed live as form changes
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topTabs    = ["Typical Section Details","Member Properties","Loading","Support Conditions","Analysis/Design Options","Design Options (Cont.)"];
  const bottomTabs = ["Layout","Crash Barrier","Median","Railing","Wearing Course","Lane Details"];

  // ── Sync form from store when modal opens ────────────────────────────────
  useEffect(() => {
    if (!open || !bridgeData) return;
    setForm({
      girderSpacing:      String(bridgeData.girder_spacing      ?? "4"),
      noOfGirders:        String(bridgeData.no_of_girders       ?? "4"),
      deckOverhangWidth:  String(bridgeData.deck_overhang_width ?? "1"),
      overallBridgeWidth: String(bridgeData.overall_bridge_width ?? "12"),
      deckThickness:      String(bridgeData.deck_thickness      ?? "250"),
      footpathThickness:  String(bridgeData.footpath_thickness  ?? "150"),
      footpathWidth:      String(bridgeData.footpath_width      ?? "1.5"),
    });
    // Show the current SVG immediately when modal opens
    setPreviewUrl(svgUrl ? `${svgUrl}&t=${Date.now()}` : "");
  }, [open]);  // only run when open changes — NOT on every bridgeData update

  // ── Send form to backend and get back a fresh SVG URL ────────────────────
  const generatePreview = useCallback(async (currentForm: typeof form) => {
    setPreviewLoading(true);
    try {
      const payload = {
        ...bridgeData,
        girder_spacing:       Number(currentForm.girderSpacing),
        no_of_girders:        Number(currentForm.noOfGirders),
        deck_overhang_width:  Number(currentForm.deckOverhangWidth),
        overall_bridge_width: Number(currentForm.overallBridgeWidth),
        deck_thickness:       Number(currentForm.deckThickness),
        footpath_thickness:   Number(currentForm.footpathThickness),
        footpath_width:       Number(currentForm.footpathWidth),
      };

      const res = await fetch(`${API}/cross-section/generate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (res.ok) {
        // Backend regenerated the SVG — bust the cache with timestamp
        setPreviewUrl(`${API}/cross-section/svg?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Preview generation failed:", err);
    } finally {
      setPreviewLoading(false);
    }
  }, [bridgeData]);

  // ── Live preview: debounce 600 ms after any field change ─────────────────
  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);

    // Debounce so we don't spam the backend on every keypress
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      generatePreview(next);
    }, 600);
  };

  // ── Defaults ─────────────────────────────────────────────────────────────
  const handleDefaults = () => {
    const defaults = {
      girderSpacing:      "4",
      noOfGirders:        "4",
      deckOverhangWidth:  "1",
      overallBridgeWidth: "12",
      deckThickness:      "250",
      footpathThickness:  "150",
      footpathWidth:      "1.5",
    };
    setForm(defaults);
    generatePreview(defaults);
  };

  // ── Save: persist to store + update main dashboard CAD + close ───────────
  const handleSave = async () => {
    const updatedData = {
      ...bridgeData,
      girder_spacing:       Number(form.girderSpacing),
      no_of_girders:        Number(form.noOfGirders),
      deck_overhang_width:  Number(form.deckOverhangWidth),
      overall_bridge_width: Number(form.overallBridgeWidth),
      deck_thickness:       Number(form.deckThickness),
      footpath_thickness:   Number(form.footpathThickness),
      footpath_width:       Number(form.footpathWidth),
    };

    try {
      const res = await fetch(`${API}/cross-section/generate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updatedData),
      });

      if (res.ok) {
        const newSvgUrl = `${API}/cross-section/svg?t=${Date.now()}`;

        // 1. Persist updated data so re-opening the modal stays in sync
        setBridgeData(updatedData);

        // 2. Update the main dashboard SVG URL so CadArea reflects the change
        setSvgUrl(newSvgUrl);
      }
    } catch (err) {
      console.error("Save failed:", err);
    }

    // Close regardless — if the request failed the old CAD is still shown
    onClose();
  };

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.15)",
            zIndex: 5000,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40, rotateX: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 18, stiffness: 170 }}
            style={{
              width: "84%", height: "90%",
              background: "#efefef", border: "1px solid #8b8b8b",
              display: "flex", flexDirection: "column",
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              borderRadius: 4, overflow: "hidden", fontFamily: "sans-serif",
            }}
          >
            {/* HEADER */}
            <div style={{
              height: 54, background: "#ececec",
              borderBottom: "1px solid #9f9f9f",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "0 18px",
            }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Additional Inputs</div>
              <div style={{ display: "flex", gap: 18, fontSize: 12, alignItems: "center" }}>
                <span style={{ cursor: "pointer" }}>−</span>
                <span style={{ cursor: "pointer" }}>□</span>
                <span onClick={onClose} style={{ cursor: "pointer" }}>×</span>
              </div>
            </div>

            {/* TOP TABS */}
            <div style={{ display: "flex", borderBottom: "1px solid #7a7a7a", background: "#efefef" }}>
              {topTabs.map((tab, i) => (
                <div key={tab} style={{
                  padding: "8px 14px", borderRight: "1px solid #7a7a7a",
                  background: i === 0 ? GREEN : "#ececec",
                  color: i === 0 ? "white" : "#555",
                  fontSize: 12, lineHeight: "22px",
                }}>
                  {tab}
                </div>
              ))}
            </div>

            {/* CAD PREVIEW */}
            <div style={{
              margin: 10, border: "1px solid #555", borderRadius: 10,
              background: "#ffffff", height: 270,
              position: "relative", overflow: "hidden",
            }}>
              {/* Loading overlay */}
              {previewLoading && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 10,
                  background: "rgba(255,255,255,0.6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: "#666", fontFamily: "sans-serif",
                }}>
                  Updating preview…
                </div>
              )}

              {hasDesigned && previewUrl ? (
                <CrossSectionCanvas svgUrl={previewUrl} />
              ) : (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#777", fontSize: 18, fontWeight: 600, letterSpacing: 1,
                }}>
                  Cross Section Preview
                </div>
              )}
            </div>

            {/* LOWER TABS */}
            <div style={{ display: "flex", margin: "0 14px", border: "1px solid #555" }}>
              {bottomTabs.map((tab, i) => (
                <div key={tab} style={{
                  flex: 1, padding: 8, textAlign: "center",
                  borderRight: i !== bottomTabs.length - 1 ? "1px solid #555" : "none",
                  background: i === 0 ? GREEN : "#ececec",
                  color: i === 0 ? "white" : "#555", fontSize: 12,
                }}>
                  {tab}
                </div>
              ))}
            </div>

            {/* FORM */}
            <div style={{
              flex: 1, margin: 14, border: "1px solid #555",
              borderRadius: 12, background: "#f7f7f7", padding: "18px 24px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Inputs:</div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 240px 1fr 240px",
                rowGap: 14, columnGap: 30, alignItems: "center",
              }}>
                <Label>Girder Spacing (m):</Label>
                <Input value={form.girderSpacing}
                  onChange={e => updateField("girderSpacing", e.target.value)} />

                <Label>No. of Girders:</Label>
                <Input value={form.noOfGirders}
                  onChange={e => updateField("noOfGirders", e.target.value)} />

                <Label>Deck Overhang Width (m):</Label>
                <Input value={form.deckOverhangWidth}
                  onChange={e => updateField("deckOverhangWidth", e.target.value)} />

                <div style={{ fontSize: 12, fontStyle: "italic" }}>Values adjusted for:</div>
                <div />

                <Label>Overall Bridge Width (m):</Label>
                <Input value={form.overallBridgeWidth}
                  onChange={e => updateField("overallBridgeWidth", e.target.value)} />

                <div /><div />

                <Label>Deck Thickness (mm):</Label>
                <Input value={form.deckThickness}
                  onChange={e => updateField("deckThickness", e.target.value)} />

                <div /><div />

                <Label>Footpath Thickness (mm):</Label>
                <Input value={form.footpathThickness}
                  onChange={e => updateField("footpathThickness", e.target.value)} />

                <Label>Footpath Width (m):</Label>
                <Input value={form.footpathWidth}
                  onChange={e => updateField("footpathWidth", e.target.value)} />
              </div>
            </div>

            {/* FOOTER */}
            <div style={{
              height: 54, background: "#d8d8d8", borderTop: "1px solid #aaa",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 240,
            }}>
              <button onClick={handleDefaults} style={{
                width: 90, height: 30, fontSize: 14,
                background: "#efefef", border: "1px solid #444", cursor: "pointer",
              }}>
                Defaults
              </button>

              <button onClick={handleSave} style={{
                width: 90, height: 30, fontSize: 14,
                background: "#efefef", border: "1px solid #444", cursor: "pointer",
              }}>
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}