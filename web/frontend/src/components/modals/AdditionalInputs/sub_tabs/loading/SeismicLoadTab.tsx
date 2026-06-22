import React, { useState, useEffect } from "react";
import { TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface SeismicLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function SeismicLoadTab({ form, updateField }: SeismicLoadTabProps) {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("seismic_load_tab").then((data) => setSchema(data));
    });
  }, []);

  return (
    <TwoColumnLayout>
      <LeftColumn>
        {schema?.sections?.map((section: any, idx: number) => (
          <SectionBox title={section.title} key={idx}>
            <DynamicSchemaRenderer
              fields={section.fields || [section]}
              data={form}
              onChange={updateField}
            />
          </SectionBox>
        ))}
      </LeftColumn>

      <DescriptionBox>
        {schema?.description?.text || ""}
      </DescriptionBox>
    </TwoColumnLayout>
  );
}
