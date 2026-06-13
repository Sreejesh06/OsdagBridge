import React from "react";
import { Label, Input, Select } from "../../SharedComponents";

interface MedianTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function MedianTab({ form, updateField }: MedianTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Median Options:</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        rowGap: 14, columnGap: 30, alignItems: "center",
        maxWidth: 500,
      }}>
        <Label>Include Median:</Label>
        <input type="checkbox" checked={form.medianPresent} onChange={e => updateField("medianPresent", e.target.checked)} style={{ width: 18, height: 18 }} />

        <Label>Median Width (mm):</Label>
        <Input value={form.medianWidth} onChange={e => updateField("medianWidth", e.target.value)} disabled={!form.medianPresent} />

        <Label>Median Type:</Label>
        <Select value={form.medianType} onChange={e => updateField("medianType", e.target.value)} options={["Raised", "Flush"]} disabled={!form.medianPresent} />
      </div>
    </>
  );
}
