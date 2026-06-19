import React, { useState } from "react";
import { TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";
import CustomLoadCombinationModal from "./CustomLoadCombinationModal";
import type { CustomLoadCombination } from "./CustomLoadCombinationModal";

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #d0d0d0",
  borderRight: "1px solid #d0d0d0",
  fontWeight: 600,
  fontSize: 11,
  background: "#f8f8f8",
  color: "#2a2a2a",
  textAlign: "center",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderBottom: "1px solid #e8e8e8",
  borderRight: "1px solid #e0e0e0",
  fontSize: 11,
  color: "#2a2a2a",
};

interface LoadCombinationTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function LoadCombinationTab({ form, updateField }: LoadCombinationTabProps) {
  const customCombos: CustomLoadCombination[] = Array.isArray(form?.customLoadCombinations)
    ? form.customLoadCombinations
    : [];

  const [showModal, setShowModal] = useState(false);

  const toggleCustomInclude = (idx: number, checked: boolean) => {
    const updated = customCombos.map((c, i) =>
      i === idx ? { ...c, included: checked } : c
    );
    updateField("customLoadCombinations", updated);
  };

  const handleAddCustomCombo = (combo: CustomLoadCombination) => {
    const newCombo = { ...combo, included: false };
    updateField("customLoadCombinations", [...customCombos, newCombo]);
    setShowModal(false);
  };

  return (
    <TwoColumnLayout>
      <LeftColumn>
        {/* IRC 6 Load Combinations — plain section, dynamically populated (empty by default, same as desktop) */}
        <SectionBox>
          <div style={{ fontWeight: 700, fontSize: 11, color: "#2b2b2b", marginBottom: 10 }}>
            Load Combinations from IRC 6
          </div>
          {/* Empty placeholder — matches desktop irc_placeholder widget */}
          <div style={{ minHeight: 100 }} />
        </SectionBox>

        {/* Custom Load Combination — table with Add button */}
        <SectionBox>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: customCombos.length > 0 ? 8 : 0 }}>
            {customCombos.length > 0 && (
              <div style={{ fontWeight: 700, fontSize: 11, color: "#2b2b2b" }}>
                Custom Load Combination
              </div>
            )}
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: "#ffffff", border: "1px solid #a0a0a0", borderRadius: 3,
                color: "#2a2a2a",
              }}
            >
              Add Custom Combination
            </button>
          </div>

          {customCombos.length > 0 && (
            <div style={{ border: "1px solid #a0a0a0", borderRadius: 4, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 60 }}>S.No.</th>
                    <th style={{ ...thStyle, textAlign: "left", borderRight: "none" }}>Combination Name</th>
                    <th style={{ ...thStyle, width: 80, borderRight: "none" }}>Include</th>
                  </tr>
                </thead>
                <tbody>
                  {customCombos.map((c, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ ...tdStyle, textAlign: "center" }}>{idx + 1}</td>
                      <td style={{ ...tdStyle, borderRight: "none" }}>{c.name}</td>
                      <td style={{ ...tdStyle, textAlign: "center", borderRight: "none" }}>
                        <input
                          type="checkbox"
                          checked={(c as any).included ?? false}
                          onChange={e => toggleCustomInclude(idx, e.target.checked)}
                          style={{ width: 14, height: 14, cursor: "pointer" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionBox>
      </LeftColumn>

      <DescriptionBox>
        {"\n"}
      </DescriptionBox>

      {showModal && (
        <CustomLoadCombinationModal
          onSave={handleAddCustomCombo}
          onCancel={() => setShowModal(false)}
        />
      )}
    </TwoColumnLayout>
  );
}
