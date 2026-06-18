import React from "react";
import { Label, Input, Select } from "../../SharedComponents";

const SOIL_TYPES = [
  "Type I – Rocky or Hard",
  "Type II – Medium Soil",
  "Type III – Soft Soil",
];

const RESPONSE_FACTORS = ["1", "2", "3", "4", "5"];

interface SeismicLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

function ModeLineField({
  label, modeKey, valueKey, form, updateField, modeOptions,
}: {
  label: string;
  modeKey: string;
  valueKey: string;
  form: any;
  updateField: (field: string, value: any) => void;
  modeOptions: string[];
}) {
  const mode = form[modeKey] ?? modeOptions[0];
  const isCustom = mode === "Custom";
  return (
    <>
      <Label>{label}:</Label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={mode}
          onChange={e => updateField(modeKey, e.target.value)}
          style={{
            height: 28, borderRadius: 5, border: "1px solid #000",
            padding: "0 4px", fontSize: 12, minWidth: 110, background: "#fff",
          }}
        >
          {modeOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <input
          type="text"
          value={form[valueKey] ?? ""}
          onChange={e => updateField(valueKey, e.target.value)}
          disabled={!isCustom}
          placeholder="Custom Value"
          style={{
            height: 28, borderRadius: 5, border: "1px solid #000",
            padding: "0 6px", fontSize: 12, width: 100,
            background: !isCustom ? "#f1f1f1" : "#fff",
            color: !isCustom ? "#888" : "#000",
          }}
        />
      </div>
    </>
  );
}

export default function SeismicLoadTab({ form, updateField }: SeismicLoadTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Seismic / Earthquake Load (EL):</div>

      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Seismic / Earthquake Load (EL) Inputs:</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 600,
        }}>
          <Label>Seismic Zone:</Label>
          <Input value={form.seismicZone ?? ""} onChange={e => updateField("seismicZone", e.target.value)} placeholder="e.g. III" />

          <Label>Importance Factor, I:</Label>
          <Input value={form.importanceFactor ?? "1.0"} onChange={e => updateField("importanceFactor", e.target.value)} />

          <Label>Type of Soil:</Label>
          <Select value={form.soilType ?? SOIL_TYPES[0]} onChange={e => updateField("soilType", e.target.value)} options={SOIL_TYPES} />

          <Label>Fundamental Time Period, T (sec):</Label>
          <Input value={form.timePeriod ?? ""} onChange={e => updateField("timePeriod", e.target.value)} />

          <Label>Damping Percentage:</Label>
          <Input value={form.damping ?? "2"} onChange={e => updateField("damping", e.target.value)} />

          <Label>Response Reduction Factor, R:</Label>
          <Select value={form.responseFactor ?? "1"} onChange={e => updateField("responseFactor", e.target.value)} options={RESPONSE_FACTORS} />

          <ModeLineField label="Dead Load for Seismic Force (kN)" modeKey="deadLoadSeismicMode" valueKey="deadLoadSeismicValue" form={form} updateField={updateField} modeOptions={["Automatic", "Custom"]} />
          <ModeLineField label="Live Load for Seismic Force (kN)" modeKey="liveLoadSeismicMode" valueKey="liveLoadSeismicValue" form={form} updateField={updateField} modeOptions={["Automatic", "Custom"]} />
        </div>
      </div>

      <div style={{ fontSize: 12, fontStyle: "italic", color: "#666" }}>
        Seismic Zone is auto-filled from software output (project location).
        The spectral acceleration coefficient depends on soil type and fundamental time period, T.
      </div>
    </>
  );
}
