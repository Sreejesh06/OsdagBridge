import React from "react";
import { Label, Select } from "../../SharedComponents";
import { STANDARD_ANGLE_SECTIONS, STANDARD_CHANNEL_SECTIONS, ROLLED_IS_SECTIONS } from "../../../../constants/memberConstants";

interface EndDiaphragmDetailsTabProps {
  memberProps: any;
  updateEndDiaphragmField: (field: string, value: any) => void;
}

const GREEN = "#95b80f";

export default function EndDiaphragmDetailsTab({
  memberProps,
  updateEndDiaphragmField,
}: EndDiaphragmDetailsTabProps) {
  const d = memberProps.end_diaphragm || {};
  const isCross = d.type === "Cross Bracing";
  const isRolled = d.type === "Rolled Beam";
  const isWelded = d.type === "Welded Beam";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {/* Left: Inputs */}
      <div style={{ background: "#ffffff", border: "1px solid #bbb", borderRadius: 8, padding: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 12 }}>End Diaphragm Details</span>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.25fr", rowGap: 10, columnGap: 14, alignItems: "center" }}>
          <Label>Type:</Label>
          <Select
            value={d.type || "Cross Bracing"}
            onChange={e => updateEndDiaphragmField("type", e.target.value)}
            options={["Cross Bracing", "Rolled Beam", "Welded Beam"]}
          />

          {(() => {
            if (isCross) {
              const isCustom = d.cross_design === "Custom";
              const isKBrace = d.cross_bracing_type === "K-Bracing";
              return (
                <>
                  <Label>Design:</Label>
                  <Select
                    value={d.cross_design || "Optimized"}
                    onChange={e => updateEndDiaphragmField("cross_design", e.target.value)}
                    options={["Optimized", "Custom"]}
                  />

                  <Label>Type of Bracing:</Label>
                  <Select
                    value={d.cross_bracing_type || "K-Bracing"}
                    onChange={e => updateEndDiaphragmField("cross_bracing_type", e.target.value)}
                    options={["K-Bracing", "X-Bracing"]}
                    disabled={!isCustom}
                  />

                  <Label>Bracing Section Type:</Label>
                  <Select
                    value={d.cross_bracing_section_type || "Angle"}
                    onChange={e => updateEndDiaphragmField("cross_bracing_section_type", e.target.value)}
                    options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                    disabled={!isCustom}
                  />

                  <Label>Bracing Section Designation:</Label>
                  <Select
                    value={d.cross_bracing_section || "ISA 5050x6"}
                    onChange={e => updateEndDiaphragmField("cross_bracing_section", e.target.value)}
                    options={d.cross_bracing_section_type?.includes("Channel") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                    disabled={!isCustom}
                  />

                  <div style={{ height: 1, background: "#ddd", gridColumn: "span 2", margin: "6px 0" }} />

                  <Label>Top Chord:</Label>
                  <input
                    type="checkbox"
                    checked={d.cross_top_chord_checkbox || false}
                    onChange={e => updateEndDiaphragmField("cross_top_chord_checkbox", e.target.checked)}
                    disabled={!isCustom}
                    style={{ width: 16, height: 16 }}
                  />

                  <Label>Top Chord Section Type:</Label>
                  <Select
                    value={d.cross_top_chord_type || "Angle"}
                    onChange={e => updateEndDiaphragmField("cross_top_chord_type", e.target.value)}
                    options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                    disabled={!isCustom || !d.cross_top_chord_checkbox}
                  />

                  <Label>Top Chord Section Designation:</Label>
                  <Select
                    value={d.cross_top_chord_size || "ISA 5050x6"}
                    onChange={e => updateEndDiaphragmField("cross_top_chord_size", e.target.value)}
                    options={d.cross_top_chord_type?.includes("Channel") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                    disabled={!isCustom || !d.cross_top_chord_checkbox}
                  />

                  <div style={{ height: 1, background: "#ddd", gridColumn: "span 2", margin: "6px 0" }} />

                  <Label>Bottom Chord:</Label>
                  <input
                    type="checkbox"
                    checked={isKBrace ? true : (d.cross_bottom_chord_checkbox ?? true)}
                    onChange={e => updateEndDiaphragmField("cross_bottom_chord_checkbox", e.target.checked)}
                    disabled={!isCustom || isKBrace}
                    style={{ width: 16, height: 16 }}
                  />

                  <Label>Bottom Chord Section Type:</Label>
                  <Select
                    value={d.cross_bottom_chord_type || "Angle"}
                    onChange={e => updateEndDiaphragmField("cross_bottom_chord_type", e.target.value)}
                    options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                    disabled={!isCustom || !(isKBrace ? true : d.cross_bottom_chord_checkbox)}
                  />

                  <Label>Bottom Chord Section Designation:</Label>
                  <Select
                    value={d.cross_bottom_chord_size || "ISA 5050x6"}
                    onChange={e => updateEndDiaphragmField("cross_bottom_chord_size", e.target.value)}
                    options={d.cross_bottom_chord_type?.includes("Channel") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                    disabled={!isCustom || !(isKBrace ? true : d.cross_bottom_chord_checkbox)}
                  />
                </>
              );
            }

            if (isRolled) {
              return (
                <>
                  <Label>Design:</Label>
                  <Select
                    value={d.rolled_design || "Optimized"}
                    onChange={e => updateEndDiaphragmField("rolled_design", e.target.value)}
                    options={["Optimized", "Custom"]}
                  />

                  <Label>IS Section:</Label>
                  <Select
                    value={d.rolled_is_section || "ISMB 500"}
                    onChange={e => updateEndDiaphragmField("rolled_is_section", e.target.value)}
                    options={ROLLED_IS_SECTIONS}
                    disabled={d.rolled_design !== "Custom"}
                  />
                </>
              );
            }

            if (isWelded) {
              return (
                <>
                  <Label>Design:</Label>
                  <Select
                    value={d.welded_design || "Optimized"}
                    onChange={e => updateEndDiaphragmField("welded_design", e.target.value)}
                    options={["Optimized", "Custom"]}
                  />

                  <Label>Symmetry:</Label>
                  <Select
                    value={d.welded_symmetry || "Girder Symmetric"}
                    onChange={e => updateEndDiaphragmField("welded_symmetry", e.target.value)}
                    options={["Girder Symmetric", "Girder Unsymmetric"]}
                    disabled={d.welded_design !== "Custom"}
                  />
                </>
              );
            }

            return null;
          })()}
        </div>
      </div>

      {/* Right: Dynamic Visualizer */}
      <div style={{ background: "#ffffff", border: "1px solid #bbb", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 12 }}>Diaphragm Layout Diagram</span>
        <div style={{ background: "#fcfcfc", border: "1px solid #eee", borderRadius: 6, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 250 }}>
          <svg width="220" height="200">
            <line x1="40" y1="20" x2="40" y2="180" stroke="#777" strokeWidth="8" />
            <line x1="180" y1="20" x2="180" y2="180" stroke="#777" strokeWidth="8" />

            {(() => {
              if (isCross) {
                const isK = d.cross_bracing_type === "K-Bracing";
                return (
                  <>
                    {d.cross_top_chord_checkbox && <line x1="40" y1="35" x2="180" y2="35" stroke="#444" strokeWidth="2.5" />}
                    {d.cross_bottom_chord_checkbox && <line x1="40" y1="165" x2="180" y2="165" stroke="#444" strokeWidth="2.5" />}

                    {isK ? (
                      <>
                        <line x1="40" y1="35" x2="110" y2="165" stroke={GREEN} strokeWidth="3" />
                        <line x1="180" y1="35" x2="110" y2="165" stroke={GREEN} strokeWidth="3" />
                      </>
                    ) : (
                      <>
                        <line x1="40" y1="35" x2="180" y2="165" stroke={GREEN} strokeWidth="3" />
                        <line x1="180" y1="35" x2="40" y2="165" stroke={GREEN} strokeWidth="3" />
                      </>
                    )}
                    <text x="110" y="105" fontSize="10" textAnchor="middle" fill="#557a02" fontWeight="bold">Cross Diaphragm</text>
                  </>
                );
              }

              if (isRolled) {
                return (
                  <>
                    <line x1="40" y1="100" x2="180" y2="100" stroke="#444" strokeWidth="10" />
                    <line x1="40" y1="95" x2="180" y2="95" stroke="#222" strokeWidth="2.5" />
                    <line x1="40" y1="105" x2="180" y2="105" stroke="#222" strokeWidth="2.5" />
                    <text x="110" y="80" fontSize="10" textAnchor="middle" fill="#333" fontWeight="bold">Rolled Beam</text>
                    <text x="110" y="125" fontSize="9" textAnchor="middle" fill="#666">{d.rolled_is_section || "ISMB 500"}</text>
                  </>
                );
              }

              if (isWelded) {
                return (
                  <>
                    <rect x="40" y="40" width="140" height="120" fill="#e0e0e0" stroke="#555" strokeWidth="1" />
                    <line x1="40" y1="40" x2="180" y2="40" stroke="#222" strokeWidth="4" />
                    <line x1="40" y1="160" x2="180" y2="160" stroke="#222" strokeWidth="4" />
                    <text x="110" y="105" fontSize="10" textAnchor="middle" fill="#333" fontWeight="bold">Welded Diaphragm</text>
                  </>
                );
              }

              return null;
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}
