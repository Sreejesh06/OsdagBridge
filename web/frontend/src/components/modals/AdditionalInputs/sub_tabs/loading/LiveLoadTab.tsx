import React from "react";
import { Label, Select } from "../../SharedComponents";

const IRC_VEHICLES = [
  "Class A",
  "Class 70R Wheeled",
  "Class 70R Tracked",
  "Class AA Wheeled",
  "Class AA Tracked",
  "Class SV",
  "Class 70R Bogie",
];

interface LiveLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function LiveLoadTab({ form, updateField }: LiveLoadTabProps) {
  const selectedVehicles: Record<string, boolean> = form.liveLoadVehicles ?? {};
  const footpathMode = form.footpathMode ?? "Automatic";

  const toggleVehicle = (name: string, checked: boolean) => {
    updateField("liveLoadVehicles", { ...selectedVehicles, [name]: checked });
  };

  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Live Load:</div>

      {/* IRC Vehicles */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Vehicles from IRC 6:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 8, maxWidth: 380 }}>
          {IRC_VEHICLES.map(v => (
            <React.Fragment key={v}>
              <div style={{ fontSize: 12, color: "#333", alignSelf: "center" }}>{v}</div>
              <input
                type="checkbox"
                checked={selectedVehicles[v] ?? true}
                onChange={e => toggleVehicle(v, e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Footpath Pressure */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 140px 100px",
          rowGap: 10, columnGap: 16, alignItems: "center",
        }}>
          <Label>Footpath Pressure (kN/m²):</Label>
          <Select
            value={footpathMode}
            onChange={e => updateField("footpathMode", e.target.value)}
            options={["Automatic", "User-defined"]}
          />
          <input
            type="text"
            value={form.footpathPressure ?? "5.00"}
            onChange={e => updateField("footpathPressure", e.target.value)}
            disabled={footpathMode !== "User-defined"}
            style={{
              height: 28, borderRadius: 5, border: "1px solid #000",
              padding: "0 6px", fontSize: 12,
              background: footpathMode !== "User-defined" ? "#f1f1f1" : "#fff",
              color: footpathMode !== "User-defined" ? "#888" : "#000",
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: 12, fontStyle: "italic", color: "#666", marginTop: 6 }}>
        IRC:6 braking and footpath loads are applied automatically per selected vehicles.
      </div>
    </>
  );
}
