import React from "react";

interface LaneDetailsTabProps {
  form: any;
}

export default function LaneDetailsTab({ form }: LaneDetailsTabProps) {
  return (
    <div style={{ padding: 10, border: "1px dashed #bbb", borderRadius: 8, background: "#fff", color: "#555" }}>
      <p style={{ fontWeight: 600, marginBottom: 8 }}>Automated Lane Layout</p>
      <p style={{ fontSize: 13, lineHeight: "18px" }}>
        Traffic lanes and carriage-way configurations are calculated dynamically according to IRC:6 codes. Overall width is {form.overallBridgeWidth} m, supporting up to {Math.max(1, Math.floor(Number(form.overallBridgeWidth) / 3.5))} design lanes.
      </p>
    </div>
  );
}
