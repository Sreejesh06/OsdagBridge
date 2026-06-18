import React from "react";
import { Label, Input, Select } from "../../SharedComponents";

const TERRAIN_TYPES = ["Plain Terrain", "Terrain with Obstructions"];
const SITE_TOPOGRAPHIES = ["Flat", "Hill, ridge, escarpment or cliff"];

function ModeLineField({
  label, modeKey, valueKey, form, updateField,
  modeOptions, defaultValue, placeholder,
}: {
  label: string;
  modeKey: string;
  valueKey: string;
  form: any;
  updateField: (field: string, value: any) => void;
  modeOptions: string[];
  defaultValue?: string;
  placeholder?: string;
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
            padding: "0 4px", fontSize: 12, minWidth: 120, background: "#fff",
          }}
        >
          {modeOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <input
          type="text"
          value={form[valueKey] ?? (isCustom ? "" : (defaultValue ?? ""))}
          onChange={e => updateField(valueKey, e.target.value)}
          disabled={!isCustom}
          placeholder={placeholder ?? "Custom Value"}
          style={{
            height: 28, borderRadius: 5, border: "1px solid #000",
            padding: "0 6px", fontSize: 12, width: 90,
            background: !isCustom ? "#f1f1f1" : "#fff",
            color: !isCustom ? "#888" : "#000",
          }}
        />
      </div>
    </>
  );
}

interface WindLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function WindLoadTab({ form, updateField }: WindLoadTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Wind Load (WL):</div>

      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Wind Load (WL) Inputs:</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 260px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 680,
        }}>
          <Label>Basic Wind Speed, Vb (m/s):</Label>
          <Input value={form.basicWindSpeed ?? ""} readOnly placeholder="From Project Location" />

          <Label>Average Exposed Height, H (m):</Label>
          <Input value={form.avgExposedHeight ?? "10"} onChange={e => updateField("avgExposedHeight", e.target.value)} />

          <Label>Type of Terrain:</Label>
          <Select value={form.terrainType ?? TERRAIN_TYPES[0]} onChange={e => updateField("terrainType", e.target.value)} options={TERRAIN_TYPES} />

          <Label>Site Topography:</Label>
          <Select value={form.siteTopography ?? SITE_TOPOGRAPHIES[0]} onChange={e => updateField("siteTopography", e.target.value)} options={SITE_TOPOGRAPHIES} />

          <ModeLineField label="Gust Factor, G" modeKey="gustFactorMode" valueKey="gustFactorValue" form={form} updateField={updateField} modeOptions={["As per Code", "Custom"]} defaultValue="2" placeholder="2" />
          <ModeLineField label="Drag Coefficient, CD" modeKey="dragCoeffMode" valueKey="dragCoeffValue" form={form} updateField={updateField} modeOptions={["As per Code", "Custom"]} />
          <ModeLineField label="Drag Coefficient against Live Load, CDLL" modeKey="dragCoeffLLMode" valueKey="dragCoeffLLValue" form={form} updateField={updateField} modeOptions={["As per Code", "Custom"]} defaultValue="1.2" placeholder="1.2" />
          <ModeLineField label="Lift Coefficient, CL" modeKey="liftCoeffMode" valueKey="liftCoeffValue" form={form} updateField={updateField} modeOptions={["As per Code", "Custom"]} defaultValue="0.75" placeholder="0.75" />
          <ModeLineField label="Superstructure Area in Elevation, A1 (m²)" modeKey="superAreaElevMode" valueKey="superAreaElevValue" form={form} updateField={updateField} modeOptions={["Automatic", "Custom"]} />
          <ModeLineField label="Superstructure Area in Plain, A3 (m²)" modeKey="superAreaPlainMode" valueKey="superAreaPlainValue" form={form} updateField={updateField} modeOptions={["Automatic", "Custom"]} />
          <ModeLineField label="Exposed Frontal Area of Live Load, A1LL (m²)" modeKey="exposedFrontalAreaMode" valueKey="exposedFrontalAreaValue" form={form} updateField={updateField} modeOptions={["Automatic", "Custom"]} />
          <ModeLineField label="Wind Load Eccentricity from Top of Deck (m)" modeKey="windEccDeckMode" valueKey="windEccDeckValue" form={form} updateField={updateField} modeOptions={["As per Code", "Custom"]} />
          <ModeLineField label="Wind on Live Load Eccentricity from Top of Deck (m)" modeKey="windLLEccMode" valueKey="windLLEccValue" form={form} updateField={updateField} modeOptions={["As per Code", "Custom"]} />
        </div>
      </div>

      <div style={{ fontSize: 12, fontStyle: "italic", color: "#666" }}>
        Basic Wind Speed is auto-filled from software output (project location).
      </div>
    </>
  );
}
