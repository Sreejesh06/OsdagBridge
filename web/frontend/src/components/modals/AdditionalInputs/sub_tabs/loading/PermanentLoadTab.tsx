import React from "react";
import { Label, Input, TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";

interface PermanentLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function PermanentLoadTab({ form, updateField }: PermanentLoadTabProps) {
  return (
    <TwoColumnLayout>
      <LeftColumn>
        <SectionBox title="Dead Load (DL)">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 180px",
            rowGap: 14, columnGap: 30, alignItems: "center",
          }}>
            <Label>Self-weight modification factor</Label>
            <Input
              value={form.selfWeightFactor ?? "1.00"}
              onChange={e => updateField("selfWeightFactor", e.target.value)}
            />
          </div>
        </SectionBox>
      </LeftColumn>
      
      <DescriptionBox>
        Self-weight of the structure is calculated automatically from section dimensions and material density. A modification factor can be applied if required.
      </DescriptionBox>
    </TwoColumnLayout>
  );
}
