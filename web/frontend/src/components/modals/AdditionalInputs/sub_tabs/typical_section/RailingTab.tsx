import React from "react";
import { Label, Input, Select } from "../../SharedComponents";

interface RailingTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function RailingTab({ form, updateField }: RailingTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Railing Options:</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        rowGap: 14, columnGap: 30, alignItems: "center",
        maxWidth: 500,
      }}>
        <Label>Railing Type:</Label>
        <Select value={form.railingType} onChange={e => updateField("railingType", e.target.value)} options={["IRC 5 - RCC Railing", "IRC 5 - Steel Railing"]} />

        <Label>Railing Width (mm):</Label>
        <Input value={form.railingWidth} onChange={e => updateField("railingWidth", e.target.value)} />

        <Label>Railing Height (mm):</Label>
        <Input value={form.railingHeight} onChange={e => updateField("railingHeight", e.target.value)} />
      </div>
    </>
  );
}
