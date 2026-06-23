import React, { useState, useEffect } from "react";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface MedianTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function MedianTab({ form, updateField }: MedianTabProps) {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("median_tab").then((data) => setSchema(data));
    });
  }, []);

  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Median Inputs:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {schema?.rows?.map((row: any, rIdx: number) => {
          const filteredFields = row.fields.filter((f: any) => !f.id.includes("post_spacing"));
          if (filteredFields.length === 0) return null;
          return (
            <DynamicSchemaRenderer
              key={rIdx}
              fields={filteredFields}
              data={form}
              onChange={updateField}
              gridStyle={filteredFields.length > 1 ? { gridTemplateColumns: "180px 200px 100px 200px", columnGap: 24 } : { gridTemplateColumns: "180px 200px" }}
            />
          );
        })}
      </div>
    </>
  );
}
