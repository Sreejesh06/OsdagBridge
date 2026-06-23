import React, { useState, useEffect } from "react";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface RailingTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function RailingTab({ form, updateField }: RailingTabProps) {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("railing_tab").then((data) => setSchema(data));
    });
  }, []);

  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Railing Inputs:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {schema?.rows?.map((row: any, rIdx: number) => (
          <DynamicSchemaRenderer
            key={rIdx}
            fields={row.fields}
            data={form}
            onChange={updateField}
            gridStyle={row.fields.length > 1 ? { gridTemplateColumns: "180px 200px 100px 200px", columnGap: 24 } : { gridTemplateColumns: "180px 200px" }}
          />
        ))}
      </div>
    </>
  );
}
