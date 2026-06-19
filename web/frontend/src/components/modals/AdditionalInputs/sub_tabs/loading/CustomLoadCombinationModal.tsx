import React, { useState } from "react";
import { Label, Input, Select } from "../../SharedComponents";

interface CustomCombinationEntry {
  loadCase: string;
  safetyFactor: string;
}

export interface CustomLoadCombination {
  name: string;
  entries: CustomCombinationEntry[];
}

interface ModalProps {
  onSave: (combination: CustomLoadCombination) => void;
  onCancel: () => void;
  initialData?: CustomLoadCombination;
}

const LOAD_CASES = ["DL", "SIDL", "FP", "LL", "EQ", "WL", "TEMP"];

export default function CustomLoadCombinationModal({ onSave, onCancel, initialData }: ModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [loadCaseInput, setLoadCaseInput] = useState(LOAD_CASES[0]);
  const [safetyFactorInput, setSafetyFactorInput] = useState("1.0");

  const [entries, setEntries] = useState<CustomCombinationEntry[]>(initialData?.entries || []);
  const [selectedEntryIdx, setSelectedEntryIdx] = useState<number | null>(null);

  const handleAddEntry = () => {
    if (!loadCaseInput || !safetyFactorInput) return;
    setEntries([...entries, { loadCase: loadCaseInput, safetyFactor: safetyFactorInput }]);
    // setSafetyFactorInput("1.0");
  };

  const handleModifyEntry = () => {
    if (selectedEntryIdx === null || !loadCaseInput || !safetyFactorInput) return;
    const newEntries = [...entries];
    newEntries[selectedEntryIdx] = { loadCase: loadCaseInput, safetyFactor: safetyFactorInput };
    setEntries(newEntries);
    setSelectedEntryIdx(null);
  };

  const handleDeleteEntry = () => {
    if (selectedEntryIdx === null) return;
    const newEntries = entries.filter((_, i) => i !== selectedEntryIdx);
    setEntries(newEntries);
    setSelectedEntryIdx(null);
  };

  const selectEntry = (idx: number) => {
    setSelectedEntryIdx(idx);
    setLoadCaseInput(entries[idx].loadCase);
    setSafetyFactorInput(entries[idx].safetyFactor);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a Combination Name.");
      return;
    }
    if (entries.length === 0) {
      alert("Please add at least one load case entry.");
      return;
    }
    onSave({ name, entries });
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", width: 650, borderRadius: 6,
        display: "flex", flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #ccc", padding: "8px 16px",
          fontWeight: 600, fontSize: 13, display: "flex", justifyContent: "space-between",
          alignItems: "center", color: "#333"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/Osdag_logo.svg" alt="Osdag Logo" style={{ width: 16, height: 16 }} />
            Add Load Combination
          </div>
          <div style={{ cursor: "pointer", fontWeight: "bold", color: "#666" }} onClick={onCancel}>×</div>
        </div>

        {/* Content */}
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Label>Combination Name:</Label>
            <div style={{ flex: 1, maxWidth: 300 }}>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Label>Load Case:</Label>
              <div style={{ width: 120 }}>
                <Select value={loadCaseInput} onChange={e => setLoadCaseInput(e.target.value)} options={LOAD_CASES} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Label>Partial Safety Factor:</Label>
              <div style={{ width: 100 }}>
                <Input value={safetyFactorInput} onChange={e => setSafetyFactorInput(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            {/* Table */}
            <div style={{ flex: 1, border: "1px solid #ccc", height: 200, overflowY: "auto", borderRadius: 4 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "center" }}>
                <thead style={{ background: "#f1f1f1" }}>
                  <tr>
                    <th style={{ padding: "6px", borderBottom: "1px solid #ccc", borderRight: "1px solid #ccc", width: 60 }}>S.No</th>
                    <th style={{ padding: "6px", borderBottom: "1px solid #ccc", borderRight: "1px solid #ccc" }}>Load Case</th>
                    <th style={{ padding: "6px", borderBottom: "1px solid #ccc" }}>Partial Safety Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => selectEntry(idx)}
                      style={{ 
                        cursor: "pointer", 
                        background: selectedEntryIdx === idx ? "#e3f2fd" : "transparent"
                      }}
                    >
                      <td style={{ padding: "6px", borderBottom: "1px solid #eee", borderRight: "1px solid #eee" }}>{idx + 1}</td>
                      <td style={{ padding: "6px", borderBottom: "1px solid #eee", borderRight: "1px solid #eee" }}>{entry.loadCase}</td>
                      <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{entry.safetyFactor}</td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: 16, color: "#999", fontStyle: "italic" }}>No entries added</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Side Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 80 }}>
              <button onClick={handleAddEntry} style={btnStyle}>Add</button>
              <button onClick={handleModifyEntry} style={btnStyle}>Modify</button>
              <button onClick={handleDeleteEntry} style={btnStyle}>Delete</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
            <button onClick={onCancel} style={bottomBtnStyle}>Cancel</button>
            <button onClick={handleSave} style={bottomBtnStyle}>Save</button>
          </div>

        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "6px",
  border: "1px solid #ccc",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  color: "#333",
  width: "100%",
};

const bottomBtnStyle = {
  padding: "6px 24px",
  border: "1px solid #ccc",
  borderRadius: 4,
  background: "#e0e0e0",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  color: "#333",
  minWidth: 90,
};
