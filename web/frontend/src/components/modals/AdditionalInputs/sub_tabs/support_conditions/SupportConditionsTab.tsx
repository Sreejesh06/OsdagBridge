import React from "react";
import { Label, Input, Select } from "../../SharedComponents";

const SUPPORT_TYPES = ["Fixed", "Pinned", "Roller"];

interface SupportConditionsTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function SupportConditionsTab({ form, updateField }: SupportConditionsTabProps) {
  const bearingLength = form.bearingLength ?? "400";

  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Support Conditions:</div>

      {/* Support Types */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Support Conditions:</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "160px 150px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 440,
        }}>
          <Label>Left Support:</Label>
          <Select
            value={form.leftSupport ?? "Pinned"}
            onChange={e => updateField("leftSupport", e.target.value)}
            options={SUPPORT_TYPES}
          />

          <Label>Right Support:</Label>
          <Select
            value={form.rightSupport ?? "Roller"}
            onChange={e => updateField("rightSupport", e.target.value)}
            options={SUPPORT_TYPES}
          />
        </div>
      </div>

      {/* Bearing Length */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 14,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10 }}>Bearing Length:</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "220px 150px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 480,
        }}>
          <Label>Bearing Length Value (mm):</Label>
          <Input
            value={bearingLength}
            onChange={e => updateField("bearingLength", e.target.value)}
            placeholder="400"
          />
        </div>
      </div>

      {/* CAD Diagram Placeholder */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px",
        minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 10 }}>Support Condition Diagram</div>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-end", justifyContent: "center" }}>
          {/* Left support */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 60, height: 8, background: "#555",
              borderRadius: 2,
            }} />
            {(form.leftSupport ?? "Pinned") === "Pinned" ? (
              <svg width="40" height="30" viewBox="0 0 40 30">
                <polygon points="20,0 0,28 40,28" fill="#555" />
                <line x1="0" y1="30" x2="40" y2="30" stroke="#555" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="40" height="30" viewBox="0 0 40 30">
                <rect x="5" y="0" width="30" height="20" fill="#555" rx="2" />
                <circle cx="20" cy="25" r="5" fill="#555" />
                <line x1="0" y1="30" x2="40" y2="30" stroke="#555" strokeWidth="2" />
              </svg>
            )}
            <div style={{ fontSize: 10, color: "#666" }}>{form.leftSupport ?? "Pinned"}</div>
          </div>

          {/* Girder beam */}
          <div style={{
            flex: 1, height: 12, background: "#8a8a8a",
            borderRadius: 3, maxWidth: 200, position: "relative",
            marginBottom: 24,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}>
            <div style={{
              position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
              fontSize: 10, color: "#444", whiteSpace: "nowrap", fontStyle: "italic",
            }}>
              Bearing: {bearingLength}mm
            </div>
          </div>

          {/* Right support */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 60, height: 8, background: "#555", borderRadius: 2 }} />
            {(form.rightSupport ?? "Roller") === "Roller" ? (
              <svg width="40" height="30" viewBox="0 0 40 30">
                <polygon points="20,0 0,20 40,20" fill="#555" />
                <circle cx="10" cy="26" r="4" fill="#555" />
                <circle cx="30" cy="26" r="4" fill="#555" />
                <line x1="0" y1="30" x2="40" y2="30" stroke="#555" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="40" height="30" viewBox="0 0 40 30">
                <rect x="5" y="0" width="30" height="20" fill="#555" rx="2" />
                <circle cx="20" cy="25" r="5" fill="#555" />
                <line x1="0" y1="30" x2="40" y2="30" stroke="#555" strokeWidth="2" />
              </svg>
            )}
            <div style={{ fontSize: 10, color: "#666" }}>{form.rightSupport ?? "Roller"}</div>
          </div>
        </div>
      </div>
    </>
  );
}
