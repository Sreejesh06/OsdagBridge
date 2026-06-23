import React, { useState, useEffect } from "react";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface LaneDetailsTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function LaneDetailsTab({ form, updateField }: LaneDetailsTabProps) {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("lane_details_tab").then((data) => setSchema(data));
    });
  }, []);

  const numLanes = parseInt(form.lane_count_combo || "1", 10);
  const lanes = Array.from({ length: numLanes }).map((_, i) => ({
    id: i + 1,
    distance: (i * 3.5).toFixed(2),
    width: "3.50",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>Inputs:</div>
      <div>
        {schema?.rows?.map((row: any, rIdx: number) => (
          <DynamicSchemaRenderer
            key={rIdx}
            fields={row.fields}
            data={form}
            onChange={updateField}
            gridStyle={{ gridTemplateColumns: "180px 200px" }}
          />
        ))}
      </div>

      <div style={{ border: "1px solid #dcdcdc", borderRadius: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f4f4f4" }}>
              <th style={{ padding: "10px", borderBottom: "1px solid #dcdcdc", borderRight: "1px solid #dcdcdc", fontWeight: 700, width: "150px" }}>Traffic Lane Number</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #dcdcdc", borderRight: "1px solid #dcdcdc", fontWeight: 700 }}>Distance from inner edge of crash barrier to left edge of lane (m)</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #dcdcdc", fontWeight: 700, width: "150px" }}>Lane Width (m)</th>
            </tr>
          </thead>
          <tbody>
            {lanes.map((lane) => (
              <tr key={lane.id} style={{ background: "#ffffff" }}>
                <td style={{ padding: "10px", borderBottom: "1px solid #dcdcdc", borderRight: "1px solid #dcdcdc" }}>{lane.id}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #dcdcdc", borderRight: "1px solid #dcdcdc" }}>{lane.distance}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #dcdcdc" }}>{lane.width}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Fill remaining empty space simulating desktop widget empty area */}
        <div style={{ height: "120px", background: "#ffffff" }} />
      </div>
    </div>
  );
}
