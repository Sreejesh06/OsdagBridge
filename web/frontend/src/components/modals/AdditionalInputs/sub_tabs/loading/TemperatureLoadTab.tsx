import React, { useState, useEffect } from "react";
import { TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";
import { DynamicSchemaRenderer } from "../../DynamicSchemaRenderer";

interface TemperatureLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function TemperatureLoadTab({ form, updateField }: TemperatureLoadTabProps) {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    import("../../../../../services/schemaService").then((service) => {
      service.getSchema("temperature_load_tab").then((data) => setSchema(data));
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
        {schema?.description?.text || "Temperature load depends on the bridge location. Maximum and minimum temperature limits are fetched automatically."}
      </DescriptionBox>
    </TwoColumnLayout>
  );
}
