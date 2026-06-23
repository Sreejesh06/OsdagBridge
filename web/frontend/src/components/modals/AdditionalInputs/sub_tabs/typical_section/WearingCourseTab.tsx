import React, { useState, useEffect } from "react";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface WearingCourseTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function WearingCourseTab({ form, updateField: parentUpdateField }: WearingCourseTabProps) {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("wearing_course_tab").then((data) => setSchema(data));
    });
  }, []);

  const updateField = (id: string, value: any) => {
    parentUpdateField(id, value);
    if (id === "wearing_material") {
      if (value === "Concrete") {
        parentUpdateField("wearing_density", "24.0");
      } else if (value === "Bituminous") {
        parentUpdateField("wearing_density", "22.0");
      } else {
        parentUpdateField("wearing_density", "");
      }
      if (!form.wearing_thickness) {
        parentUpdateField("wearing_thickness", "50");
      }
    }
  };

  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Wearing Course Inputs:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {schema?.rows?.map((row: any, rIdx: number) => (
          <DynamicSchemaRenderer
            key={rIdx}
            fields={row.fields}
            data={form}
            onChange={updateField}
            gridStyle={{ gridTemplateColumns: "180px 200px", maxWidth: 600 }}
          />
        ))}
      </div>
    </>
  );
}
