import React, { useState } from "react";
import { Label, Input, Select, TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";

const LOAD_CASES = ["DL", "DW", "SIDL", "LL", "EL", "WL", "TL", "Custom"];
const LOAD_TYPES = ["Point", "Line"];

interface CustomLoadItem {
  id: number;
  loadCase: string;
  loadType: string;
  details: string;
}

interface CustomLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

let nextId = 1;

export default function CustomLoadTab({ form, updateField }: CustomLoadTabProps) {
  const items: CustomLoadItem[] = form.customLoads ?? [];
  const [loadCase, setLoadCase] = useState("DL");
  const [loadType, setLoadType] = useState("Point");
  const [customCaseName, setCustomCaseName] = useState("");
  const [distLeft, setDistLeft] = useState("");
  const [distBearing, setDistBearing] = useState("");

  const addLoad = () => {
    const caseLabel = loadCase === "Custom" ? (customCaseName || "Custom") : loadCase;
    const details = loadType === "Point"
      ? `Left: ${distLeft}m, Bearing CL: ${distBearing}m`
      : `Left: ${distLeft}m, Bearing CL: ${distBearing}m`;
    const newItem: CustomLoadItem = {
      id: nextId++,
      loadCase: caseLabel,
      loadType,
      details,
    };
    updateField("customLoads", [...items, newItem]);
    setDistLeft(""); setDistBearing(""); setCustomCaseName("");
  };

  const removeLoad = (id: number) => {
    updateField("customLoads", items.filter(i => i.id !== id));
  };

  return (
    <TwoColumnLayout>
      <LeftColumn>
        {/* Entry form */}
        <SectionBox>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px",
            rowGap: 12, columnGap: 30, alignItems: "center",
          }}>
            <Label>Load Case</Label>
            <Select value={loadCase} onChange={e => setLoadCase(e.target.value)} options={LOAD_CASES} />

            {loadCase === "Custom" && (
              <>
                <Label>Custom Name</Label>
                <input
                  type="text"
                  value={customCaseName}
                  onChange={e => setCustomCaseName(e.target.value)}
                  placeholder="Enter name"
                  style={{
                    height: 28, borderRadius: 5, border: "1px solid #000",
                    padding: "0 8px", fontSize: 12, background: "#fff",
                  }}
                />
              </>
            )}

            <Label>Load Type</Label>
            <Select value={loadType} onChange={e => setLoadType(e.target.value)} options={LOAD_TYPES} />

            <Label>Distance from Left Edge of Bridge (m)</Label>
            <Input value={distLeft} onChange={e => setDistLeft(e.target.value)} placeholder="0.000" />

            <Label>Distance from Center Line of Bearing (m)</Label>
            <Input value={distBearing} onChange={e => setDistBearing(e.target.value)} placeholder="0.000" />
          </div>

          <button
            onClick={addLoad}
            style={{
              marginTop: 16, padding: "6px 20px", fontSize: 12,
              background: "#efefef", border: "1px solid #444", borderRadius: 4,
              cursor: "pointer", alignSelf: "flex-start"
            }}
          >
            Add Load
          </button>
        </SectionBox>

        {/* Load list */}
        {items.length > 0 && (
          <SectionBox title="Custom Loads Added:">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ textAlign: "left", padding: "6px 10px", border: "1px solid #ddd" }}>#</th>
                  <th style={{ textAlign: "left", padding: "6px 10px", border: "1px solid #ddd" }}>Load Case</th>
                  <th style={{ textAlign: "left", padding: "6px 10px", border: "1px solid #ddd" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "6px 10px", border: "1px solid #ddd" }}>Details</th>
                  <th style={{ padding: "6px 10px", border: "1px solid #ddd" }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fafafa" : "#fff" }}>
                    <td style={{ padding: "5px 10px", border: "1px solid #eee" }}>{idx + 1}</td>
                    <td style={{ padding: "5px 10px", border: "1px solid #eee" }}>{item.loadCase}</td>
                    <td style={{ padding: "5px 10px", border: "1px solid #eee" }}>{item.loadType}</td>
                    <td style={{ padding: "5px 10px", border: "1px solid #eee" }}>{item.details}</td>
                    <td style={{ padding: "5px 10px", border: "1px solid #eee", textAlign: "center" }}>
                      <button
                        onClick={() => removeLoad(item.id)}
                        style={{
                          background: "none", border: "none",
                          color: "#c00", cursor: "pointer", fontWeight: 700, fontSize: 14,
                        }}
                      >×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionBox>
        )}
      </LeftColumn>

      <DescriptionBox>
        {"\n"}
      </DescriptionBox>
    </TwoColumnLayout>
  );
}
