import React, { useState } from "react";
import { Label, Input, Select } from "../../SharedComponents";

interface CustomVehicle {
  name: string;
  type: string;
  axles: Array<{ load: string; spacing: string }>;
  noseToTail: string;
  wheelWidth: string;
  clearanceEdge: string;
  clearanceCrossing: string;
  transverseSpacing: string;
  impactFactor: string;
}

interface ModalProps {
  onSave: (vehicle: CustomVehicle) => void;
  onCancel: () => void;
  initialData?: CustomVehicle;
}

export default function LiveLoadCustomVehicleModal({ onSave, onCancel, initialData }: ModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "Wheeled");
  
  const [loadInput, setLoadInput] = useState("");
  const [spacingInput, setSpacingInput] = useState("");
  
  const [axles, setAxles] = useState<Array<{ load: string; spacing: string }>>(initialData?.axles || []);
  const [selectedAxleIdx, setSelectedAxleIdx] = useState<number | null>(null);

  const [noseToTail, setNoseToTail] = useState(initialData?.noseToTail || "");
  const [wheelWidth, setWheelWidth] = useState(initialData?.wheelWidth || "");
  const [clearanceEdge, setClearanceEdge] = useState(initialData?.clearanceEdge || "");
  const [clearanceCrossing, setClearanceCrossing] = useState(initialData?.clearanceCrossing || "");
  const [transverseSpacing, setTransverseSpacing] = useState(initialData?.transverseSpacing || "");

  const handleAddAxle = () => {
    if (!loadInput) return;
    setAxles([...axles, { load: loadInput, spacing: spacingInput || "0" }]);
    setLoadInput("");
    setSpacingInput("");
  };

  const handleModifyAxle = () => {
    if (selectedAxleIdx === null || !loadInput) return;
    const newAxles = [...axles];
    newAxles[selectedAxleIdx] = { load: loadInput, spacing: spacingInput || "0" };
    setAxles(newAxles);
    setSelectedAxleIdx(null);
    setLoadInput("");
    setSpacingInput("");
  };

  const handleDeleteAxle = () => {
    if (selectedAxleIdx === null) return;
    const newAxles = axles.filter((_, i) => i !== selectedAxleIdx);
    setAxles(newAxles);
    setSelectedAxleIdx(null);
    setLoadInput("");
    setSpacingInput("");
  };

  const selectAxle = (idx: number) => {
    setSelectedAxleIdx(idx);
    setLoadInput(axles[idx].load);
    setSpacingInput(axles[idx].spacing);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a vehicle name.");
      return;
    }
    
    let finalAxles = axles;
    if (type === "Tracked" || type === "Bogie") {
      if (!loadInput || !spacingInput) {
        alert("Please enter Load and Spacing.");
        return;
      }
      finalAxles = [{ load: loadInput, spacing: spacingInput }];
    } else {
      if (finalAxles.length === 0) {
        alert("Please add at least one axle.");
        return;
      }
    }

    onSave({
      name,
      type,
      axles: finalAxles,
      noseToTail,
      wheelWidth,
      clearanceEdge,
      clearanceCrossing,
      transverseSpacing,
      impactFactor: "0.25",
    });
  };

  const isBogie = type === "Bogie";

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", width: 600, borderRadius: 6,
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
            Live Load Custom Vehicle Add/Edit
          </div>
          <div style={{ cursor: "pointer", fontWeight: "bold", color: "#666" }} onClick={onCancel}>×</div>
        </div>

        {/* Content */}
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto 120px", gap: 12, alignItems: "center" }}>
            <Label>Vehicle Name:</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
            <Label>Vehicle Type:</Label>
            <Select value={type} onChange={e => {
                setType(e.target.value);
                // Pre-fill if switching to Tracked/Bogie and axles exist
                if (e.target.value !== "Wheeled" && axles.length > 0 && !loadInput) {
                  setLoadInput(axles[0].load);
                  setSpacingInput(axles[0].spacing);
                }
            }} options={["Wheeled", "Tracked", "Bogie"]} />
          </div>

          {type === "Wheeled" ? (
            <>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Label>Load, P<sub>#</sub> (kN)</Label>
                <div style={{ width: 80 }}><Input value={loadInput} onChange={e => setLoadInput(e.target.value)} /></div>
                <Label>Spacing, D<sub>#</sub> (m)</Label>
                <div style={{ width: 80 }}><Input value={spacingInput} onChange={e => setSpacingInput(e.target.value)} /></div>
                
                <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                  <button onClick={handleAddAxle} style={btnStyle}>Add</button>
                  <button onClick={handleModifyAxle} style={btnStyle}>Modify</button>
                  <button onClick={handleDeleteAxle} style={btnStyle}>Delete</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: 120 }}>
                {/* Table */}
                <div style={{ border: "1px solid #ccc", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "center" }}>
                    <thead style={{ background: "#f1f1f1" }}>
                      <tr>
                        <th style={{ padding: "4px", borderBottom: "1px solid #ccc", borderRight: "1px solid #ccc" }}>S.No.</th>
                        <th style={{ padding: "4px", borderBottom: "1px solid #ccc", borderRight: "1px solid #ccc" }}>Load (kN)</th>
                        <th style={{ padding: "4px", borderBottom: "1px solid #ccc" }}>Spacing (m)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {axles.map((axle, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => selectAxle(idx)}
                          style={{ 
                            cursor: "pointer", 
                            background: selectedAxleIdx === idx ? "#e3f2fd" : "transparent"
                          }}
                        >
                          <td style={{ padding: "4px", borderBottom: "1px solid #eee", borderRight: "1px solid #eee" }}>{idx + 1}</td>
                          <td style={{ padding: "4px", borderBottom: "1px solid #eee", borderRight: "1px solid #eee" }}>{axle.load}</td>
                          <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{axle.spacing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Diagram */}
                <div style={{ border: "1px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#999" }}>
                  Axle Layout Diagram
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: 160, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 60 }}><Label>{isBogie ? <>P<sub>b</sub> (kN)</> : <>P (kN)</>}</Label></div>
                  <div style={{ width: 80 }}><Input value={loadInput} onChange={e => setLoadInput(e.target.value)} /></div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 60 }}><Label>{isBogie ? <>D<sub>b</sub> (m)</> : <>D (m)</>}</Label></div>
                  <div style={{ width: 80 }}><Input value={spacingInput} onChange={e => setSpacingInput(e.target.value)} /></div>
                </div>
              </div>
              <div style={{ border: "1px solid #ccc", height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#999" }}>
                {isBogie ? "Bogie Layout Diagram" : "Tracked Layout Diagram"}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12, alignItems: "center" }}>
            <Label>Minimum nose to tail distance (m)</Label>
            <Input value={noseToTail} onChange={e => setNoseToTail(e.target.value)} />
            
            <Label>Width of Wheel, w (mm)</Label>
            <Input value={wheelWidth} onChange={e => setWheelWidth(e.target.value)} />
            
            <Label>Minimum Clearance from Carriageway Edge, f (mm)</Label>
            <Input value={clearanceEdge} onChange={e => setClearanceEdge(e.target.value)} />
            
            <Label>Minimum Clearance from Crossing Vehicles, g (mm)</Label>
            <Input value={clearanceCrossing} onChange={e => setClearanceCrossing(e.target.value)} />
            
            <Label>Wheel Spacing in Transverse Direction (m)</Label>
            <Input value={transverseSpacing} onChange={e => setTransverseSpacing(e.target.value)} />
            
            <Label>Impact Factor</Label>
            <Input value={"0.25"} readOnly />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button onClick={handleSave} style={{ ...btnStyle, width: 80 }}>Save</button>
            <button onClick={onCancel} style={{ ...btnStyle, width: 80 }}>Cancel</button>
          </div>

        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "4px 12px",
  border: "1px solid #ccc",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  color: "#333",
};
