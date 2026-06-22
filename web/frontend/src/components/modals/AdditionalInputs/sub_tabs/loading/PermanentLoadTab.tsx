import React, { useState, useEffect } from "react";
import { TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface PermanentLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function PermanentLoadTab({ form, updateField }: PermanentLoadTabProps) {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("permanent_load_tab").then((data) => setSchema(data));
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
        Self-weight of the structure is calculated automatically from section dimensions and material density. A modification factor can be applied if required.
      </DescriptionBox>
    </TwoColumnLayout>
  );
}
