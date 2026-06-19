import React from "react";
import { TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";

// IRC 6 standard load combinations
const IRC_COMBINATIONS = [
  "Basic Combination: 1.35DL + 1.75LL + 1.5EL",
  "Basic Combination: 1.35DL + 1.75LL + 0.9EL + 0.9WL",
  "Seismic Combination: 1.35DL + 0.2LL + 1.5EL",
  "Fatigue Combination: 1.0DL + 0.75LL",
  "Accidental: 1.0DL + 0.2LL + 1.0EL (Accidental)",
  "Service Combination I: 1.0DL + 1.0LL + 1.0EL",
  "Service Combination II: 1.0DL + 0.8LL + 0.5WL",
];

interface LoadCombinationTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function LoadCombinationTab({ form, updateField }: LoadCombinationTabProps) {
  const selectedCombos: Record<string, boolean> = form.loadCombinations ?? {};

  const toggle = (name: string, checked: boolean) => {
    updateField("loadCombinations", { ...selectedCombos, [name]: checked });
  };

  const toggleAll = (checked: boolean) => {
    const all: Record<string, boolean> = {};
    IRC_COMBINATIONS.forEach(c => { all[c] = checked; });
    updateField("loadCombinations", all);
  };

  return (
    <TwoColumnLayout>
      <LeftColumn>
        {/* IRC Load Combinations */}
        <SectionBox>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>Load Combinations from IRC 6</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => toggleAll(true)}
                style={{
                  padding: "3px 10px", fontSize: 11, cursor: "pointer",
                  background: "#efefef", border: "1px solid #888", borderRadius: 4,
                }}
              >Select All</button>
              <button
                onClick={() => toggleAll(false)}
                style={{
                  padding: "3px 10px", fontSize: 11, cursor: "pointer",
                  background: "#efefef", border: "1px solid #888", borderRadius: 4,
                }}
              >Clear All</button>
            </div>
          </div>

          <div style={{ display: "grid", rowGap: 8 }}>
            {IRC_COMBINATIONS.map(combo => (
              <label
                key={combo}
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={selectedCombos[combo] ?? false}
                  onChange={e => toggle(combo, e.target.checked)}
                  style={{ width: 15, height: 15 }}
                />
                <span style={{ fontSize: 12, color: "#333" }}>{combo}</span>
              </label>
            ))}
          </div>
        </SectionBox>

        {/* Custom Load Combinations */}
        <SectionBox title="Custom Load Combination">
          <div style={{
            padding: 10, background: "#f9f9f9",
            borderRadius: 6, fontSize: 12, color: "#666", fontStyle: "italic",
          }}>
            Custom load combinations can be defined after custom loads have been added in the Custom Load tab.
          </div>
        </SectionBox>
      </LeftColumn>

      <DescriptionBox>
        {"\n"}
      </DescriptionBox>
    </TwoColumnLayout>
  );
}
