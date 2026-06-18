import React from "react";
import { Label, Input, Select } from "../../SharedComponents";

const CONSTRUCTION_STAGES = ["Yes", "No"];
const REINFORCEMENT_MATERIALS = [
  "Fe 415", "Fe 415D", "Fe 500", "Fe 500D", "Fe 550", "Fe 550D", "Fe 600",
];
const SHEAR_STUD_DIAMETERS = ["12", "16", "20", "22", "25"];
const SHEAR_STUD_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

interface DesignOptionsTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

function SectionCard({
  title, children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid #ccc", borderRadius: 8,
      background: "#fff", padding: "14px 18px", marginBottom: 14,
    }}>
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 12, color: "#2b2b2b" }}>{title}</div>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <Label>{label}:</Label>
      <div>{children}</div>
    </>
  );
}

export default function DesignOptionsTab({ form, updateField }: DesignOptionsTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Analysis / Design Options:</div>

      {/* Construction Stages */}
      <SectionCard title="Construction Stages">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 180px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 500,
        }}>
          <FieldRow label="Include automatic construction stages">
            <Select
              value={form.constructionStage ?? "Yes"}
              onChange={e => updateField("constructionStage", e.target.value)}
              options={CONSTRUCTION_STAGES}
            />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Deck Design */}
      <SectionCard title="Deck Design">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 180px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 540,
        }}>
          <FieldRow label="Reinforcement Material">
            <Select
              value={form.reinforcementMaterial ?? "Fe 500"}
              onChange={e => updateField("reinforcementMaterial", e.target.value)}
              options={REINFORCEMENT_MATERIALS}
            />
          </FieldRow>
          <FieldRow label="Top Clear Cover (mm)">
            <Input
              value={form.topClearCover ?? "50"}
              onChange={e => updateField("topClearCover", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Bottom Clear Cover (mm)">
            <Input
              value={form.bottomClearCover ?? "40"}
              onChange={e => updateField("bottomClearCover", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Side Clear Cover (mm)">
            <Input
              value={form.sideClearCover ?? "40"}
              onChange={e => updateField("sideClearCover", e.target.value)}
            />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Shear Studs */}
      <SectionCard title="Shear Studs">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 180px",
          rowGap: 12, columnGap: 30, alignItems: "center",
          maxWidth: 540,
        }}>
          <FieldRow label="Yield Strength (MPa)">
            <Input
              value={form.shearStudYieldStrength ?? "385.00"}
              onChange={e => updateField("shearStudYieldStrength", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Ultimate Strength (MPa)">
            <Input
              value={form.shearStudUltimateStrength ?? "495.00"}
              onChange={e => updateField("shearStudUltimateStrength", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Diameter (mm)">
            <Select
              value={form.shearStudDiameter ?? "20"}
              onChange={e => updateField("shearStudDiameter", e.target.value)}
              options={SHEAR_STUD_DIAMETERS}
            />
          </FieldRow>
          <FieldRow label="Height (mm)">
            <Input
              value={form.shearStudHeight ?? "100.00"}
              onChange={e => updateField("shearStudHeight", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="No. of Shear Studs per Section">
            <Select
              value={form.shearStudCount ?? "2"}
              onChange={e => updateField("shearStudCount", e.target.value)}
              options={SHEAR_STUD_COUNTS}
            />
          </FieldRow>
          <FieldRow label="Transverse Spacing (mm)">
            <Input
              value={form.shearStudTransverseSpacing ?? "100.00"}
              onChange={e => updateField("shearStudTransverseSpacing", e.target.value)}
            />
          </FieldRow>
        </div>
      </SectionCard>
    </>
  );
}
