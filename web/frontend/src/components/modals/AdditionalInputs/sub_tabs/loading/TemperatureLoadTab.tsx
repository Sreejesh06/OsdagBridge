import React from "react";
import { Label, Input, TwoColumnLayout, LeftColumn, DescriptionBox, SectionBox } from "../../SharedComponents";

interface TemperatureLoadTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

function ReadOnlyInput({ value, placeholder }: { value: string; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      readOnly
      placeholder={placeholder}
      style={{
        width: "100%", height: 28, borderRadius: 5, border: "1px solid #000",
        padding: "0 8px", fontSize: 12,
        background: "#f6f6f6", color: "#555",
        outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

export default function TemperatureLoadTab({ form, updateField }: TemperatureLoadTabProps) {
  return (
    <TwoColumnLayout>
      <LeftColumn>
        {/* Inputs Section */}
        <SectionBox title="Temperature Load (TL) Inputs for Evaluation per IRC6">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            rowGap: 12, columnGap: 30, alignItems: "center",
          }}>
            <Label>Highest Maximum Air Temperature (°C)</Label>
            <ReadOnlyInput value={form.highestMaxTemp ?? ""} placeholder="From Project Location" />

            <Label>Lowest Minimum Air Temperature (°C)</Label>
            <ReadOnlyInput value={form.lowestMinTemp ?? ""} placeholder="From Project Location" />

            <Label>Coefficient of Thermal Expansion for Steel (1/°C)</Label>
            <Input value={form.thermalCoeffSteel ?? "12.0e-6"} onChange={e => updateField("thermalCoeffSteel", e.target.value)} />

            <Label>Coefficient of Thermal Expansion for RCC (1/°C)</Label>
            <Input value={form.thermalCoeffRCC ?? "12.0e-6"} onChange={e => updateField("thermalCoeffRCC", e.target.value)} />
          </div>
        </SectionBox>

        {/* Range of Effective Bridge Temperature */}
        <SectionBox title="Range of Effective Bridge Temperature:">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            rowGap: 12, columnGap: 30, alignItems: "center",
          }}>
            <Label>Minimum (°C)</Label>
            <ReadOnlyInput value={form.bridgeTempMin ?? ""} />

            <Label>Maximum (°C)</Label>
            <ReadOnlyInput value={form.bridgeTempMax ?? ""} />
          </div>
        </SectionBox>

        {/* Temperature for Design */}
        <SectionBox title="Temperature for Design">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            rowGap: 12, columnGap: 30, alignItems: "center",
          }}>
            <Label>Rise (°C)</Label>
            <ReadOnlyInput value={form.tempRise ?? ""} />

            <Label>Fall (°C)</Label>
            <ReadOnlyInput value={form.tempFall ?? ""} />
          </div>
        </SectionBox>
      </LeftColumn>

      <DescriptionBox>
        Temperature load depends on the bridge location. Maximum and minimum temperature limits are fetched automatically.
      </DescriptionBox>
    </TwoColumnLayout>
  );
}
