import React, { useState, useEffect } from "react";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface LayoutTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function LayoutTab({ form, updateField }: LayoutTabProps) {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("layout_tab").then((data) => setSchema(data));
    });
  }, []);

  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Inputs:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {schema?.rows?.map((row: any, rIdx: number) => (
          <DynamicSchemaRenderer
            key={rIdx}
            fields={row.fields}
            data={form}
            onChange={updateField}
            gridStyle={row.fields.length > 1 ? { gridTemplateColumns: "180px 180px 140px 180px", columnGap: 24 } : { gridTemplateColumns: "180px 180px" }}
          />
        ))}
      </div>
    </>
  );
}
