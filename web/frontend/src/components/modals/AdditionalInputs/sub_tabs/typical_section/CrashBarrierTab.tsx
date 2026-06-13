import React from "react";
import { Label, Input, Select } from "../../SharedComponents";

interface CrashBarrierTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function CrashBarrierTab({ form, updateField }: CrashBarrierTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Crash Barrier Options:</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        rowGap: 14, columnGap: 30, alignItems: "center",
        maxWidth: 500,
      }}>
        <Label>Crash Barrier Width (mm):</Label>
        <Input value={form.crashBarrierWidth} onChange={e => updateField("crashBarrierWidth", e.target.value)} />

        <Label>Crash Barrier Type:</Label>
        <Select value={form.crashBarrierType} onChange={e => updateField("crashBarrierType", e.target.value)} options={["PL-1", "PL-2", "PL-3"]} />
      </div>
    </>
  );
}
