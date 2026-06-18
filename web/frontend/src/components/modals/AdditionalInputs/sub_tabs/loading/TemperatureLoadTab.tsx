import React from "react";
import { Label, Input } from "../../SharedComponents";

interface TemperatureLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

function ReadOnlyInput({ value, placeholder }: { value: string; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      readOnly
      placeholder={placeholder}
      style={{
        width: "100%", height: 28, borderRadius: 5, border: "1px solid #000",
        padding: "0 8px", fontSize: 12,
        background: "#f6f6f6", color: "#555",
        outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

export default function TemperatureLoadTab({ form, updateField }: TemperatureLoadTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Temperature Load (TL):</div>

      {/* Inputs Section */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>
          Temperature Load (TL) Inputs for Evaluation per IRC6:
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 600,
        }}>
          <Label>Highest Maximum Air Temperature (°C):</Label>
          <ReadOnlyInput value={form.highestMaxTemp ?? ""} placeholder="From Project Location" />

          <Label>Lowest Minimum Air Temperature (°C):</Label>
          <ReadOnlyInput value={form.lowestMinTemp ?? ""} placeholder="From Project Location" />

          <Label>Coefficient of Thermal Expansion for Steel (1/°C):</Label>
          <Input value={form.thermalCoeffSteel ?? "12.0e-6"} onChange={e => updateField("thermalCoeffSteel", e.target.value)} />

          <Label>Coefficient of Thermal Expansion for RCC (1/°C):</Label>
          <Input value={form.thermalCoeffRCC ?? "12.0e-6"} onChange={e => updateField("thermalCoeffRCC", e.target.value)} />
        </div>
      </div>

      {/* Range of Effective Bridge Temperature */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>
          Range of Effective Bridge Temperature:
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 600,
        }}>
          <Label>Minimum (°C):</Label>
          <ReadOnlyInput value={form.bridgeTempMin ?? ""} />

          <Label>Maximum (°C):</Label>
          <ReadOnlyInput value={form.bridgeTempMax ?? ""} />
        </div>
      </div>

      {/* Temperature for Design */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>
          Temperature for Design:
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 600,
        }}>
          <Label>Rise (°C):</Label>
          <ReadOnlyInput value={form.tempRise ?? ""} />

          <Label>Fall (°C):</Label>
          <ReadOnlyInput value={form.tempFall ?? ""} />
        </div>
      </div>
    </>
  );
}
