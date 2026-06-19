import React, { useState } from "react";
import { Label, Input, Select, TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";

const LOAD_CASES = ["DL", "DW", "SIDL", "LL", "EL", "WL", "TL", "Custom"];
const LOAD_TYPES = ["Point", "Line"];

interface CustomLoadItem {
  id: number;
  loadCase: string;
  customLoadCaseName: string;
  loadType: string;
  pointLeft: string;
  pointBearing: string;
  lineLeftStart: string;
  lineLeftEnd: string;
  lineBearingStart: string;
  lineBearingEnd: string;
}

interface CustomLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function CustomLoadTab({ form, updateField }: CustomLoadTabProps) {
  const items: CustomLoadItem[] = form.customLoads ?? [];
  
  const [loadCase, setLoadCase] = useState("DL");
  const [customCaseName, setCustomCaseName] = useState("");
  const [loadType, setLoadType] = useState("Point");
  
  const [pointLeft, setPointLeft] = useState("");
  const [pointBearing, setPointBearing] = useState("");
  
  const [lineLeftStart, setLineLeftStart] = useState("");
  const [lineLeftEnd, setLineLeftEnd] = useState("");
  const [lineBearingStart, setLineBearingStart] = useState("");
  const [lineBearingEnd, setLineBearingEnd] = useState("");
  
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const clearInputs = () => {
    setLoadCase("DL");
    setCustomCaseName("");
    setLoadType("Point");
    setPointLeft("");
    setPointBearing("");
    setLineLeftStart("");
    setLineLeftEnd("");
    setLineBearingStart("");
    setLineBearingEnd("");
    setEditingId(null);
  };

  const handleSave = () => {
    if (loadCase === "Custom" && !customCaseName.trim()) {
      alert("Please provide a name for the Custom load case.");
      return;
    }

    if (loadType === "Point") {
      if (!pointLeft.trim() || !pointBearing.trim()) {
        alert("Please fill in all distance fields for the Point load.");
        return;
      }
    } else {
      if (!lineLeftStart.trim() || !lineLeftEnd.trim() || !lineBearingStart.trim() || !lineBearingEnd.trim()) {
        alert("Please fill in all distance fields for the Line/Area load.");
        return;
      }
      if (parseFloat(lineLeftStart) > parseFloat(lineLeftEnd)) {
        alert("Distance from Left Edge Start cannot be greater than End.");
        return;
      }
      if (parseFloat(lineBearingStart) > parseFloat(lineBearingEnd)) {
        alert("Distance from Bearing Start cannot be greater than End.");
        return;
      }
    }

    const newItem: CustomLoadItem = {
      id: editingId !== null ? editingId : Date.now(),
      loadCase,
      customLoadCaseName: customCaseName,
      loadType,
      pointLeft,
      pointBearing,
      lineLeftStart,
      lineLeftEnd,
      lineBearingStart,
      lineBearingEnd,
    };

    if (editingId !== null) {
      updateField("customLoads", items.map(item => item.id === editingId ? newItem : item));
    } else {
      updateField("customLoads", [...items, newItem]);
    }
    
    clearInputs();
  };

  const handleEdit = () => {
    if (selectedId === null) {
      alert("Please select one custom load to edit.");
      return;
    }
    const itemToEdit = items.find(item => item.id === selectedId);
    if (!itemToEdit) return;

    setLoadCase(itemToEdit.loadCase);
    setCustomCaseName(itemToEdit.customLoadCaseName);
    setLoadType(itemToEdit.loadType);
    setPointLeft(itemToEdit.pointLeft);
    setPointBearing(itemToEdit.pointBearing);
    setLineLeftStart(itemToEdit.lineLeftStart);
    setLineLeftEnd(itemToEdit.lineLeftEnd);
    setLineBearingStart(itemToEdit.lineBearingStart);
    setLineBearingEnd(itemToEdit.lineBearingEnd);
    
    setEditingId(selectedId);
  };

  const handleDelete = () => {
    if (selectedId === null) {
      alert("Please select at least one custom load to delete.");
      return;
    }
    updateField("customLoads", items.filter(item => item.id !== selectedId));
    if (selectedId === editingId) {
      clearInputs();
    }
    setSelectedId(null);
  };

  return (
    <TwoColumnLayout>
      <LeftColumn>
        {/* Bridge Geometry Diagram Placeholder */}
        <div style={{
          minHeight: 130,
          backgroundColor: "#e2e8f0",
          border: "1px solid #cbd5e1",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", textAlign: "center" }}>
            Bridge Geometry<br/>Diagram
          </span>
        </div>

        {/* Input Form */}
        <SectionBox title="Custom Load Input Add/Edit:">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center" }}>
              <Label>Load Case</Label>
              <div style={{ display: "flex", gap: 8 }}>
                <Select 
                  value={loadCase} 
                  onChange={e => {
                    setLoadCase(e.target.value);
                    if (e.target.value !== "Custom") setCustomCaseName("");
                  }} 
                  options={LOAD_CASES} 
                />
                <input
                  type="text"
                  value={customCaseName}
                  onChange={e => setCustomCaseName(e.target.value)}
                  placeholder="Custom"
                  disabled={loadCase !== "Custom"}
                  style={{
                    flex: 1,
                    height: 28, borderRadius: 5, border: "1px solid #cbd5e1",
                    padding: "0 8px", fontSize: 12, background: loadCase === "Custom" ? "#fff" : "#f1f5f9",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center" }}>
              <Label>Load Type</Label>
              <Select value={loadType} onChange={e => setLoadType(e.target.value)} options={LOAD_TYPES} />
            </div>

            {loadType === "Point" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center" }}>
                  <Label>Distance from Left Edge of Bridge (m)</Label>
                  <Input value={pointLeft} onChange={e => setPointLeft(e.target.value)} placeholder="0.000" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center" }}>
                  <Label>Distance from Center Line of Bearing (m)</Label>
                  <Input value={pointBearing} onChange={e => setPointBearing(e.target.value)} placeholder="0.000" />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center" }}>
                  <Label>Distance from Left Edge of Bridge (m)</Label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, color: "#64748b" }}>Start (m)</span>
                      <Input value={lineLeftStart} onChange={e => setLineLeftStart(e.target.value)} placeholder="0.000" />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, color: "#64748b" }}>End (m)</span>
                      <Input value={lineLeftEnd} onChange={e => setLineLeftEnd(e.target.value)} placeholder="0.000" />
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center" }}>
                  <Label>Distance from Center Line of Bearing (m)</Label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, color: "#64748b" }}>Start (m)</span>
                      <Input value={lineBearingStart} onChange={e => setLineBearingStart(e.target.value)} placeholder="0.000" />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, color: "#64748b" }}>End (m)</span>
                      <Input value={lineBearingEnd} onChange={e => setLineBearingEnd(e.target.value)} placeholder="0.000" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
              <button
                onClick={handleSave}
                style={{
                  padding: "4px 32px", fontSize: 12,
                  background: "#fff", border: "1px solid #cbd5e1", borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Save
              </button>
            </div>
          </div>
        </SectionBox>

        {/* Load List Table */}
        <SectionBox title="Custom Load Name">
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={handleEdit}
              style={{
                padding: "4px 16px", fontSize: 11,
                background: "#fff", border: "1px solid #cbd5e1", borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: "4px 16px", fontSize: 11,
                background: "#fff", border: "1px solid #cbd5e1", borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>
          
          <div style={{ border: "1px solid #cbd5e1", borderRadius: 4, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead style={{ background: "#f8fafc", color: "#334155" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1", fontWeight: 600 }}>Load Case</th>
                  <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1", fontWeight: 600 }}>Load Type</th>
                  <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1", fontWeight: 600 }}>Distance from Left (m)</th>
                  <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #cbd5e1", fontWeight: 600 }}>Distance from Bearing (m)</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "16px", color: "#64748b" }}>No custom loads added.</td>
                  </tr>
                ) : (
                  items.map(item => {
                    const distLeft = item.loadType === "Point" ? item.pointLeft : `${item.lineLeftStart} - ${item.lineLeftEnd}`;
                    const distBearing = item.loadType === "Point" ? item.pointBearing : `${item.lineBearingStart} - ${item.lineBearingEnd}`;
                    const loadCaseDisplay = item.loadCase === "Custom" ? (item.customLoadCaseName || "custom") : item.loadCase;
                    
                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedId(item.id)}
                        style={{ 
                          background: selectedId === item.id ? "#dbeafe" : "#fff",
                          cursor: "pointer" 
                        }}
                      >
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>{loadCaseDisplay}</td>
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>{item.loadType}</td>
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>{distLeft}</td>
                        <td style={{ padding: "6px 8px", borderBottom: "1px solid #e2e8f0" }}>{distBearing}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SectionBox>

      </LeftColumn>

      <DescriptionBox>
        {"\n"}
      </DescriptionBox>
    </TwoColumnLayout>
  );
}
