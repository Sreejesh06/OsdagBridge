import React from "react";
import { Label, Input } from "../../SharedComponents";

interface LayoutTabProps {
  form: any;
  updateField: (field: string, value: any) => void;
}

export default function LayoutTab({ form, updateField }: LayoutTabProps) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>Layout Parameters:</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px 1fr 200px",
        rowGap: 14, columnGap: 30, alignItems: "center",
      }}>
        <Label>Girder Spacing (m):</Label>
        <Input value={form.girderSpacing} onChange={e => updateField("girderSpacing", e.target.value)} />

        <Label>No. of Girders:</Label>
        <Input value={form.noOfGirders} onChange={e => updateField("noOfGirders", e.target.value)} />

        <Label>Deck Overhang Width (m):</Label>
        <Input value={form.deckOverhangWidth} onChange={e => updateField("deckOverhangWidth", e.target.value)} />

        <div style={{ fontSize: 12, fontStyle: "italic", color: "#666" }}>Values adjusted for:</div>
        <div />

        <Label>Overall Bridge Width (m):</Label>
        <Input value={form.overallBridgeWidth} onChange={e => updateField("overallBridgeWidth", e.target.value)} />

        <div /><div />

        <Label>Deck Thickness (mm):</Label>
        <Input value={form.deckThickness} onChange={e => updateField("deckThickness", e.target.value)} />

        <div /><div />

        <Label>Footpath Thickness (mm):</Label>
        <Input value={form.footpathThickness} onChange={e => updateField("footpathThickness", e.target.value)} />

        <Label>Footpath Width (m):</Label>
        <Input value={form.footpathWidth} onChange={e => updateField("footpathWidth", e.target.value)} />
      </div>
    </>
  );
}
