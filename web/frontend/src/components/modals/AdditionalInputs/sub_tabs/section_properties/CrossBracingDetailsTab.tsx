import React from "react";
import { Label, Input, Select } from "../../SharedComponents";
import { STANDARD_ANGLE_SECTIONS, STANDARD_CHANNEL_SECTIONS } from "../../../../constants/memberConstants";

interface CrossBracingDetailsTabProps {
  memberProps: any;
  selectedBracingPair: string;
  setSelectedBracingPair: (pair: string) => void;
  updateBracingField: (pairId: string, field: string, value: any) => void;
}

const GREEN = "#95b80f";

export default function CrossBracingDetailsTab({
  memberProps,
  selectedBracingPair,
  setSelectedBracingPair,
  updateBracingField,
}: CrossBracingDetailsTabProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {/* Left: Inputs */}
      <div style={{ background: "#ffffff", border: "1px solid #bbb", borderRadius: 8, padding: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 12 }}>Cross-Bracing Inputs</span>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.25fr", rowGap: 10, columnGap: 14, alignItems: "center" }}>
          <Label>Select Girders:</Label>
          <Select
            value={selectedBracingPair}
            onChange={e => setSelectedBracingPair(e.target.value)}
            options={Object.keys(memberProps?.cross_bracing || {})}
          />

          {(() => {
            const brace = memberProps.cross_bracing?.[selectedBracingPair] || {};
            const memberIdx = Number(selectedBracingPair.replace("G", "").split("-")[0]);
            const isCustom = brace.design === "Custom";
            const isKBrace = brace.bracing_type === "K-Bracing";

            return (
              <>
                <Label>Member ID:</Label>
                <Input value={`B${memberIdx}M1`} onChange={() => { }} disabled />

                <Label>Design:</Label>
                <Select
                  value={brace.design || "Optimized"}
                  onChange={e => updateBracingField(selectedBracingPair, "design", e.target.value)}
                  options={["Optimized", "Custom"]}
                />

                <Label>Type of Bracing:</Label>
                <Select
                  value={brace.bracing_type || "K-Bracing"}
                  onChange={e => updateBracingField(selectedBracingPair, "bracing_type", e.target.value)}
                  options={["K-Bracing", "X-Bracing"]}
                  disabled={!isCustom}
                />

                <Label>Bracing Section Type:</Label>
                <Select
                  value={brace.bracing_section_type || "Angle"}
                  onChange={e => updateBracingField(selectedBracingPair, "bracing_section_type", e.target.value)}
                  options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                  disabled={!isCustom}
                />

                <Label>Bracing Section Designation:</Label>
                <Select
                  value={brace.bracing_section || "ISA 5050x6"}
                  onChange={e => updateBracingField(selectedBracingPair, "bracing_section", e.target.value)}
                  options={brace.bracing_section_type?.includes("Channel") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                  disabled={!isCustom}
                />

                <div style={{ height: 1, background: "#ddd", gridColumn: "span 2", margin: "6px 0" }} />

                <Label>Top Chord:</Label>
                <input
                  type="checkbox"
                  checked={brace.top_chord_enabled || false}
                  onChange={e => updateBracingField(selectedBracingPair, "top_chord_enabled", e.target.checked)}
                  disabled={!isCustom}
                  style={{ width: 16, height: 16 }}
                />

                <Label>Top Chord Section Type:</Label>
                <Select
                  value={brace.top_chord_type || "Angle"}
                  onChange={e => updateBracingField(selectedBracingPair, "top_chord_type", e.target.value)}
                  options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                  disabled={!isCustom || !brace.top_chord_enabled}
                />

                <Label>Top Chord Section Designation:</Label>
                <Select
                  value={brace.top_chord_size || "ISA 5050x6"}
                  onChange={e => updateBracingField(selectedBracingPair, "top_chord_size", e.target.value)}
                  options={brace.top_chord_type?.includes("Channel") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                  disabled={!isCustom || !brace.top_chord_enabled}
                />

                <div style={{ height: 1, background: "#ddd", gridColumn: "span 2", margin: "6px 0" }} />

                <Label>Bottom Chord:</Label>
                <input
                  type="checkbox"
                  checked={isKBrace ? true : (brace.bottom_chord_enabled ?? true)}
                  onChange={e => updateBracingField(selectedBracingPair, "bottom_chord_enabled", e.target.checked)}
                  disabled={!isCustom || isKBrace}
                  style={{ width: 16, height: 16 }}
                />

                <Label>Bottom Chord Section Type:</Label>
                <Select
                  value={brace.bottom_chord_type || "Angle"}
                  onChange={e => updateBracingField(selectedBracingPair, "bottom_chord_type", e.target.value)}
                  options={["Angle", "Double Angle (Long Leg)", "Double Angle (Short Leg)", "Channel", "Double Channel"]}
                  disabled={!isCustom || !(isKBrace ? true : brace.bottom_chord_enabled)}
                />

                <Label>Bottom Chord Section Designation:</Label>
                <Select
                  value={brace.bottom_chord_size || "ISA 5050x6"}
                  onChange={e => updateBracingField(selectedBracingPair, "bottom_chord_size", e.target.value)}
                  options={brace.bottom_chord_type?.includes("Channel") ? STANDARD_CHANNEL_SECTIONS : STANDARD_ANGLE_SECTIONS}
                  disabled={!isCustom || !(isKBrace ? true : brace.bottom_chord_enabled)}
                />

                <Label>Spacing (m):</Label>
                <Input
                  value={brace.spacing || "3.0"}
                  onChange={e => updateBracingField(selectedBracingPair, "spacing", e.target.value)}
                />
              </>
            );
          })()}
        </div>
      </div>

      {/* Right: Dynamic Visualizer */}
      <div style={{ background: "#ffffff", border: "1px solid #bbb", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 12 }}>Bracing Layout Diagram</span>
        <div style={{ background: "#fcfcfc", border: "1px solid #eee", borderRadius: 6, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 250 }}>
          <svg width="220" height="200">
            {/* Outer profiles */}
            <line x1="40" y1="20" x2="40" y2="180" stroke="#777" strokeWidth="8" />
            <line x1="180" y1="20" x2="180" y2="180" stroke="#777" strokeWidth="8" />

            {(() => {
              const brace = memberProps.cross_bracing?.[selectedBracingPair] || {};
              const hasTop = brace.top_chord_enabled;
              const hasBot = brace.bracing_type === "K-Bracing" || brace.bottom_chord_enabled;
              const isK = brace.bracing_type === "K-Bracing";

              return (
                <>
                  {/* Top Chord */}
                  {hasTop && (
                    <line x1="40" y1="30" x2="180" y2="30" stroke="#444" strokeWidth="3" />
                  )}
                  {/* Bottom Chord */}
                  {hasBot && (
                    <line x1="40" y1="170" x2="180" y2="170" stroke="#444" strokeWidth="3" />
                  )}

                  {/* Bracing Lines */}
                  {isK ? (
                    <>
                      <line x1="40" y1="30" x2="110" y2="170" stroke={GREEN} strokeWidth="3" />
                      <line x1="180" y1="30" x2="110" y2="170" stroke={GREEN} strokeWidth="3" />
                    </>
                  ) : (
                    <>
                      <line x1="40" y1="30" x2="180" y2="170" stroke={GREEN} strokeWidth="3" />
                      <line x1="180" y1="30" x2="40" y2="170" stroke={GREEN} strokeWidth="3" />
                    </>
                  )}

                  <text x="110" y="105" fontSize="10" textAnchor="middle" fill="#557a02" fontWeight="bold">
                    {isK ? "K-Bracing" : "X-Bracing"}
                  </text>
                </>
              );
            })()}
            <text x="110" y="195" fontSize="10" textAnchor="middle" fill="#666">Spacing = {memberProps.cross_bracing?.[selectedBracingPair]?.spacing || "3.0"} m</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
