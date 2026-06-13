import React from "react";
import { Label, Input } from "../../SharedComponents";

interface WearingCourseTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function WearingCourseTab({ form, updateField }: WearingCourseTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Wearing Course Parameters:</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        rowGap: 14, columnGap: 30, alignItems: "center",
        maxWidth: 500,
      }}>
        <Label>Wearing Course Thickness (mm):</Label>
        <Input value={form.wearingCourseThickness} onChange={e => updateField("wearingCourseThickness", e.target.value)} />
      </div>
    </>
  );
}
