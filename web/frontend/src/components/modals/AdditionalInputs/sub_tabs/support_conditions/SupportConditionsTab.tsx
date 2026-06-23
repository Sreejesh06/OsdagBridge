import React from "react";
import { Label, Input, Select } from "../../SharedComponents";
import { useBridgeStore } from "../../../../../store/bridgeStore";
import SupportCADWidget from "./SupportCADWidget";
import SupportDetailCADWidget from "./SupportDetailCADWidget";

const SUPPORT_TYPES = ["Fixed", "Pinned", "Roller"];

interface SupportConditionsTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function SupportConditionsTab({ form, updateField }: SupportConditionsTabProps) {
  const bearingLength = form.bearingLength ?? "400";
  const bridgeInput = useBridgeStore((state) => state.bridgeInput);

  // Parse bridge dimensions
  const spanLength = parseFloat(String(bridgeInput?.span_length || "35"));
  const numGirders = parseInt(String(bridgeInput?.num_girders || "4"), 10);
  const girderSpacing = parseFloat(String(bridgeInput?.girder_spacing || "2.75"));
  const bracingSpacing = parseFloat(String(bridgeInput?.cross_bracing_spacing || "3.5"));

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

      {/* CAD Diagram Section */}
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "10px",
        display: "flex", gap: "10px",
      }}>
        {/* Left CAD (Top View) */}
        <div style={{ flex: 1, height: 280, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee", borderRadius: 6, overflow: "hidden" }}>
          <SupportCADWidget
            spanLength={spanLength}
            numGirders={numGirders}
            girderSpacing={girderSpacing}
            bracingSpacing={bracingSpacing}
          />
        </div>

        {/* Right CAD (Side Bearing Detail) */}
        <div style={{ flex: 1, height: 280, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee", borderRadius: 6, overflow: "hidden" }}>
          <SupportDetailCADWidget bearingLength={parseFloat(bearingLength)} />
        </div>
      </div>
    </>
  );
}
