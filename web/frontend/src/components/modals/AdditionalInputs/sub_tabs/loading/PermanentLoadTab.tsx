import React from "react";
import { Label, Input } from "../../SharedComponents";

interface PermanentLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function PermanentLoadTab({ form, updateField }: PermanentLoadTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Dead Load (DL):</div>
      <div style={{
        border: "1px solid #ccc", borderRadius: 8,
        background: "#fff", padding: "14px 18px", marginBottom: 16,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 200px",
          rowGap: 14, columnGap: 30, alignItems: "center",
          maxWidth: 540,
        }}>
          <Label>Self-weight modification factor:</Label>
          <Input
            value={form.selfWeightFactor ?? "1.00"}
            onChange={e => updateField("selfWeightFactor", e.target.value)}
          />
        </div>
      </div>

      <div style={{ fontSize: 12, fontStyle: "italic", color: "#666", marginTop: 8 }}>
        Self-weight of the structure is calculated automatically from section dimensions and material density.
        A modification factor can be applied if required.
      </div>
    </>
  );
}
